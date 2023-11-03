/** @type {import("../gameHandler").Game} */

import type { Canvas, Image } from "canvas";
import { createCanvas } from "canvas";
import type { AlbumInfo } from "$data/albumpool";
import type { GameInstance } from "../gameHandler";
import { CANVAS_SIZE } from "../gameHandler";
import { seededRNG } from "$modules/rng.js";
import * as StackBlur from "stackblur-canvas";

export const stacked = false;
export const hasAltFinished = false;
export const forceAltFinished = false;

const CIRCLE_SEGMENTS = 48;
const CIRCLE_BASE_RAD = 100;
const CIRCLE_TURN_RAD_FACTOR = [0.7, 0.85, 1, 1.2, 1.7, 2.2];

type Spot = {
    x: number;
    y: number;
};

export function getGameInstance(day: number, _album: AlbumInfo, _image: Image, scaledImage: Canvas): GameInstance {
    const grayscaleCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const grayscaleCtx = grayscaleCanvas.getContext("2d");
    const grayscaleData = grayscaleCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const origData = scaledImage.getContext("2d").getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    for (let y = 0; y < CANVAS_SIZE; y++) {
        for (let x = 0; x < CANVAS_SIZE; x++) {
            const i4 = (y * CANVAS_SIZE + x) * 4;
            const luminance =
                0.2126 * origData.data[i4] + 0.7152 * origData.data[i4 + 1] + 0.0722 * origData.data[i4 + 2];
            grayscaleData.data[i4] = grayscaleData.data[i4 + 1] = grayscaleData.data[i4 + 2] = Math.round(luminance);
            grayscaleData.data[i4 + 3] = origData.data[i4 + 3];
        }
    }
    grayscaleCtx.putImageData(grayscaleData, 0, 0);

    // Blur here - which means: grayscaleCanvas/Ctx has the unblurred image, grayscaleData has the blurred data
    StackBlur.imageDataRGBA(grayscaleData, 0, 0, CANVAS_SIZE, CANVAS_SIZE, 180);
    StackBlur.imageDataRGBA(grayscaleData, 0, 0, CANVAS_SIZE, CANVAS_SIZE, 180);

    const rng = seededRNG(day * 273);
    const spots: Spot[] = [];

    const rndOrder = new Array(4)
        .fill(0)
        .map((_, i) => ({ r: rng(), i }))
        .sort((a, b) => a.r - b.r)
        .map(({ i }) => i);
    for (let i = 0; i < 4; i++) {
        const xr = Math.floor(rng() * (CANVAS_SIZE / 3)) + 1;
        const yr = Math.floor(rng() * (CANVAS_SIZE / 3)) + 1;
        let centerX = rndOrder[i] < 2 ? xr : CANVAS_SIZE - 1 - xr;
        let centerY = rndOrder[i] % 2 === 0 ? yr : CANVAS_SIZE - 1 - yr;
        spots.push({
            x: centerX,
            y: centerY,
        });
    }

    const getCanvasForGuess = (failed: number): Canvas => {
        const guessCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const guessCtx = guessCanvas.getContext("2d");
        guessCtx.putImageData(grayscaleData, 0, 0);

        function drawSpots(extraD: number = 0) {
            for (let i = 0; i < failed + 1 && i < spots.length; i++) {
                const spot = spots[i];
                guessCtx.fillStyle = "black";
                guessCtx.beginPath();
                for (let a = 0; a < Math.PI * 2; a += (Math.PI * 2) / CIRCLE_SEGMENTS) {
                    const modD = CIRCLE_BASE_RAD * CIRCLE_TURN_RAD_FACTOR[failed] + extraD;
                    guessCtx.lineTo(spot.x + Math.sin(a) * modD, spot.y + Math.cos(a) * modD);
                }
                guessCtx.closePath();
                guessCtx.fill();
            }
        }

        guessCtx.globalAlpha = 0.05;
        guessCtx.fillStyle = "#AF176D";
        guessCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        guessCtx.globalAlpha = 0.1;
        for (let extraDist = 6; extraDist > 0; extraDist--) {
            drawSpots(extraDist);
        }

        guessCtx.globalAlpha = 1;
        guessCtx.globalCompositeOperation = "destination-out";
        drawSpots();
        guessCtx.globalCompositeOperation = "destination-over";
        guessCtx.drawImage(grayscaleCanvas, 0, 0);

        return guessCanvas;
    };
    const getShareCanvas = (): Canvas => {
        const modRad = CIRCLE_BASE_RAD * CIRCLE_TURN_RAD_FACTOR[0] * 1.2;
        const shareCanvas = createCanvas(modRad * 2, modRad * 2);
        const shareX = Math.max(0, Math.min(spots[0].x - modRad, CANVAS_SIZE - modRad * 2));
        const shareY = Math.max(0, Math.min(spots[0].y - modRad, CANVAS_SIZE - modRad * 2));
        const shareCtx = shareCanvas.getContext("2d");
        shareCtx.drawImage(getCanvasForGuess(0), -shareX, -shareY);
        return shareCanvas;
    };
    return { getCanvasForGuess, getShareCanvas };
}
