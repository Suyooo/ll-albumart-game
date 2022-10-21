/** @type {import("../games").Game} */

import type {Canvas, Image} from "canvas";
import {createCanvas} from "canvas";
import type {Album} from "$data/albumpool";
import type {GameInstance} from "../games";
import {CANVAS_SIZE} from "../games";
import {seededRNG} from "../rng";

export const name = "Tiles";
export const stacked = true;

const TILES_PER_AXIS = 20;
const TILES_TOTAL = TILES_PER_AXIS * TILES_PER_AXIS;
const TILE_POS = new Array(TILES_PER_AXIS + 1).fill(0).map((_, i) =>
    Math.floor(CANVAS_SIZE * i / TILES_PER_AXIS));

const AMOUNT = [9, 20, 40, 60, 80, 100];
const MAX_AMOUNT = AMOUNT.reduce((max, cur) => cur > max ? cur : max, 0);

export function getGameInstance(day: number, _album: Album, _image: Image, scaledImage: Canvas): GameInstance {
    const rng = seededRNG(day * 149);
    const positions: number[] = [];
    for (let i = 0; i < MAX_AMOUNT; i++) {
        let p: number, px: number, py: number;
        do {
            p = Math.floor(TILES_TOTAL * rng());
            px = Math.floor(p % TILES_PER_AXIS / 2);
            py = Math.floor(p / TILES_PER_AXIS / 2);
        } while (positions.indexOf(p) !== -1 || (i < AMOUNT[0]
            && (px == 0 || px == TILES_PER_AXIS/2-1 || py == 0 || py == TILES_PER_AXIS/2 - 1
                || (px > 1 && px < TILES_PER_AXIS/2 - 1 && py > 1))));
        positions.push(p);
    }

    const getCanvasForGuess = (failed: number): Canvas => {
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");

        let i = failed === 0 ? 0 : AMOUNT[failed - 1];
        const revealTile = (): void => {
            const p = positions[i];
            const px = p % TILES_PER_AXIS;
            const py = Math.floor(p / TILES_PER_AXIS);
            const x = TILE_POS[px];
            const y = TILE_POS[py];
            const w = TILE_POS[px + 1] - x;
            const h = TILE_POS[py + 1] - y;
            ctx.drawImage(scaledImage, x, y, w, h, x, y, w, h);
            i++;
            if (i < AMOUNT[failed]) {
                requestAnimationFrame(revealTile);
            }
        }
        revealTile();

        return canvas;
    };
    const getShareCanvas = (): Canvas => {
        const tileSize = CANVAS_SIZE / TILES_PER_AXIS;
        const canvas = createCanvas(tileSize * 3, tileSize * 3);
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < 9; i++) {
            const x = TILE_POS[positions[i] % TILES_PER_AXIS];
            const y = TILE_POS[Math.floor(positions[i] / TILES_PER_AXIS)];
            const cx = i % 3;
            const cy = Math.floor(i / 3);
            ctx.drawImage(scaledImage, x, y, tileSize, tileSize,
                cx * tileSize, cy * tileSize, tileSize, tileSize);
        }
        return canvas;
    };
    return {getCanvasForGuess, getShareCanvas}
}