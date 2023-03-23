/** @type {import("../gameHandler").Game} */

import type {AlbumInfo} from "$data/albumpool";
import type {Canvas, Image} from "canvas";
import {createCanvas, loadImage} from "canvas";
import type {GameInstance} from "../gameHandler";
import {CANVAS_SIZE} from "../gameHandler";

export const stacked = false;
export const hasAltFinished = false;
export const forceAltFinished = false;

const SIZES = [700, 650, 600, 550, 480, 400];

export async function getGameInstance(_day: number, _album: AlbumInfo, _image: Image, scaledImage: Canvas): Promise<GameInstance> {
    const birbImage = await loadImage("/assets/kotobomb.png");
    const getCanvasForGuess = (failed: number): Canvas => {
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");
        const targetSize = SIZES[failed];

        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(scaledImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.drawImage(birbImage, 0, 0, 650, 650, 0, CANVAS_SIZE - targetSize, targetSize, targetSize);

        return canvas;
    };
    const getShareCanvas = (): Canvas => {
        return getCanvasForGuess(0);
    };
    return {getCanvasForGuess, getShareCanvas}
}