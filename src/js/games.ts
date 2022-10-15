import type {Album} from "./albumpool";
import {seededRNG} from "./rng";
import type {Canvas, Image} from "canvas";
import {createCanvas, loadImage} from "canvas";

export const CANVAS_SIZE = 640;

export interface Game {
    name: string,
    getGameInstance(day: number, album: Album, canvas: Image): GameInstance
}
export interface GameInstance {
    getCanvasForGuess(failed: number): Canvas,
    getShareCanvas(): Canvas
}

const GAME_NAMES: string[] = ["mosaic"];
const GAME_CACHE: (Game | undefined)[] = GAME_NAMES.map(() => undefined);

async function getGameForDay(day: number): Promise<Game> {
    const rng = seededRNG(day);
    const gameId = Math.floor(rng() % GAME_NAMES.length);
    if (GAME_CACHE[gameId] === undefined) {
        GAME_CACHE[gameId] = await import(`./games/${GAME_NAMES[gameId]}`);
    }
    return GAME_CACHE[gameId]!;
}

export async function getGameName(day: number): Promise<string> {
    const game = await getGameForDay(day);
    return game.name;
}

export async function getGameInstance(day: number, album: Album): Promise<GameInstance> {
    const [game, image] = await Promise.all(
        [getGameForDay(day), loadImage(album.url)]
    );
    const gameInstance = game.getGameInstance(day, album, image);
    return {
        getCanvasForGuess: (failed: number): Canvas => {
            if (failed < 6) {
                return gameInstance.getCanvasForGuess(failed);
            } else {
                const canvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
                const ctx = canvas.getContext("2d");
                ctx.drawImage(image, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
                return canvas;
            }
        },
        getShareCanvas: gameInstance.getShareCanvas
    }
}