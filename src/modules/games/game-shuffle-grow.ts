/** @type {import("../gameHandler").Game} */

import type {AlbumInfo} from "$data/albumpool";
import type {Canvas, Image} from "canvas";
import {createCanvas} from "canvas";
import type {GameInstance} from "../gameHandler";
import {CANVAS_SIZE} from "../gameHandler";
import {seededRNG} from "../rng";

export const stacked = false;
export const hasAltFinished = false;
export const forceAltFinished = false;

const TILES_PER_AXIS = [128, 80, 64, 32, 16, 8];

export function getGameInstance(day: number, _album: AlbumInfo, _image: Image, scaledImage: Canvas): GameInstance {
    const getCanvasForGuess = (failed: number): Canvas => {
        const rng = seededRNG(day * 461 * failed);
        const axis = TILES_PER_AXIS[failed];
        const total = axis * axis;
        const positions: { positionIndex: number, rotation: number }[] =
            new Array(total).fill(0).map((_, i) => ({i, sortVal: rng()}))
                        .sort((a, b) => a.sortVal - b.sortVal)
                        // no rotation on first guess to improve performance
                        .map(e => ({positionIndex: e.i, rotation: failed === 0 ? 0 : Math.floor(rng() * 4)}));

        const getPosInCanvas = (p: number) => {
            return Math.floor(CANVAS_SIZE * p / axis);
        }

        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");

        for (let i = 0; i < total; i++) {
            const sx = getPosInCanvas(i % axis);
            const sy = getPosInCanvas(Math.floor(i / axis));
            const sw = getPosInCanvas((i % axis) + 1) - sx;
            const sh = getPosInCanvas(Math.floor(i / axis) + 1) - sy;

            const pos = positions[i].positionIndex;
            const dx = getPosInCanvas(pos % axis);
            const dy = getPosInCanvas(Math.floor(pos / axis));
            const dw = getPosInCanvas((pos % axis) + 1) - dx;
            const dh = getPosInCanvas(Math.floor(pos / axis) + 1) - dy;
            const dmx = dx + dw / 2;
            const dmy = dy + dh / 2;

            const rot = positions[i].rotation;
            if (rot !== 0) {
                ctx.save();
                ctx.translate(dmx, dmy);
                ctx.rotate(rot * Math.PI / 2);
                ctx.translate(-dmx, -dmy);
            }
            ctx.globalCompositeOperation = "source-over";
            ctx.drawImage(scaledImage, sx, sy, sw, sh, dx, dy, dw, dh);
            if (CANVAS_SIZE % axis !== 0) {
                // Avoid gaps
                ctx.globalCompositeOperation = "destination-over";
                ctx.drawImage(scaledImage, sx - 1, sy - 1, sw + 2, sh + 2, dx - 1, dy - 1, dw + 2, dh + 2);
            }
            if (rot !== 0) {
                ctx.restore();
            }
        }

        return canvas;
    };
    const getShareCanvas = (): Canvas => {
        const fullCanvas = getCanvasForGuess(0);
        const canvas = createCanvas(CANVAS_SIZE / 4, CANVAS_SIZE / 4);
        canvas.getContext("2d").drawImage(fullCanvas,
                CANVAS_SIZE * 0.375, CANVAS_SIZE * 0.375, CANVAS_SIZE / 4, CANVAS_SIZE / 4,
                0, 0, CANVAS_SIZE / 4, CANVAS_SIZE / 4);
        return canvas;
    };
    return {getCanvasForGuess, getShareCanvas}
}