import {createCanvas} from "canvas";
import type {Canvas, Image} from "canvas";
import type {Album} from "../albumpool";
import {CANVAS_SIZE} from "../games";
import type {GameInstance} from "../games";
import {seededRNG} from "../rng";

export const name = "Bubbles";
export const stacked = true;

const MAX_PER_FRAME = 100;
const BUBBLE_AMOUNT = [50, 200, 400, 800, 1600, 3200];
const BUBBLE_SIZE = [50, 30, 25, 20, 15, 10];

export function getGameInstance(day: number, album: Album, image: Image, scaledImage: Canvas): GameInstance {
    const getCanvasForGuess = (failed: number): Canvas => {
        const rng = seededRNG(day * 241);
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
        return getCanvasForGuess(0);
    };
    return {getCanvasForGuess, getShareCanvas}
}