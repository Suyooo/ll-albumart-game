/** @type {import("../gameHandler").Game} */

import {createCanvas} from "canvas";
import type {Canvas, Image} from "canvas";
import type {AlbumInfo} from "$data/albumpool";
import {smoothScaleSquare, smoothScaleSquareWithSrc} from "../canvasUtil";
import {CANVAS_SIZE} from "../gameHandler";
import type {GameInstance} from "../gameHandler";

export const stacked = false;

const BLURS = [20, 40, 60, 90, 130, 180];

export function getGameInstance(_day: number, _album: AlbumInfo, _image: Image, scaledImage: Canvas): GameInstance {
    const origData = scaledImage.getContext("2d").getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    let avg = 0;
    for (let x = 0; x < CANVAS_SIZE; x++) {
        for (let y = 0; y < CANVAS_SIZE; y++) {
            const i = (y * CANVAS_SIZE + x) * 4;
            avg += (origData.data[i] + origData.data[i + 1] + origData.data[i + 2]) / 3;
        }
    }
    avg /= CANVAS_SIZE*CANVAS_SIZE;

    const getCanvasForGuess = (failed: number): Canvas => {
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");
        const blurTarget = BLURS[failed];

        smoothScaleSquareWithSrc(ctx, scaledImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE, blurTarget);
        smoothScaleSquare(ctx, blurTarget, CANVAS_SIZE);

        const data = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        for (let x = 0; x < CANVAS_SIZE; x++) {
            for (let y = 0; y < CANVAS_SIZE; y++) {
                const i = (y * CANVAS_SIZE + x) * 4;
                for (let j = 0; j < 4; j++)
                    data.data[i + j] = data.data[i + j] > avg ? 255 : 0;
            }
        }

        ctx.putImageData(data, 0, 0, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        return canvas;
    };
    const getShareCanvas = (): Canvas => {
        return getCanvasForGuess(0);
    };
    return {getCanvasForGuess, getShareCanvas}
}