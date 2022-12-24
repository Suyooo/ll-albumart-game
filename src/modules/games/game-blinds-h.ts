/** @type {import("../gameHandler").Game} */

import type {Canvas, Image} from "canvas";
import {createCanvas} from "canvas";
import type {AlbumInfo} from "$data/albumpool";
import type {GameInstance} from "../gameHandler";
import {CANVAS_SIZE} from "../gameHandler";
import {seededRNG} from "../rng";

export const stacked = false;
export const overrideFinished = false;

const SIZE = [4, 12, 12, 24, 24, 48];
const MAX_SIZE = SIZE.reduce((max, cur) => cur > max ? cur : max, 0);
const AMOUNT = [1, 1, 2, 2, 3, 3];
const MAX_AMOUNT = AMOUNT.reduce((max, cur) => cur > max ? cur : max, 0);

export function getGameInstance(day: number, _album: AlbumInfo, _image: Image, scaledImage: Canvas): GameInstance {
    const rng = seededRNG(day * 373);
    const positions: number[] = [];
    const blockedYs = new Set();
    for (let i = 0; i < MAX_AMOUNT; i++) {
        let y: number;
        do {
            y = Math.floor(CANVAS_SIZE / 4 + (CANVAS_SIZE / 2) * rng());
        } while (blockedYs.has(y));

        for (let block = y - MAX_SIZE - 16; block < y + MAX_SIZE + 16; block++) {
            blockedYs.add(block);
        }
        positions.push(y);
    }

    const getCanvasForGuess = (failed: number): Canvas => {
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");
        const size = SIZE[failed];

        for (let i = 0; i < AMOUNT[failed]; i++) {
            const y = positions[i] - size / 2;
            ctx.drawImage(scaledImage, 0, y, CANVAS_SIZE, size, 0, y, CANVAS_SIZE, size);
        }

        return canvas;
    };
    const getShareCanvas = (): Canvas => {
        const firstGuessCanvas = getCanvasForGuess(0);
        const canvas = createCanvas(256, 256);
        const ctx = canvas.getContext("2d");
        ctx.globalAlpha = .2;
        ctx.drawImage(firstGuessCanvas, 0, positions[0] - 2, CANVAS_SIZE, 4,
            0, 0, 256, 256);
        ctx.globalAlpha = 1;
        ctx.drawImage(firstGuessCanvas, 0, positions[0] - 2, 64, 4,
            0, 104, 256, 16);
        ctx.drawImage(firstGuessCanvas, CANVAS_SIZE / 2 - 32, positions[0] - 2, 64, 4,
            0, 120, 256, 16);
        ctx.drawImage(firstGuessCanvas, CANVAS_SIZE - 64, positions[0] - 2, 64, 4,
            0, 136, 256, 16);
        return canvas;
    };
    return {getCanvasForGuess, getShareCanvas}
}