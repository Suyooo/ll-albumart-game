/** @type {import("../gameHandler").Game} */

import {createCanvas} from "canvas";
import type {Canvas, Image} from "canvas";
import type {AlbumInfo} from "$data/albumpool";
import {CANVAS_SIZE} from "../gameHandler";
import type {GameInstance} from "../gameHandler";
import {seededRNG} from "../rng";

export const stacked = true;

const MAX_PER_FRAME = 10;
const BUBBLE_AMOUNT = [200, 700, 1000, 2000, 4000, 8000];
const BUBBLE_SIZE = [50, 30, 15, 10, 7, 5];

export function getGameInstance(day: number, _album: AlbumInfo, _image: Image, scaledImage: Canvas): GameInstance {
    // gameHandler does pre-caching, but only once the guess is up.
    // This game mode can be pretty taxing on weaker devices, so instead, we make our own cache. This way, this mode can
    // pre-draw the images in the background while the player is still looking at the previous guesses
    const CACHE = [
        createCanvas(CANVAS_SIZE, CANVAS_SIZE),
        createCanvas(CANVAS_SIZE, CANVAS_SIZE),
        createCanvas(CANVAS_SIZE, CANVAS_SIZE),
        createCanvas(CANVAS_SIZE, CANVAS_SIZE),
        createCanvas(CANVAS_SIZE, CANVAS_SIZE),
        createCanvas(CANVAS_SIZE, CANVAS_SIZE)
    ];

    const scaledImageCtx = scaledImage.getContext("2d");
    const data = scaledImageCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;
    console.log(data);

    for (let i = 0; i < 6; i++) {
        const rng = seededRNG(day * 241 + i);
        const ctx = CACHE[i].getContext("2d");

        let bubblesLeft = BUBBLE_AMOUNT[i];
        // Draw first guess instantly (for sharing), the rest can wait
        const maxPerFrame = i === 0 ? bubblesLeft : MAX_PER_FRAME;
        const drawBubbles = (): void => {
            ctx.lineWidth = BUBBLE_SIZE[i] * 2;
            ctx.lineCap = "round";
            for (let j = 0; j < maxPerFrame && bubblesLeft; j++) {
                const x = Math.floor(CANVAS_SIZE * rng());
                const y = Math.floor(CANVAS_SIZE * rng());

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 1, y);
                const p = (y * CANVAS_SIZE + x) * 4;
                ctx.strokeStyle = `rgba(${data[p]},${data[p + 1]},${data[p + 2]},${data[p + 3]})`;
                ctx.stroke();

                bubblesLeft--;
            }
            if (bubblesLeft > 0) {
                // Running in browser? Use requestAnimationFrame to do work in the background, otherwise just draw all
                if (typeof requestAnimationFrame !== "undefined") requestAnimationFrame(drawBubbles);
                else drawBubbles();
            }
        }
        drawBubbles();
    }

    const getCanvasForGuess = (failed: number): Canvas => {
        return CACHE[failed];
    };
    const getShareCanvas = (): Canvas => {
        return CACHE[0];
    };
    return {getCanvasForGuess, getShareCanvas}
}