/** @type {import("../gameHandler").Game} */

import type {AlbumInfo} from "$data/albumpool";
import type {Canvas, Image} from "canvas";
import {createCanvas} from "canvas";
import type {GameInstance} from "../gameHandler";
import {CANVAS_SIZE} from "../gameHandler";
import {seededRNG} from "../rng";

export const stacked = false;
export const hasAltFinished = false;
export const forceAltFinished = false;

const TILES_PER_AXIS = 128;
const TOTAL_TILES = TILES_PER_AXIS * TILES_PER_AXIS;
const MAX_DISTS = [96, 60, 28, 16, 8, 3];

const TILE_ORDER: number[] = [];
const TILE_ORDER_QUEUE = [Math.floor(TILES_PER_AXIS / 2)];
const TILE_ORDER_SEEN = new Set<number>();

function test(pos) {
    if (TILE_ORDER_SEEN.has(pos)) return;
    TILE_ORDER_SEEN.add(pos);
    TILE_ORDER_QUEUE.push(pos);
}

while (TILE_ORDER_QUEUE.length > 0) {
    const pos = TILE_ORDER_QUEUE.shift();
    TILE_ORDER.push(pos);
    if ((pos % TILES_PER_AXIS) > 0) test(pos - 1);
    if (pos >= TILES_PER_AXIS) test(pos - TILES_PER_AXIS);
    if ((pos % TILES_PER_AXIS) < TILES_PER_AXIS - 1) test(pos + 1);
    if (pos < TILES_PER_AXIS * (TILES_PER_AXIS - 1)) test(pos + TILES_PER_AXIS);
}

function getPosInCanvas(p: number) {
    return Math.floor(CANVAS_SIZE * p / TILES_PER_AXIS);
}

export function getGameInstance(day: number, _album: AlbumInfo, _image: Image, scaledImage: Canvas): GameInstance {
    const getCanvasForGuess = (failed: number): Canvas => {
        const rng = seededRNG(day * 461 * failed);
        const maxDist = MAX_DISTS[failed];
        const tilesPerPosition = new Array(TOTAL_TILES).fill(undefined).map((_, i) => i);
        const swapped = tilesPerPosition.map(_ => false);

        for (const tileToSwap of TILE_ORDER) {
            if (swapped[tileToSwap]) continue;
            const tileX = tileToSwap % TILES_PER_AXIS;
            const tileY = Math.floor(tileToSwap / TILES_PER_AXIS);

            let tries = maxDist, x, y, otherTile = tileToSwap;
            while (tries > 0) {
                let testTile;
                do {
                    const xD = Math.floor(rng() * (maxDist + 1)) * (rng() < 0.5 ? -1 : 1);
                    const yD = Math.floor(rng() * ((maxDist - Math.abs(xD)) + 1)) * (rng() < 0.5 ? -1 : 1);
                    x = tileX + xD;
                    y = tileY + yD;
                    testTile = y * TILES_PER_AXIS + x;
                } while (x < 0 || y < 0 || x >= TILES_PER_AXIS || y >= TILES_PER_AXIS);

                if (!swapped[testTile]) {
                    otherTile = testTile;
                    break;
                }
                tries--;
            }

            tilesPerPosition[otherTile] = tileToSwap;
            tilesPerPosition[tileToSwap] = otherTile;
            swapped[tileToSwap] = swapped[otherTile] = true;
        }

        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < TOTAL_TILES; i++) {
            const tile = tilesPerPosition[i];
            const sx = getPosInCanvas(tile % TILES_PER_AXIS);
            const sy = getPosInCanvas(Math.floor(tile / TILES_PER_AXIS));
            const sw = getPosInCanvas((tile % TILES_PER_AXIS) + 1) - sx;
            const sh = getPosInCanvas(Math.floor(tile / TILES_PER_AXIS) + 1) - sy;

            const dx = getPosInCanvas(i % TILES_PER_AXIS);
            const dy = getPosInCanvas(Math.floor(i / TILES_PER_AXIS));
            const dw = getPosInCanvas((i % TILES_PER_AXIS) + 1) - dx;
            const dh = getPosInCanvas(Math.floor(i / TILES_PER_AXIS) + 1) - dy;

            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(scaledImage, sx, sy, sw, sh, dx, dy, dw, dh);
            if (CANVAS_SIZE % TILES_PER_AXIS !== 0) {
                // Avoid gaps
                ctx.globalCompositeOperation = "destination-over";
                ctx.drawImage(scaledImage, sx - 1, sy - 1, sw + 2, sh + 2, dx - 1, dy - 1, dw + 2, dh + 2);
            }
        }

        return canvas;
    };
    const getShareCanvas = (): Canvas => {
        const fullCanvas = getCanvasForGuess(0);
        const canvas = createCanvas(CANVAS_SIZE / 4, CANVAS_SIZE / 4);
        canvas.getContext("2d").drawImage(fullCanvas,
            CANVAS_SIZE * 0.375, CANVAS_SIZE * 0.375, CANVAS_SIZE / 4, CANVAS_SIZE / 4,
            0, 0, CANVAS_SIZE / 4, CANVAS_SIZE / 4);
        return canvas;
    };
    return {getCanvasForGuess, getShareCanvas}
}