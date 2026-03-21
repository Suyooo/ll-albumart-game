/** @type {import("../gameHandler").Game} */

import type { AlbumInfo } from "$data/albumpool";
import { loadAssetImage } from "$modules/canvasUtil";
import type { Canvas, Image } from "canvas";
import { createCanvas } from "canvas";
import type { GameInstance } from "../gameHandler";
import { CANVAS_SIZE } from "../gameHandler";

export const stacked = false;
export const hasAltFinished = true;
export const forceAltFinished = false;

const SIZE = [64, 16, 8, 5, 3, 2, 1];

export async function getGameInstance(
	_day: number,
	_album: AlbumInfo,
	image: Image,
	_scaledImage: Canvas
): Promise<GameInstance> {
	const scrollImage = await loadAssetImage("/assets/special/long-scroll.png");
	const getCanvasForGuess = (failed: number): Canvas => {
		let size = SIZE[failed];
		while (size > 1) {
			try {
				const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE * size);
				const ctx = canvas.getContext("2d");
				ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, CANVAS_SIZE, CANVAS_SIZE * size);

				if (failed === 0) {
					ctx.drawImage(
						scrollImage,
						0,
						0,
						scrollImage.width,
						scrollImage.height,
						0,
						0,
						CANVAS_SIZE,
						scrollImage.height
					);
				}

				return canvas;
			} catch {
				// pass
			}
			size--;
		}
		throw new Error("what's wrong with your browser");
	};
	const getShareCanvas = (): Canvas => {
		const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
		const ctx = canvas.getContext("2d");
		ctx.drawImage(image, 0, 0, image.width, image.height, 0, 0, CANVAS_SIZE, CANVAS_SIZE * 32);
		return canvas;
	};

	return { getCanvasForGuess, getShareCanvas };
}
