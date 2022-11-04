import {createCanvas} from "canvas";
import type {Canvas, CanvasRenderingContext2D, Image} from "canvas";

export function smoothScaleSquare(ctx: CanvasRenderingContext2D, srcSize: number, dstSize: number) {
    if (srcSize === dstSize) return;

    let currentSrcSize = srcSize;
    let tempCanvas;

    if (dstSize < srcSize && currentSrcSize / 2 > dstSize) {
        currentSrcSize = Math.floor(currentSrcSize / 2);
        tempCanvas = createCanvas(currentSrcSize, currentSrcSize);
        tempCanvas.getContext("2d").drawImage(ctx.canvas, 0, 0, srcSize, srcSize, 0, 0, currentSrcSize, currentSrcSize);
        while (currentSrcSize / 2 > dstSize) {
            const newSrcSize = Math.floor(currentSrcSize / 2);
            const newTempCanvas = createCanvas(newSrcSize, newSrcSize);
            newTempCanvas.getContext("2d").drawImage(tempCanvas, 0, 0, currentSrcSize, currentSrcSize,
                0, 0, newSrcSize, newSrcSize);
            releaseCanvas(tempCanvas);
            tempCanvas = newTempCanvas;
            currentSrcSize = newSrcSize;
        }
    } else if (dstSize > srcSize && currentSrcSize * 2 < dstSize) {
        currentSrcSize = Math.ceil(currentSrcSize * 2);
        tempCanvas = createCanvas(currentSrcSize, currentSrcSize);
        tempCanvas.getContext("2d").drawImage(ctx.canvas, 0, 0, srcSize, srcSize, 0, 0, currentSrcSize, currentSrcSize);
        while (currentSrcSize * 2 < dstSize) {
            const newSrcSize = Math.ceil(currentSrcSize * 2);
            const newTempCanvas = createCanvas(newSrcSize, newSrcSize);
            newTempCanvas.getContext("2d").drawImage(tempCanvas, 0, 0, currentSrcSize, currentSrcSize,
                0, 0, newSrcSize, newSrcSize);
            releaseCanvas(tempCanvas);
            tempCanvas = newTempCanvas;
            currentSrcSize = newSrcSize;
        }
    } else {
        tempCanvas = createCanvas(srcSize, srcSize);
        tempCanvas.getContext("2d").drawImage(ctx.canvas, 0, 0, srcSize, srcSize, 0, 0, srcSize, srcSize);
    }

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.drawImage(tempCanvas, 0, 0, currentSrcSize, currentSrcSize, 0, 0, dstSize, dstSize);
    releaseCanvas(tempCanvas);
}

export function smoothScaleSquareWithSrc(ctx: CanvasRenderingContext2D, src: Canvas | Image, srcX: number, srcY: number,
                                         srcW: number, srcH: number, dstSize: number) {
    // Do one step forcing the source image into square aspect ratio and adding it to the destination, then continue
    // with the smoothScaleSquare method from above
    if (srcW === dstSize && srcH === dstSize) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    if (dstSize < srcW && dstSize <= srcW / 2) {
        const newSrcSize = srcW / 2;
        ctx.drawImage(src, srcX, srcY, srcW, srcH, 0, 0, newSrcSize, newSrcSize);
        smoothScaleSquare(ctx, newSrcSize, dstSize);
    } else if (dstSize > srcW && dstSize >= srcW * 2) {
        const newSrcSize = srcW * 2;
        ctx.drawImage(src, srcX, srcY, srcW, srcH, 0, 0, newSrcSize, newSrcSize);
        smoothScaleSquare(ctx, newSrcSize, dstSize);
    } else {
        // close enough, bring it over and square it
        ctx.drawImage(src, srcX, srcY, srcW, srcH, 0, 0, dstSize, dstSize);
    }
}

export function releaseCanvas(canvas: Canvas) {
    canvas.width = 0;
    canvas.height = 0;
}