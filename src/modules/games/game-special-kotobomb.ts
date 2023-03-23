/** @type {import("../gameHandler").Game} */

import type {AlbumInfo} from "$data/albumpool";
import type {Canvas, Image} from "canvas";
import {createCanvas, loadImage} from "canvas";
import type {GameInstance} from "../gameHandler";
import {CANVAS_SIZE} from "../gameHandler";

export const stacked = false;
export const hasAltFinished = true;
export const forceAltFinished = true;

const SIZES = [700, 680, 650, 580, 500, 400];
const BIRB_SIZE = 650; // size in pixels of kotobomb.png

export async function getGameInstance(_day: number, _album: AlbumInfo, _image: Image, scaledImage: Canvas): Promise<GameInstance> {
    const birbImage = await loadImage("assets/kotobomb.png");
    const getCanvasForGuess = (failed: number): Canvas => {
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");
        const targetSize = SIZES[failed];

        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(scaledImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.drawImage(birbImage, 0, 0, BIRB_SIZE, BIRB_SIZE, 0, CANVAS_SIZE - targetSize, targetSize, targetSize);

        return canvas;
    };

    const getShareCanvas = (): Canvas => {
        return getCanvasForGuess(0);
    };

    const FINISH_BIRB_SIZE = 150;
    const getAltFinishedCanvas = (): Canvas => {
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");

        ctx.imageSmoothingEnabled = true;
        ctx.drawImage(scaledImage, 0, 0, CANVAS_SIZE, CANVAS_SIZE, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.drawImage(birbImage, 0, 0, BIRB_SIZE, BIRB_SIZE, 0, CANVAS_SIZE - FINISH_BIRB_SIZE, FINISH_BIRB_SIZE, FINISH_BIRB_SIZE);
        ctx.save();
        ctx.scale(1, -1);
        ctx.drawImage(birbImage, 0, 0, BIRB_SIZE, BIRB_SIZE, 0, -FINISH_BIRB_SIZE, FINISH_BIRB_SIZE, FINISH_BIRB_SIZE);
        ctx.restore();
        ctx.save();
        ctx.scale(-1, 1);
        ctx.drawImage(birbImage, 0, 0, BIRB_SIZE, BIRB_SIZE, -CANVAS_SIZE, CANVAS_SIZE - FINISH_BIRB_SIZE, FINISH_BIRB_SIZE, FINISH_BIRB_SIZE);
        ctx.restore();
        ctx.scale(-1, -1);
        ctx.drawImage(birbImage, 0, 0, BIRB_SIZE, BIRB_SIZE, -CANVAS_SIZE, -FINISH_BIRB_SIZE, FINISH_BIRB_SIZE, FINISH_BIRB_SIZE);

        return canvas;
    };
    return {getCanvasForGuess, getShareCanvas, getAltFinishedCanvas}
}