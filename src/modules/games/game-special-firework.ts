/** @type {import("../gameHandler").Game} */

import type { AlbumInfo } from "$data/albumpool";
import type { Canvas, Image, ImageData } from "canvas";
import { CanvasRenderingContext2D, createCanvas } from "canvas";
import type { GameInstance } from "../gameHandler";
import { CANVAS_SIZE } from "../gameHandler";
import { seededRNG } from "../rng";

export const stacked = true;
export const hasAltFinished = true;
export const forceAltFinished = true;

const SIZE = [0.1, 0.1, 0.125, 0.15, 0.15, 0.2];
const BORDER_BLUR = 50;
const BLOOM_SIZE = 150;
const DAY_58_POSITIONS: [number, number][] = [
    [0.1, 0.7],
    [0.75, 0.1],
    [0.7, 0.65],
    [0.95, 0.3],
    [0.15, 0.3],
    [0.45, 0.3],
];

const T_RISING = 1000;
const T_EXPAND = 1300;
const T_GRAV = 1200;
const T_BLOOM = 3000;

export function getGameInstance(day: number, _album: AlbumInfo, _image: Image, scaledImage: Canvas): GameInstance {
    function spotlightData(
        srcData: Uint8ClampedArray,
        dstCtx: CanvasRenderingContext2D,
        x: number,
        y: number,
        r: number
    ) {
        const dstData = dstCtx.getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE);
        for (let yd = -r; yd <= r; yd++) {
            for (let xd = -r; xd <= r; xd++) {
                const xp = x + xd;
                if (xp < 0 || xp >= CANVAS_SIZE) continue;
                const yp = y + yd;
                if (yp < 0 || yp >= CANVAS_SIZE) continue;
                const idx = (yp * CANVAS_SIZE + xp) * 4;

                const centerDist = Math.sqrt(xd * xd + yd * yd);
                if (centerDist > r) continue;
                const alphaFactor = 1 - (r - centerDist > BORDER_BLUR ? 1 : (r - centerDist) / BORDER_BLUR);
                const alpha = (srcData[idx + 3] / 255) * (1 - alphaFactor * alphaFactor);

                dstData.data[idx] = srcData[idx];
                dstData.data[idx + 1] = srcData[idx + 1];
                dstData.data[idx + 2] = srcData[idx + 2];
                dstData.data[idx + 3] = alpha * 255;
            }
        }
        return dstData;
    }

    function drawFirework(ctx: CanvasRenderingContext2D, t: number, x: number, y: number, c: number, seed: number) {
        if (t < T_RISING) {
            // Liella! - GOING UP
            const tt = 1 - t / T_RISING;
            const ttt = 1 - tt * tt;
            const yy = CANVAS_SIZE + 10 - (CANVAS_SIZE + 10 - y) * ttt;
            const flicker = t % 100 < 50;

            ctx.lineWidth = 10;
            ctx.lineCap = "round";
            ctx.strokeStyle = `hsla(${c},100%,70%,${flicker ? 1 : 0.5})`;
            ctx.beginPath();
            ctx.moveTo(x, yy);
            ctx.lineTo(x, yy + 20 * tt);
            ctx.stroke();
        } else if (t < T_BLOOM) {
            // µ's - Dancing stars on me!
            const pRng = seededRNG(seed); // new seeded RNG to do particle randomization
            const tt = (t - T_RISING) / (T_BLOOM - T_RISING);
            const tt2 = (tt - 1) * (tt - 1) * (tt - 1);
            const ttt = 1 - tt2 * tt2;
            ctx.lineWidth = 15;
            ctx.lineCap = "round";
            ctx.strokeStyle = `hsla(${c},100%,70%,${1 - ttt * ttt})`;
            let alt = true;

            for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 16) {
                for (let fac = alt ? 1 : 0.9375; fac > 0.4; fac -= 0.125) {
                    angle += (Math.PI / 32) * pRng() - Math.PI / 64;
                    fac -= 0.2 * pRng();
                    const gravOff = 300 * pRng();
                    const gravT = t < T_GRAV + gravOff ? 0 : (t - T_GRAV - gravOff) / (T_BLOOM - T_GRAV);
                    const grav = gravT * gravT * (100 + 500 * pRng());

                    const xc = Math.cos(angle);
                    const yc = -Math.sin(angle);
                    const xx = x + xc * BLOOM_SIZE * fac * ttt;
                    const yy = y + yc * BLOOM_SIZE * fac * ttt + grav;

                    ctx.beginPath();
                    ctx.moveTo(xx, yy);
                    ctx.lineTo(xx, yy + 1);
                    ctx.stroke();
                }
                alt = !alt;
            }
        }
    }

    const scaledImageData = scaledImage.getContext("2d").getImageData(0, 0, CANVAS_SIZE, CANVAS_SIZE).data;
    const canvasAnimationStarts = [0, 0, 0, 0, 0, 0];
    const canvasAnimationLasts = [0, 0, 0, 0, 0, 0];
    const canvasSpotlightOnlyCaches: (null | ImageData)[] = [null, null, null, null, null, null];

    const rng = seededRNG(day * 101);
    const positions =
        day === 58 ? DAY_58_POSITIONS : new Array(6).fill(0).map((_) => [rng() * 0.9 + 0.05, rng() * 0.6 + 0.05]);

    const getCanvasForGuess = (failed: number): Canvas => {
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");

        const r = Math.floor((CANVAS_SIZE * SIZE[failed]) / 1.25);
        const p = positions[failed];
        const x = Math.floor(p[0] * CANVAS_SIZE);
        const y = Math.floor(p[1] * CANVAS_SIZE);
        const c = Math.random() * 360; // using regular random since the firework animation doesn't matter for the game
        const delay = Math.random() * 300;

        const doAnimation = (absT: number): void => {
            let t: number;
            if (canvasAnimationStarts[failed] === 0) {
                canvasAnimationStarts[failed] = absT + delay;
                t = -delay;
            } else {
                t = absT - canvasAnimationStarts[failed];
                const dT = t - canvasAnimationLasts[failed];
                if (dT > 100) {
                    // 10 fps minimum
                    canvasAnimationStarts[failed] += dT - 100;
                    t -= dT - 100;
                }
            }
            canvasAnimationLasts[failed] = t;
            ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

            if (t < T_BLOOM) {
                if (t >= T_RISING) {
                    // Spotlight expands faster than the bloom
                    if (t < T_EXPAND) {
                        const rr = Math.floor(r * ((t - T_RISING) / (T_EXPAND - T_RISING)));
                        const spot = spotlightData(scaledImageData, ctx, x, y, rr);
                        ctx.putImageData(spot, 0, 0, x - rr, y - rr, rr * 2 + 1, rr * 2 + 1);
                    } else {
                        if (canvasSpotlightOnlyCaches[failed] === null) {
                            canvasSpotlightOnlyCaches[failed] = spotlightData(scaledImageData, ctx, x, y, r);
                        }
                        ctx.putImageData(canvasSpotlightOnlyCaches[failed]!, 0, 0, x - r, y - r, r * 2 + 1, r * 2 + 1);
                    }
                }

                // Draw rocket/bloom
                drawFirework(ctx, t, x, y, c, r);
                window.requestAnimationFrame(doAnimation);
            } else {
                // Ready for the Aqours - Next SPARKLING!!
                ctx.putImageData(canvasSpotlightOnlyCaches[failed]!, 0, 0, x - r, y - r, r * 2 + 1, r * 2 + 1);
                // no need to keep animating
            }
        };
        window.requestAnimationFrame(doAnimation);

        return canvas;
    };
    const getShareCanvas = (): Canvas => {
        const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
        const ctx = canvas.getContext("2d");
        const r = Math.floor((CANVAS_SIZE * SIZE[0]) / 1.25);
        const p = positions[0];
        const x = Math.floor(p[0] * CANVAS_SIZE);
        const y = Math.floor(p[1] * CANVAS_SIZE);
        const spot = spotlightData(scaledImageData, ctx, x, y, r);
        ctx.putImageData(spot, 0, 0, x - r, y - r, r * 2 + 1, r * 2 + 1);

        const canvas2 = createCanvas(r * 2 + 1, r * 2 + 1);
        const ctx2 = canvas2.getContext("2d");
        ctx2.drawImage(canvas, x - r, y - r, 2 * r + 1, 2 * r + 1, 0, 0, 2 * r + 1, 2 * r + 1);

        ctx2.lineWidth = 5;
        ctx2.lineCap = "round";

        let alt = true;
        for (let fac = 1.1; fac > 0.7; fac -= 0.3) {
            for (let angle = 0; angle < 2 * Math.PI; angle += Math.PI / 10) {
                const xc = Math.cos(angle);
                const yc = -Math.sin(angle);
                const xx = r + xc * r * (alt ? 0.95 : 0.85) * fac;
                const yy = r + yc * r * (alt ? 0.95 : 0.85) * fac;
                const xx2 = r + xc * r * (alt ? 0.9 : 0.8) * fac;
                const yy2 = r + yc * r * (alt ? 0.9 : 0.8) * fac;
                alt = !alt;
                ctx2.strokeStyle = `hsla(${(angle / (2 * Math.PI)) * 360}, 100%, 70%, 1)`;

                ctx2.beginPath();
                ctx2.moveTo(xx, yy);
                ctx2.lineTo(xx2, yy2);
                ctx2.stroke();
            }
        }

        return canvas2;
    };

    let finishedCanvas: Canvas | undefined = undefined;
    const getAltFinishedCanvas = (): Canvas => {
        if (finishedCanvas === undefined) {
            finishedCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
            const ctx = finishedCanvas.getContext("2d");
            const activeFireworks: {
                startTime: number;
                elapsedTime: number;
                x: number;
                y: number;
                color: number;
                seed: number;
            }[] = [];

            const doAnimation = (absT: number): void => {
                ctx.drawImage(scaledImage, 0, 0);
                for (const firework of activeFireworks) {
                    let t: number;
                    if (firework.startTime < 0) {
                        t = firework.startTime;
                        firework.startTime += absT;
                    } else {
                        t = absT - firework.startTime;
                        const dT = t - firework.elapsedTime;
                        if (dT > 100) {
                            // 10 fps minimum
                            firework.startTime += dT - 100;
                            t -= dT - 100;
                        }
                    }

                    firework.elapsedTime = t;
                    if (t >= 0 && t < T_BLOOM) {
                        drawFirework(ctx, t, firework.x, firework.y, firework.color, firework.seed);
                    }
                }
                window.requestAnimationFrame(doAnimation);
            };
            window.requestAnimationFrame(doAnimation);

            const addFirework = () => {
                while (activeFireworks.length > 0 && activeFireworks[0].elapsedTime >= 3000) {
                    activeFireworks.splice(0, 1);
                }

                if (activeFireworks.length < 4) {
                    activeFireworks.push({
                        x: Math.random() * (CANVAS_SIZE - 100) + 50,
                        y: Math.random() * 0.4 * CANVAS_SIZE + 50,
                        color: Math.random() * 360,
                        seed: Math.random() * 2023,
                        startTime: -Math.random() * 500,
                        elapsedTime: 0,
                    });
                }
            };
            setInterval(addFirework, 1000);
            addFirework();
        }

        return finishedCanvas;
    };
    return { getCanvasForGuess, getShareCanvas, getAltFinishedCanvas };
}
