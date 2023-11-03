/** @type {import("../gameHandler").Game} */

import type { Canvas, Image } from "canvas";
import { createCanvas } from "canvas";
import type { AlbumInfo } from "$data/albumpool";
import * as StackBlur from "stackblur-canvas";
import type { GameInstance } from "../gameHandler";
import { CANVAS_SIZE } from "../gameHandler";
import { seededRNG } from "$modules/rng.js";

export const stacked = false;
export const hasAltFinished = false;
export const forceAltFinished = false;

const EDGE_THRESHOLD = 64;
const EDGE_FACTOR = 1.5;

const RAYS = 32;
const RAY_REVEAL_DIST = 90;
const RAY_AVG_RANGE = 3;
const RAY_COST: (v: number, d: number) => number = (v, d) => 1 - Math.pow(1 - v / 255, 2) + d / 200;

const UNREVEALED_BLUR = 160;
const SHADOW_RADIUS = 8;
const TURN_DIST_FACTOR = [0.7, 0.85, 1, 1.2, 1.6, 2];

type Spot = {
    x: number;
    y: number;
    rayDists: number[];
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

    // Sobel edge detection.
    // Image borders are treated by extending the first/last pixel in the row/column using Math.min/max.
    const edgeCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const edgeCtx = edgeCanvas.getContext("2d");
    const edgeData = edgeCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    for (let x = 0; x < CANVAS_SIZE; x++) {
        const xCoords = [Math.max(0, x - 1), x, Math.min(CANVAS_SIZE - 1, x + 1)];
        const firstRow = xCoords.map((x) => grayscaleData.data[x * 4]);
        let kernel = [firstRow, firstRow, firstRow];

        for (let y = 0; y < CANVAS_SIZE; y++) {
            const i4 = (y * CANVAS_SIZE + x) * 4;

            const nextY = Math.min(CANVAS_SIZE - 1, y + 1);
            kernel.push(xCoords.map((xx) => grayscaleData.data[(nextY * CANVAS_SIZE + xx) * 4]));
            kernel.shift();

            const xGrad =
                kernel[0][0] +
                kernel[1][0] +
                kernel[1][0] +
                kernel[2][0] -
                kernel[0][2] -
                kernel[1][2] -
                kernel[1][2] -
                kernel[2][2];
            const yGrad =
                kernel[0][0] +
                kernel[0][1] +
                kernel[0][1] +
                kernel[0][2] -
                kernel[2][0] -
                kernel[2][1] -
                kernel[2][1] -
                kernel[2][2];
            const value = Math.round((Math.sqrt(xGrad * xGrad + yGrad * yGrad) - EDGE_THRESHOLD) * EDGE_FACTOR);
            edgeData.data[i4] = value;
            edgeData.data[i4 + 3] = 255;
        }
    }

    const edgeData1D = edgeData.data.filter((_, i) => i % 4 === 0);
    StackBlur.imageDataRGBA(edgeData, 0, 0, CANVAS_SIZE, CANVAS_SIZE, 8);

    // And now, Sobel the Sobel
    for (let x = 0; x < CANVAS_SIZE; x++) {
        const xCoords = [Math.max(0, x - 1), x, Math.min(CANVAS_SIZE - 1, x + 1)];
        const firstRow = xCoords.map((x) => edgeData.data[x * 4]);
        let kernel = [firstRow, firstRow, firstRow];

        for (let y = 0; y < CANVAS_SIZE; y++) {
            const i4 = (y * CANVAS_SIZE + x) * 4;

            const nextY = Math.min(CANVAS_SIZE - 1, y + 1);
            kernel.push(xCoords.map((xx) => edgeData.data[(nextY * CANVAS_SIZE + xx) * 4]));
            kernel.shift();

            const xGrad =
                kernel[0][0] +
                kernel[1][0] +
                kernel[1][0] +
                kernel[2][0] -
                kernel[0][2] -
                kernel[1][2] -
                kernel[1][2] -
                kernel[2][2];
            const yGrad =
                kernel[0][0] +
                kernel[0][1] +
                kernel[0][1] +
                kernel[0][2] -
                kernel[2][0] -
                kernel[2][1] -
                kernel[2][1] -
                kernel[2][2];
            edgeData.data[i4 + 1] = 128 + xGrad;
            edgeData.data[i4 + 2] = 128 + yGrad;
        }
    }

    const rng = seededRNG(day * 463);
    const spots: Spot[] = [];
    const rayDeltas = new Array(RAYS).fill(null).map((_, i) => {
        const a = Math.PI * 2 * (i / RAYS);
        return { xd: Math.sin(a), yd: Math.cos(a) };
    });

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

        let walkPixels = RAY_REVEAL_DIST;
        while (walkPixels-- > 0) {
            const i4 = (centerY * CANVAS_SIZE + centerX) * 4;
            if (edgeData.data[i4 + 1] < 128) centerX--;
            else if (edgeData.data[i4 + 1] > 128) centerX++;
            if (edgeData.data[i4 + 2] < 128) centerY--;
            else if (edgeData.data[i4 + 2] > 128) centerY++;
        }

        function rayCost(x: number, y: number, d: number) {
            let v = 0;
            for (let yd = -1; yd <= 1; yd++) {
                for (let xd = -1; xd <= 1; xd++) {
                    v +=
                        edgeData1D[
                            Math.max(0, Math.min(Math.round(centerY + y + yd), CANVAS_SIZE - 1)) * CANVAS_SIZE +
                                Math.max(0, Math.min(Math.round(centerX + x + xd), CANVAS_SIZE - 1))
                        ];
                }
            }
            return RAY_COST(v / 9, d);
        }

        const rayDists: number[] = new Array(RAYS).fill(0);
        const rayPos = rayDeltas.map(({ xd, yd }) => ({ x: xd, y: yd }));
        const rayCosts = rayPos
            .filter(
                ({ x, y }) => x >= -centerX && x < CANVAS_SIZE - centerX && y >= -centerY && y < CANVAS_SIZE - centerY
            )
            .map(({ x, y }, i) => ({ i, cost: rayCost(x, y, rayDists[i]) }))
            .sort((a, b) => a.cost - b.cost);

        let pixelsLeft = RAY_REVEAL_DIST * RAYS;
        while (pixelsLeft-- > 0 && rayCosts.length > 0) {
            const { i } = rayCosts.shift()!;
            rayDists[i]++;
            rayPos[i].x += rayDeltas[i].xd;
            rayPos[i].y += rayDeltas[i].yd;

            if (
                rayPos[i].x >= -centerX &&
                rayPos[i].x < CANVAS_SIZE - centerX &&
                rayPos[i].y >= -centerY &&
                rayPos[i].y < CANVAS_SIZE - centerY &&
                pixelsLeft > 0
            ) {
                const newEntry = { i, cost: rayCost(rayPos[i].x, rayPos[i].y, rayDists[i]) };
                const insertIdx = rayCosts.findIndex((other) => other.cost > newEntry.cost);
                if (insertIdx === -1) {
                    rayCosts.push(newEntry);
                } else {
                    rayCosts.splice(insertIdx, 0, newEntry);
                }
            }
        }

        const avgdRayDists = rayDists.map((origDist, i) => {
            let sum = 0,
                count = 0;
            for (let j = -RAY_AVG_RANGE; j <= RAY_AVG_RANGE; j++) {
                const otherRayDist = rayDists[(i + RAYS + j) % RAYS];
                if (otherRayDist <= CANVAS_SIZE) {
                    sum += otherRayDist;
                    count++;
                }
            }
            return count > 0 ? sum / count : origDist;
        });
        spots.push({
            x: centerX,
            y: centerY,
            rayDists: avgdRayDists,
        });
    }

    const getCanvasForGuess = (failed: number): Canvas => {
        const guessCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const guessCtx = guessCanvas.getContext("2d");
        guessCtx.fillStyle = "black";
        guessCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

        function drawSpots() {
            for (let i = 0; i < failed + 1 && i < spots.length; i++) {
                const spot = spots[i];
                guessCtx.fillStyle = "black";
                guessCtx.beginPath();
                spot.rayDists.forEach((d, i) => {
                    const modD =
                        TURN_DIST_FACTOR[failed] <= 1
                            ? d * TURN_DIST_FACTOR[failed]
                            : d + 100 * (TURN_DIST_FACTOR[failed] - 1);
                    if (modD > 0) guessCtx.lineTo(spot.x + rayDeltas[i].xd * modD, spot.y + rayDeltas[i].yd * modD);
                });
                guessCtx.closePath();
                guessCtx.fill();
            }
        }

        guessCtx.drawImage(grayscaleCanvas, 0, 0);
        guessCtx.globalAlpha = 0.05;
        guessCtx.fillStyle = "#AF176D";
        guessCtx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        guessCtx.putImageData(
            StackBlur.imageDataRGBA(
                guessCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE),
                0,
                0,
                CANVAS_SIZE,
                CANVAS_SIZE,
                UNREVEALED_BLUR
            ),
            0,
            0
        );

        guessCtx.globalAlpha = 1;
        drawSpots();
        guessCtx.putImageData(
            StackBlur.imageDataRGBA(
                guessCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE),
                0,
                0,
                CANVAS_SIZE,
                CANVAS_SIZE,
                SHADOW_RADIUS
            ),
            0,
            0
        );

        guessCtx.globalCompositeOperation = "destination-out";
        drawSpots();
        guessCtx.globalCompositeOperation = "destination-over";
        guessCtx.drawImage(grayscaleCanvas, 0, 0);

        return guessCanvas;
    };
    const getShareCanvas = (): Canvas => {
        return getCanvasForGuess(0);
    };
    return { getCanvasForGuess, getShareCanvas };
}
