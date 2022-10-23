/** @type {import("../gameHandler").Game} */

import {createCanvas} from "canvas";
import type {Canvas, Image} from "canvas";
import type {AlbumInfo} from "$data/albumpool";
import {smoothScaleSquareWithSrc} from "../canvasUtil";
import {CANVAS_SIZE} from "../gameHandler";
import type {GameInstance} from "../gameHandler";
import {seededRNG} from "../rng";

export const stacked = false;

const SIZE = [0.1, 0.1, 0.1, 0.15, 0.15, 0.2];
const MAX_SIZE = SIZE.reduce((max, cur) => cur > max ? cur : max, 0);

export function getGameInstance(day: number, _album: AlbumInfo, image: Image): GameInstance {
    const rng = seededRNG(day * 409);
    const positions: [number, number][] = [];
    let closestDistance: number;
    for (let i = 0; i < 6; i++) {
        let x: number, y: number;
        do {
            x = (1 - MAX_SIZE) * rng();
            y = (1 - MAX_SIZE) * rng();
            closestDistance = positions.reduce((closest, pos) =>
                Math.min(closest, Math.max(Math.abs(x - pos[0]), Math.abs(y - pos[1]))), 1);
        } while (closestDistance < MAX_SIZE);

        if (i == 0) { // first guess always on left or right border, never corners
            if (rng() < 0.5) x = 0;
            else x = 1 - MAX_SIZE;
            if (y < MAX_SIZE) y = MAX_SIZE;
            else if (y >= 1 - MAX_SIZE * 2) y = 1 - MAX_SIZE * 2;
        }
        positions.push([x, y]);
    }

    const getCanvasForGuess = (failed: number): Canvas => {
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");

        const cropWidth = Math.floor(image.width * SIZE[failed]);
        const cropHeight = Math.floor(image.height * SIZE[failed]);

        const p = positions[failed];
        smoothScaleSquareWithSrc(ctx, image, p[0] * image.width, p[1] * image.height,
            cropWidth, cropHeight, CANVAS_SIZE);
        return canvas;
    };
    const getShareCanvas = (): Canvas => {
        return getCanvasForGuess(0);
    };
    return {getCanvasForGuess, getShareCanvas}
}