import {createCanvas} from "canvas";
import type {Canvas, Image} from "canvas";
import type {Album} from "../albumpool";
import {CANVAS_SIZE} from "../games";
import type {GameInstance} from "../games";

export const name = "Pixelized";
const SIZES = [5, 10, 15, 20, 30, 45];

export function getGameInstance(day: number, album: Album, image: Image): GameInstance {
    const getCanvasForGuess = (failed: number): Canvas => {
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");
        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(image, 0, 0, CANVAS_SIZE, CANVAS_SIZE);

        const targetSize = SIZES[failed];
        let lastSize = CANVAS_SIZE;
        while (lastSize / 2 > targetSize) {
            const nextSize = Math.floor(lastSize / 2);
            ctx.drawImage(canvas, 0, 0, lastSize, lastSize, 0, 0, nextSize, nextSize);
            lastSize = nextSize;
        }

        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(canvas, 0, 0, lastSize, lastSize, 0, 0, targetSize, targetSize);
        ctx.drawImage(canvas, 0, 0, targetSize, targetSize, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        return canvas;
    };
    const getShareCanvas = (): Canvas => {
        return getCanvasForGuess(0);
    };
    return {getCanvasForGuess, getShareCanvas}
}