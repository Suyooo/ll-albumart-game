import {createCanvas} from "canvas";
import type {Canvas, Image} from "canvas";
import type {Album} from "../albumpool";
import {smoothScaleSquare, smoothScaleSquareWithSrc} from "../canvasUtil";
import {CANVAS_SIZE} from "../games";
import type {GameInstance} from "../games";

export const name = "Posterized";
export const stacked = false;
const VALUES = [4, 5, 6, 7, 8, 10];
const BLURS = [15, 20, 30, 40, 50, 65];

export function getGameInstance(day: number, album: Album, image: Image, scaledImage: Canvas): GameInstance {
    const getCanvasForGuess = (failed: number): Canvas => {
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");
        const depth = VALUES[failed];
        const size = BLURS[failed];

        smoothScaleSquareWithSrc(ctx, scaledImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE, size);
        smoothScaleSquare(ctx, size, CANVAS_SIZE);

        const data = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        const origData = ctx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        for (let x = 0; x < CANVAS_SIZE; x++) {
            for (let y = 0; y < CANVAS_SIZE; y++) {
                const i = (y * CANVAS_SIZE + x) * 4;
                for (let j = i; j < i + 4; j++)
                    data.data[j] = Math.round(origData.data[j] / 255.0 * depth) / depth * 255;
                data.data[i + 3] = origData.data[i + 3];
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