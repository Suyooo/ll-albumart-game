import {createCanvas} from "canvas";
import type {Canvas, Image} from "canvas";
import type {Album} from "../albumpool";
import {smoothScaleSquareWithSrc} from "../canvasUtil";
import {CANVAS_SIZE} from "../games";
import type {GameInstance} from "../games";
import {seededRNG} from "../rng";

export const name = "Cropped";
const SIZES = [0.1, 0.1, 0.1, 0.15, 0.15, 0.2];

export function getGameInstance(day: number, album: Album, image: Image): GameInstance {
    const getCanvasForGuess = (failed: number): Canvas => {
        const rng = seededRNG(day * 409 + failed);
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");

        const cropWidth = Math.floor(image.width * SIZES[failed]);
        const cropHeight = Math.floor(image.height * SIZES[failed]);

        const firstGuessLockX = failed === 0 ? rng() < 0.5 : undefined; // first guess always on left/bottom border
        const cropX = firstGuessLockX === true
            ? 0
            : Math.floor((image.width - cropWidth) * rng());
        const cropY = firstGuessLockX === false
            ? (image.height - cropHeight)
            : Math.floor((image.height - cropHeight) * rng());

        smoothScaleSquareWithSrc(ctx, image, cropX, cropY, cropWidth, cropHeight, CANVAS_SIZE);
        return canvas;
    };
    const getShareCanvas = (): Canvas => {
        return getCanvasForGuess(0);
    };
    return {getCanvasForGuess, getShareCanvas}
}