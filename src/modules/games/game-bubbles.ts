/** @type {import("../gameHandler").Game} */

import {createCanvas} from "canvas";
import type {Canvas, Image} from "canvas";
import type {AlbumInfo} from "$data/albumpool";
import {CANVAS_SIZE} from "../gameHandler";
import type {GameInstance} from "../gameHandler";
import {seededRNG} from "../rng";

export const stacked = true;

const MAX_PER_FRAME = 200;
const BUBBLE_AMOUNT = [200, 700, 1000, 2000, 3000, 5000];
const BUBBLE_SIZE = [50, 30, 15, 10, 7, 5];

export function getGameInstance(day: number, _album: AlbumInfo, _image: Image, scaledImage: Canvas): GameInstance {
    const getCanvasForGuess = (failed: number): Canvas => {
        const rng = seededRNG(day * 241 + failed);
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");
        const scaledImageCtx = scaledImage.getContext("2d");

        let bubblesLeft = BUBBLE_AMOUNT[failed];
        const drawBubbles = (): void => {
            ctx.lineWidth = BUBBLE_SIZE[failed] * 2;
            ctx.lineCap = "round";
            for (let j = 0; j < MAX_PER_FRAME && bubblesLeft; j++) {
                const x = Math.floor(CANVAS_SIZE * rng());
                const y = Math.floor(CANVAS_SIZE * rng());
                const data = scaledImageCtx.getImageData(x, y, 1, 1).data;

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x, y);
                ctx.strokeStyle = `rgb(${data[0]},${data[1]},${data[2]})`;
                ctx.stroke();
                bubblesLeft--;
            }
            if (bubblesLeft > 0) {
                requestAnimationFrame(drawBubbles);
            }
        }
        drawBubbles();

        return canvas;
    };
    const getShareCanvas = (): Canvas => {
        const firstGuessCanvas = getCanvasForGuess(0);
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "black";
        ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        ctx.drawImage(firstGuessCanvas, 0, 0);
        return canvas;
    };
    return {getCanvasForGuess, getShareCanvas}
}