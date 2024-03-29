/** @type {import("../gameHandler").Game} */

import type { AlbumInfo } from "$data/albumpool";
import type { Canvas, Image } from "canvas";
import { createCanvas } from "canvas";
import type { GameInstance } from "../gameHandler";
import { CANVAS_SIZE } from "../gameHandler";
import { seededRNG } from "../rng";
import Matter, { Engine } from "matter-js";
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
const PHYS_RND_VEL = 3;
const PHYS_RND_ANGLE = 0.1;
const composites: Composite[] = [];
let lastFailed = 0;

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

    const currentCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const physicsCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    let engine: Engine;

    if (typeof requestAnimationFrame !== "undefined") {
        // custom renderer because the matter.js renderer will draw sprites past body boundaries
        // after rendering physics objects, the current step is drawn on top
        const physicsCtx = physicsCanvas.getContext("2d");
        function render() {
            physicsCtx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            try {
                for (const comp of engine.world.composites) {
                    for (const body of comp.bodies) {
                        const bodyProps = <BodyWithExtraProps>body;

                        physicsCtx.save();
                        physicsCtx.translate(body.position.x, body.position.y);
                        physicsCtx.rotate(body.angle);
                        physicsCtx.drawImage(
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
                        physicsCtx.restore();
                    }
                }
            } catch (e) {
                // safety guard: if physics object rendering fails, player will still see current step
                console.error(e);
                physicsCtx.restore();
            }

            physicsCtx.globalAlpha = lastFailed > 0 ? 0.6 : 0;
            physicsCtx.fillStyle = "black";
            physicsCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
            physicsCtx.globalAlpha = 1;
            physicsCtx.drawImage(currentCanvas, 0, 0);

            requestAnimationFrame(render);
        }
        requestAnimationFrame(render);

        try {
            // set up matter.js
            engine = Matter.Engine.create();

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
                        collisionFilter: { category: 2, mask: 3 },
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
                mouse: Matter.Mouse.create(<HTMLCanvasElement>(<unknown>physicsCanvas)),
                constraint: {
                    stiffness: 0.2,
                    render: {
                        visible: false,
                    },
                },
                collisionFilter: { mask: 2 },
            });
            Matter.Composite.add(engine.world, mouseConstraint);

            var runner = Matter.Runner.create();
            Matter.Runner.run(runner, engine);
        } catch (e) {
            // safety guard: if matter.js initialization fails, player can still play
            console.error(e);
        }
    }

    const getCanvasForGuess = (failed: number): Canvas => {
        lastFailed = failed;

        // draw the current step as usual
        const ctx = currentCanvas.getContext("2d");
        ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        if (failed > 0) {
            for (let i = failed === 0 ? 0 : AMOUNT[failed - 1]; i < AMOUNT[failed]; i++) {
                const p = positions[i];
                const px = p % TILES_PER_AXIS;
                const py = Math.floor(p / TILES_PER_AXIS);
                const x = TILE_POS[px];
                const y = TILE_POS[py];
                const w = TILE_POS[px + 1] - x;
                const h = TILE_POS[py + 1] - y;
                ctx.drawImage(scaledImage, x - 1, y - 1, w + 1, h + 1, x - 1, y - 1, w + 1, h + 1);
            }
        }

        try {
            // make old tiles fall.
            // docs say do not use .isStatic directly, but it doesn't work correctly with Body.setStatic, so eh
            for (const comp of composites.slice(0, failed)) {
                for (const body of comp.bodies) {
                    body.isStatic = false;
                }
            }

            // remove before adding to make sure only one instance of the composite is in the world
            // otherwise, gravity force is applied multiple times
            Matter.Composite.remove(engine.world, composites);

            if (failed > 0) {
                // gives tiles that are now falling a little bit of random velocity for some chaos
                Matter.Composite.add(engine.world, composites.slice(0, failed));
                for (const body of composites[failed - 1].bodies) {
                    Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * PHYS_RND_VEL, y: 0 });
                    Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * PHYS_RND_ANGLE);
                }
            } else {
                // turn 0 treated differently: after two seconds, drop a single tile, so even people who get the first
                // guess right get to see something weird
                Matter.Composite.add(engine.world, composites[0]);
                for (const body of composites[0].bodies) {
                    body.isStatic = true;
                }
                setTimeout(() => {
                    const body = composites[0].bodies[5];
                    if (body.isStatic) {
                        body.isStatic = false;
                        Matter.Body.setVelocity(body, { x: (Math.random() - 0.5) * PHYS_RND_VEL, y: 0 });
                        Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * PHYS_RND_ANGLE);
                    }
                }, 2000);
            }

            // reset positions for current step so they fall from the right position
            for (const body of composites[failed].bodies) {
                Matter.Body.setPosition(body, (<BodyWithExtraProps>body)._resetPos!);
                Matter.Body.setAngle(body, 0);
            }
        } catch (e) {
            // safety guard: if matter.js updating fails, player can still play
            console.error(e);
        }

        return physicsCanvas;
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
