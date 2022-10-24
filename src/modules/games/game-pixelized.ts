/** @type {import("../gameHandler").Game} */

import {createCanvas} from "canvas";
import type {Canvas, Image} from "canvas";
import type {AlbumInfo} from "$data/albumpool";
import {smoothScaleSquareWithSrc} from "../canvasUtil";
import {CANVAS_SIZE} from "../gameHandler";
import type {GameInstance} from "../gameHandler";

export const stacked = false;

const SIZES = [5, 9, 15, 20, 30, 45];

export function getGameInstance(_day: number, _album: AlbumInfo, _image: Image, scaledImage: Canvas): GameInstance {
    const getCanvasForGuess = (failed: number): Canvas => {
        const tempCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const tempCtx = tempCanvas.getContext("2d");
        const ctx = canvas.getContext("2d");
        const targetSize = SIZES[failed];

        ctx.imageSmoothingEnabled = true;
        smoothScaleSquareWithSrc(tempCtx, scaledImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE, targetSize);
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(tempCanvas, 0, 0, targetSize, targetSize, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        return canvas;
    };
    const getShareCanvas = (): Canvas => {
        return getCanvasForGuess(0);
    };
    return {getCanvasForGuess, getShareCanvas}
}