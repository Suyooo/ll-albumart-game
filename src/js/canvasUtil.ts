import type {CanvasRenderingContext2D} from "canvas";

export function smoothScaleSquare(ctx: CanvasRenderingContext2D, srcSize: number, dstSize: number) {
    if (srcSize === dstSize) return;

    let currentSrcSize = srcSize;
    const canvas = ctx.canvas;

    if (dstSize < srcSize) {
        while (currentSrcSize / 2 > dstSize) {
            const newSrcSize = currentSrcSize / 2;
            ctx.drawImage(canvas, 0, 0, currentSrcSize, currentSrcSize, 0, 0, newSrcSize, newSrcSize);
            currentSrcSize = newSrcSize;
        }
    } else {
        while (currentSrcSize * 2 < dstSize) {
            const newSrcSize = currentSrcSize * 2;
            ctx.drawImage(canvas, 0, 0, currentSrcSize, currentSrcSize, 0, 0, newSrcSize, newSrcSize);
            currentSrcSize = newSrcSize;
        }
    }

    ctx.drawImage(canvas, 0, 0, currentSrcSize, currentSrcSize, 0, 0, dstSize, dstSize);
}