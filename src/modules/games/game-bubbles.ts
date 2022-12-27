/** @type {import("../gameHandler").Game} */

import type {AlbumInfo} from "$data/albumpool";
import {yieldToMain} from "$modules/canvasUtil";
import type {Canvas, Image} from "canvas";
import {createCanvas} from "canvas";
import type {GameInstance} from "../gameHandler";
import {CANVAS_SIZE} from "../gameHandler";
import {seededRNG} from "../rng";

export const stacked = true;
export const hasAltFinished = false;
export const forceAltFinished = false;

const MAX_PER_BATCH = 50;
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

    const rngZero = seededRNG(day * 241);
    const ctxZero = CACHE[0].getContext("2d");
    ctxZero.lineWidth = BUBBLE_SIZE[0] * 2;
    ctxZero.lineCap = "round";
    for (let j = 0; j < BUBBLE_AMOUNT[0]; j++) {
        const x = Math.floor(CANVAS_SIZE * rngZero());
        const y = Math.floor(CANVAS_SIZE * rngZero());

        ctxZero.beginPath();
        ctxZero.moveTo(x, y);
        ctxZero.lineTo(x + 1, y);
        const p = (y * CANVAS_SIZE + x) * 4;
        ctxZero.strokeStyle = `rgba(${data[p]},${data[p + 1]},${data[p + 2]},${data[p + 3]})`;
        ctxZero.stroke();
    }

    (async () => {
        for (let i = 1; i < 6; i++) {
            const rng = seededRNG(day * 241 + i);
            const ctx = CACHE[i].getContext("2d");

            let thisBatch = MAX_PER_BATCH;
            ctx.lineWidth = BUBBLE_SIZE[i] * 2;
            ctx.lineCap = "round";
            for (let j = 0; j < BUBBLE_AMOUNT[i]; j++) {
                const x = Math.floor(CANVAS_SIZE * rng());
                const y = Math.floor(CANVAS_SIZE * rng());

                ctx.beginPath();
                ctx.moveTo(x, y);
                ctx.lineTo(x + 1, y);
                const p = (y * CANVAS_SIZE + x) * 4;
                ctx.strokeStyle = `rgba(${data[p]},${data[p + 1]},${data[p + 2]},${data[p + 3]})`;
                ctx.stroke();

                thisBatch--;
                if (thisBatch <= 0) {
                    thisBatch = MAX_PER_BATCH;
                    await yieldToMain();
                }
            }
        }
    })();

    const getCanvasForGuess = (failed: number): Canvas => {
        return CACHE[failed];
    };
    const getShareCanvas = (): Canvas => {
        return CACHE[0];
    };
    return {getCanvasForGuess, getShareCanvas}
}