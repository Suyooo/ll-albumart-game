import {createCanvas} from "canvas";
import type {Canvas, Image} from "canvas";
import type {Album} from "../albumpool";
import {smoothScaleSquare} from "../canvasUtil";
import {CANVAS_SIZE} from "../games";
import type {GameInstance} from "../games";
import {seededRNG} from "../rng";

export const name = "Cropped";
const SIZES = [0.125, 0.125, 0.125, 0.2, 0.2, 0.33];

export function getGameInstance(day: number, album: Album, image: Image): GameInstance {
    const getCanvasForGuess = (failed: number): Canvas => {
        const rng = seededRNG(day * 409 + failed);
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(image, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        const cropSizeFactor = SIZES[failed];

        let cropSize = Math.floor(CANVAS_SIZE * cropSizeFactor);
        const maxCoordinate = CANVAS_SIZE - cropSize;
        const firstGuessLockX = failed === 0 ? rng() < 0.5 : undefined; // first guess always on left/bottom border
        const cropX = firstGuessLockX === true ? 0 : Math.floor(maxCoordinate * rng());
        const cropY = firstGuessLockX === false ? maxCoordinate : Math.floor(maxCoordinate * rng());
        console.log(firstGuessLockX, cropX, cropY)

        ctx.drawImage(canvas, cropX, cropY, cropSize, cropSize, 0, 0, cropSize, cropSize);
        smoothScaleSquare(ctx, cropSize, CANVAS_SIZE);
        return canvas;
    };
    const getShareCanvas = (): Canvas => {
        return getCanvasForGuess(0);
    };
    return {getCanvasForGuess, getShareCanvas}
}