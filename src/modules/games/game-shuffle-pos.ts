/** @type {import("../gameHandler").Game} */

import type {AlbumInfo} from "$data/albumpool";
import type {Canvas, Image} from "canvas";
import {createCanvas} from "canvas";
import type {GameInstance} from "../gameHandler";
import {CANVAS_SIZE} from "../gameHandler";
import {seededRNG} from "../rng";

export const stacked = true;
export const hasAltFinished = false;
export const forceAltFinished = false;

const TILES_PER_AXIS = 128;
const TOTAL_TILES = TILES_PER_AXIS * TILES_PER_AXIS;
const MAX_DISTS = [256, 64, 32, 12, 6, 3];

function getPosInCanvas(p: number) {
    return Math.floor(CANVAS_SIZE * p / TILES_PER_AXIS);
}

export function getGameInstance(day: number, _album: AlbumInfo, _image: Image, scaledImage: Canvas): GameInstance {
    const getCanvasForGuess = (failed: number): Canvas => {
        const rng = seededRNG(day * 461 * failed);
        const maxDist = MAX_DISTS[failed];

        const tilesPerPosition = new Array(TOTAL_TILES).fill(-1);
        const queue = tilesPerPosition.map((_, i) => i);
        const maxTries = maxDist;

        while (queue.length > 0) {
            const tileToShuffle = queue.shift();
            const tileX = tileToShuffle % TILES_PER_AXIS;
            const tileY = Math.floor(tileToShuffle / TILES_PER_AXIS);

            let tries = 0;
            let pos;
            while (tries < maxTries) {
                tries++;
                let x, y;
                do {
                    const xD = Math.floor(rng() * (maxDist + 1)) * (rng() < 0.5 ? -1 : 1);
                    const yD = Math.floor(rng() * ((maxDist - Math.abs(xD)) + 1)) * (rng() < 0.5 ? -1 : 1);
                    x = tileX + xD;
                    y = tileY + yD;
                } while (x < 0 || y < 0 || x >= TILES_PER_AXIS || y >= TILES_PER_AXIS);

                pos = y * TILES_PER_AXIS + x;
                if (pos >= tilesPerPosition.length) throw new Error("fuck ya");
                if (tilesPerPosition[pos] === -1) {
                    break;
                }
            }

            if (tilesPerPosition[pos] !== -1) {
                queue.push(tilesPerPosition[pos]);
            }
            tilesPerPosition[pos] = tileToShuffle;
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