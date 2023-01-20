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

const TILES_PER_AXIS = 20;
const TILES_TOTAL = TILES_PER_AXIS * TILES_PER_AXIS;
const TILE_POS = new Array(TILES_PER_AXIS + 1).fill(0).map((_, i) =>
    Math.floor(CANVAS_SIZE * i / TILES_PER_AXIS));
const SHARE_GAP = 10;

const AMOUNT = [[9, 20, 40, 60, 90, 120], [6, 15, 25, 40, 70, 120]];
const MAX_AMOUNT = AMOUNT.map(a => a.reduce((max, cur) => cur > max ? cur : max, 0));

export function getGameInstance(day: number, _album: AlbumInfo, _image: Image, scaledImage: Canvas): GameInstance {
    const rng = seededRNG(day * 149);
    const positions: number[] = [];
    const balanceVersion = day < 48 ? 0 : 1;
    for (let i = 0; i < MAX_AMOUNT[balanceVersion]; i++) {
        let p: number, px: number, py: number;
        do {
            p = Math.floor(TILES_TOTAL * rng());
            px = Math.floor(p % TILES_PER_AXIS / 2);
            py = Math.floor(p / TILES_PER_AXIS / 2);
        } while (positions.indexOf(p) !== -1 || (i < AMOUNT[balanceVersion][0]
            && (px == 0 || px == TILES_PER_AXIS / 2 - 1 || py == 0 || py == TILES_PER_AXIS / 2 - 1
                || (px > 1 && px < TILES_PER_AXIS / 2 - 1 && py > 1))));
        positions.push(p);
    }

    const getCanvasForGuess = (failed: number): Canvas => {
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");

        let i = failed === 0 ? 0 : AMOUNT[balanceVersion][failed - 1];
        const revealTile = (): void => {
            const p = positions[i];
            const px = p % TILES_PER_AXIS;
            const py = Math.floor(p / TILES_PER_AXIS);
            const x = TILE_POS[px];
            const y = TILE_POS[py];
            const w = TILE_POS[px + 1] - x;
            const h = TILE_POS[py + 1] - y;
            ctx.drawImage(scaledImage, x - 1, y - 1, w + 1, h + 1, x - 1, y - 1, w + 1, h + 1);
            i++;
            if (i < AMOUNT[balanceVersion][failed]) {
                // Don't have to care about browser/server check, getShareCanvas() doesn't call getCanvasForGuess()
                requestAnimationFrame(revealTile);
            }
        }
        revealTile();

        return canvas;
    };
    const getShareCanvas = (): Canvas => {
        const tileSize = CANVAS_SIZE / TILES_PER_AXIS;
        const canvas = createCanvas(tileSize * 3 + SHARE_GAP * 4, tileSize * 3 + SHARE_GAP * 4);
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < (balanceVersion === 0 ? 9 : 6); i++) {
            const x = TILE_POS[positions[i] % TILES_PER_AXIS];
            const y = TILE_POS[Math.floor(positions[i] / TILES_PER_AXIS)];
            const cx = i % 3;
            const cy = Math.floor(i / 3) + (balanceVersion === 0 ? 0 : 0.5);
            ctx.drawImage(scaledImage, x, y, tileSize, tileSize,
                Math.floor(cx * (tileSize + SHARE_GAP) + SHARE_GAP),
                Math.floor(cy * (tileSize + SHARE_GAP) + SHARE_GAP), tileSize, tileSize);
        }

        return canvas;
    };
    return {getCanvasForGuess, getShareCanvas}
}