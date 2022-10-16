import type {Album} from "./albumpool";
import {smoothScaleSquareWithSrc} from "./canvasUtil";
import {seededRNG} from "./rng";
import type {Canvas, Image} from "canvas";
import {createCanvas, loadImage} from "canvas";

export const CANVAS_SIZE = 640;

export interface Game {
    name: string,

    getGameInstance(day: number, album: Album, image: Image, scaledImage: Canvas): GameInstance
}

export interface GameInstance {
    getCanvasForGuess(failed: number): Canvas,

    getShareCanvas(): Canvas
}

const GAME_POOL: { filename: string, weight: number, cumulativeWeight?: number }[] = [
    {filename: "bubbles", weight: 1000}
];
const GAME_CACHE: (Game | undefined)[] = GAME_POOL.map(() => undefined);

const GAME_POOL_TOTAL_WEIGHT = GAME_POOL.reduce((acc, game): number => {
    game.cumulativeWeight = acc + game.weight;
    return game.cumulativeWeight;
}, 0);

async function getGameForDay(day: number): Promise<Game> {
    const rng = seededRNG(day);
    const gamePickedWeight = rng() * GAME_POOL_TOTAL_WEIGHT;
    const gameId = GAME_POOL.findIndex(game => game.cumulativeWeight! >= gamePickedWeight);
    if (GAME_CACHE[gameId] === undefined) {
        GAME_CACHE[gameId] = await import(`./games/game-${GAME_POOL[gameId].filename}.ts`);
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

    // noinspection JSSuspiciousNameCombination - we want to force it to a square aspect ratio
    const rescaleCanvas = createCanvas(image.width, image.width);
    const rescaleCtx = rescaleCanvas.getContext("2d");
    smoothScaleSquareWithSrc(rescaleCtx, image, 0, 0, image.width, image.height, CANVAS_SIZE);

    const albumArtCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const albumArtCtx = albumArtCanvas.getContext("2d");
    albumArtCtx.drawImage(rescaleCanvas, 0, 0, CANVAS_SIZE, CANVAS_SIZE, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    const gameInstance = game.getGameInstance(day, album, image, albumArtCanvas);

    return {
        getCanvasForGuess: (failed: number): Canvas => {
            if (failed < 6) {
                return gameInstance.getCanvasForGuess(failed);
            } else {
                return albumArtCanvas;
            }
        },
        getShareCanvas: gameInstance.getShareCanvas
    }
}