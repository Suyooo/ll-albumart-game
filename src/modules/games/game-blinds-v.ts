/** @type {import("../gameHandler").Game} */

import {createCanvas} from "canvas";
import type {Canvas, Image} from "canvas";
import type {AlbumInfo} from "$data/albumpool";
import {CANVAS_SIZE} from "../gameHandler";
import type {GameInstance} from "../gameHandler";
import {seededRNG} from "../rng";

export const stacked = false;

const SIZE = [4, 12, 12, 24, 24, 48];
const MAX_SIZE = SIZE.reduce((max, cur) => cur > max ? cur : max, 0);
const AMOUNT = [1, 1, 2, 2, 3, 3];
const MAX_AMOUNT = AMOUNT.reduce((max, cur) => cur > max ? cur : max, 0);

export function getGameInstance(day: number, _album: AlbumInfo, _image: Image, scaledImage: Canvas): GameInstance {
    const rng = seededRNG(day * 367);
    const positions: number[] = [];
    const blockedXs = new Set();
    for (let i = 0; i < MAX_AMOUNT; i++) {
        let x: number;
        do {
            x = Math.floor(MAX_SIZE + (CANVAS_SIZE - MAX_SIZE * 2) * rng());
        } while (blockedXs.has(x));

        for (let block = x - MAX_SIZE - 16; block < x + MAX_SIZE + 16; block++) {
            blockedXs.add(block);
        }
        positions.push(x);
    }

    const getCanvasForGuess = (failed: number): Canvas => {
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");
        const size = SIZE[failed];

        for (let i = 0; i < AMOUNT[failed]; i++) {
            const x = positions[i] - size / 2;
            ctx.drawImage(scaledImage, x, 0, size, CANVAS_SIZE, x, 0, size, CANVAS_SIZE);
        }

        return canvas;
    };
    const getShareCanvas = (): Canvas => {
        const firstGuessCanvas = getCanvasForGuess(0);
        const canvas = createCanvas(256, 256);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.globalAlpha = .1;
        ctx.drawImage(firstGuessCanvas, positions[0] - 2, 0, 4, CANVAS_SIZE,
            0, 0, 256, 256);
        ctx.globalAlpha = 1;
        ctx.drawImage(firstGuessCanvas, positions[0] - 2, CANVAS_SIZE / 4 - 32, 4, 64,
            104, 0, 16, 256);
        ctx.drawImage(firstGuessCanvas, positions[0] - 2, CANVAS_SIZE / 2 - 32, 4, 64,
            120, 0, 16, 256);
        ctx.drawImage(firstGuessCanvas, positions[0] - 2, CANVAS_SIZE / 4 * 3 - 32, 4, 64,
            136, 0, 16, 256);
        return canvas;
    };
    return {getCanvasForGuess, getShareCanvas}
}