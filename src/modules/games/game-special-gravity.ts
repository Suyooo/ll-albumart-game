/** @type {import("../gameHandler").Game} */

import type { AlbumInfo } from "$data/albumpool";
import type { Canvas, Image } from "canvas";
import { createCanvas } from "canvas";
import type { GameInstance } from "../gameHandler";
import { CANVAS_SIZE } from "../gameHandler";
import { seededRNG } from "../rng";
import Matter from "matter-js";
import { type Body, type Composite, type Vector } from "matter-js";

export const stacked = false;
export const hasAltFinished = false;
export const forceAltFinished = false;

type BodyWithExtraProps = Body & { _resetPos: Vector; _tileX: number; _tileY: number; _tileW: number; _tileH: number };

const TILES_PER_AXIS = 12;
const TILES_TOTAL = TILES_PER_AXIS * TILES_PER_AXIS;
const TILE_POS = new Array(TILES_PER_AXIS + 1).fill(0).map((_, i) => Math.floor((CANVAS_SIZE * i) / TILES_PER_AXIS));
const SHARE_GAP = 10;

const PHYS_WALL = 200;
const PHYS_RND_VEL = 0.2;
const PHYS_RND_ANGLE = 0.05;
const composites: Composite[] = [];

const AMOUNT = [6, 15, 30, 50, 70, 120];
const MAX_AMOUNT = AMOUNT.at(-1)!;

export function getGameInstance(day: number, album: AlbumInfo, _image: Image, scaledImage: Canvas): GameInstance {
    const rng = seededRNG(day * 95);
    const positions: number[] = [];
    for (let i = 0; i < MAX_AMOUNT; i++) {
        let p: number;
        do {
            p = Math.floor(TILES_TOTAL * rng());
        } while (positions.indexOf(p) !== -1);
        positions.push(p);
    }

    // set up matter.js
    const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const engine = Matter.Engine.create();

    if (typeof requestAnimationFrame !== "undefined") {
        // walls
        Matter.Composite.add(engine.world, [
            Matter.Bodies.rectangle(-PHYS_WALL / 2, CANVAS_SIZE / 2, PHYS_WALL, CANVAS_SIZE + PHYS_WALL * 2, {
                isStatic: true,
            }),
            Matter.Bodies.rectangle(
                CANVAS_SIZE + PHYS_WALL / 2,
                CANVAS_SIZE / 2,
                PHYS_WALL,
                CANVAS_SIZE + PHYS_WALL * 2,
                {
                    isStatic: true,
                }
            ),
            Matter.Bodies.rectangle(CANVAS_SIZE / 2, -PHYS_WALL / 2, CANVAS_SIZE, PHYS_WALL, {
                isStatic: true,
            }),
            Matter.Bodies.rectangle(CANVAS_SIZE / 2, CANVAS_SIZE + PHYS_WALL / 2, CANVAS_SIZE, PHYS_WALL, {
                isStatic: true,
            }),
        ]);

        // tiles
        let posIdx = 0;
        for (let i = 0; i < 6; i++) {
            const comp = Matter.Composite.create();

            while (posIdx < AMOUNT[i]) {
                const p = positions[posIdx];
                const px = p % TILES_PER_AXIS;
                const py = Math.floor(p / TILES_PER_AXIS);
                const x = TILE_POS[px];
                const y = TILE_POS[py];
                const w = TILE_POS[px + 1] - x;
                const h = TILE_POS[py + 1] - y;

                const body: Partial<BodyWithExtraProps> = Matter.Bodies.rectangle(x + w / 2, y + h / 2, w, h, {
                    collisionFilter: { category: 0, mask: 3 },
                    render: {
                        fillStyle: `red`,
                    },
                    restitution: 0.5,
                });
                body._resetPos = { x: x + w / 2, y: y + h / 2 };
                body._tileX = x;
                body._tileY = y;
                body._tileW = w;
                body._tileH = h;
                Matter.Composite.add(comp, <BodyWithExtraProps>body);

                posIdx++;
            }
            composites.push(comp);
        }

        // add mouse control
        const mouseConstraint = Matter.MouseConstraint.create(engine, {
            mouse: Matter.Mouse.create(<HTMLCanvasElement>(<unknown>canvas)),
            constraint: {
                stiffness: 0.2,
                render: {
                    visible: false,
                },
            },
            collisionFilter: { mask: 2 },
        });
        Matter.Composite.add(engine.world, mouseConstraint);

        // custom renderer because the matter.js renderer will draw sprites past body boundaries
        const ctx = canvas.getContext("2d");
        function render() {
            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            for (const comp of engine.world.composites) {
                ctx.globalAlpha = comp.bodies[0].isStatic ? 1 : 0.5;
                for (const body of comp.bodies) {
                    const bodyProps = <BodyWithExtraProps>body;

                    ctx.save();
                    ctx.translate(body.position.x, body.position.y);
                    ctx.rotate(body.angle);
                    ctx.drawImage(
                        scaledImage,
                        bodyProps._tileX - 1,
                        bodyProps._tileY - 1,
                        bodyProps._tileW + 1,
                        bodyProps._tileH + 1,
                        -(bodyProps._tileW + 1) / 2,
                        -(bodyProps._tileH + 1) / 2,
                        bodyProps._tileW + 1,
                        bodyProps._tileH + 1
                    );
                    ctx.restore();
                }
            }
            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);

        //Matter.Render.run(render);
        var runner = Matter.Runner.create();
        Matter.Runner.run(runner, engine);
    }

    const getCanvasForGuess = (failed: number): Canvas => {
        // make old tiles fall.
        // docs say do not use .isStatic directly, but it doesn't work correctly with Body.setStatic, so eh
        for (const comp of composites.slice(0, failed)) {
            for (const body of comp.bodies) {
                body.isStatic = false;
                body.collisionFilter.category = 2;
            }
        }

        // gives tiles that are now falling a little bit of random velocity for some chaos
        if (failed > 0) {
            for (const body of composites[failed - 1].bodies) {
                Matter.Body.setVelocity(body, {
                    x: (Math.random() - 0.5) * PHYS_RND_VEL,
                    y: (Math.random() - 0.5) * PHYS_RND_VEL,
                });
                Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * PHYS_RND_ANGLE);
            }
        }

        // make tiles from this turn show and reset position
        for (const body of composites[failed].bodies) {
            body.isStatic = true;
            body.collisionFilter.category = 0;
            Matter.Body.setPosition(body, (<BodyWithExtraProps>body)._resetPos!);
            Matter.Body.setAngle(body, 0);
            Matter.Body.setVelocity(body, { x: 0, y: 0 });
            Matter.Body.setAngularVelocity(body, 0);
        }

        // remove before adding to make sure only one instance of the composite is in the world
        // otherwise, gravity force is applied multiple times
        Matter.Composite.remove(engine.world, composites.slice(failed));
        Matter.Composite.add(engine.world, composites[failed]);

        return canvas;
    };

    const getShareCanvas = (): Canvas => {
        const tileSize = CANVAS_SIZE / TILES_PER_AXIS;
        const canvas = createCanvas(tileSize * 3 + SHARE_GAP * 4, tileSize * 3 + SHARE_GAP * 4);
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < 5; i++) {
            const x = TILE_POS[positions[i] % TILES_PER_AXIS];
            const y = TILE_POS[Math.floor(positions[i] / TILES_PER_AXIS)];
            const cx = i % 3;
            const cy = Math.floor(i / 3) + 0.5;
            ctx.drawImage(
                scaledImage,
                x,
                y,
                tileSize,
                tileSize,
                Math.floor(cx * (tileSize + SHARE_GAP) + SHARE_GAP),
                Math.floor(cy * (tileSize + SHARE_GAP) + SHARE_GAP),
                tileSize,
                tileSize
            );
        }

        // draw the sixth tile at an angle
        const x = TILE_POS[positions[5] % TILES_PER_AXIS];
        const y = TILE_POS[Math.floor(positions[5] / TILES_PER_AXIS)];
        const cx = 2.25;
        const cy = Math.floor(5 / 3) + 0.6;
        ctx.translate(
            Math.floor(cx * (tileSize + SHARE_GAP) + SHARE_GAP),
            Math.floor(cy * (tileSize + SHARE_GAP) + SHARE_GAP)
        );
        ctx.rotate(0.3);
        ctx.drawImage(scaledImage, x, y, tileSize, tileSize, 0, 0, tileSize, tileSize);

        return canvas;
    };
    return { getCanvasForGuess, getShareCanvas };
}
