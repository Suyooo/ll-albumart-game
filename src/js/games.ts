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

const GAME_POOL: { filename: string, weight: number, cumulativeWeight?: number }[] = [
    {filename: "pixelized", weight: 1000}
];
const GAME_CACHE: (Game | undefined)[] = GAME_POOL.map(() => undefined);

const GAME_POOL_TOTAL_WEIGHT = GAME_POOL.reduce((acc, game): number => {
    game.cumulativeWeight = acc + game.weight;
    return game.cumulativeWeight;
}, 0);

async function getGameForDay(day: number): Promise<Game> {
    const rng = seededRNG(day);
    const gamePickedWeight = rng() * GAME_POOL_TOTAL_WEIGHT;
    const gameId = GAME_POOL.findIndex(game => game.cumulativeWeight! < gamePickedWeight);
    if (GAME_CACHE[gameId] === undefined) {
        GAME_CACHE[gameId] = await import(`./games/${GAME_POOL[gameId].filename}`);
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