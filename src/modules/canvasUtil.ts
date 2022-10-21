import type {Canvas, CanvasRenderingContext2D, Image} from "canvas";

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

export function smoothScaleSquareWithSrc(ctx: CanvasRenderingContext2D, src: Canvas | Image, srcX: number, srcY: number,
                                         srcW: number, srcH: number, dstSize: number) {
    // Do one step forcing the source image into square aspect ratio and adding it to the destination, then continue
    // with the smoothScaleSquare method from above
    if (srcW === dstSize && srcH === dstSize) return;

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