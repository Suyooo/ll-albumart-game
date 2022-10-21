import type {Album} from "$data/albumpool";
import {smoothScaleSquareWithSrc} from "./canvasUtil";
import {seededRNG} from "./rng";
import type {Canvas, Image} from "canvas";
import {createCanvas, loadImage} from "canvas";

export const CANVAS_SIZE = 640;

export interface Game {
    name: string,
    stacked: boolean,

    getGameInstance(day: number, album: Album, image: Image, scaledImage: Canvas): GameInstance
}

export interface GameInstance {
    getCanvasForGuess(failed: number): Canvas,

    getShareCanvas(): Canvas
}

export interface GameInstanceSiteWrapper {
    base: Game,

    getCanvasForGuess(failed: number): HTMLCanvasElement,

    getShareCanvas(): HTMLCanvasElement,

    getFinishedCanvas(): HTMLCanvasElement
}

const GAME_POOL: { filename: string, weight: number, cumulativeWeight?: number }[] = [
    {filename: "pixelized", weight: 1000},
    {filename: "bubbles", weight: 1000},
    {filename: "posterize", weight: 1000},
    {filename: "crop", weight: 1000},
    {filename: "blinds-h", weight: 500},
    {filename: "blinds-v", weight: 500},
    {filename: "tiles", weight: 1000}
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
        GAME_CACHE[gameId] = await import(`$modules/games/game-${GAME_POOL[gameId].filename}.ts`);
    }
    return GAME_CACHE[gameId]!;
}

export async function getGameName(day: number): Promise<string> {
    const game = await getGameForDay(day);
    return game.name;
}

export async function getGameInstance(day: number, album: Album):
    Promise<{ game: Game, gameInstance: GameInstance, albumArt: Canvas }> {
    const [game, image] = await Promise.all(
        [getGameForDay(day), loadImage(`albumart/${album.url}`)]
    );

    // noinspection JSSuspiciousNameCombination - we want to force it to a square aspect ratio
    const rescaleCanvas = createCanvas(Math.max(image.width, CANVAS_SIZE), Math.max(image.height, CANVAS_SIZE));
    const rescaleCtx = rescaleCanvas.getContext("2d");
    smoothScaleSquareWithSrc(rescaleCtx, image, 0, 0, image.width, image.height, CANVAS_SIZE);

    const albumArtCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const albumArtCtx = albumArtCanvas.getContext("2d");
    albumArtCtx.drawImage(rescaleCanvas, 0, 0, CANVAS_SIZE, CANVAS_SIZE, 0, 0, CANVAS_SIZE, CANVAS_SIZE);
    return {game, gameInstance: game.getGameInstance(day, album, image, albumArtCanvas), albumArt: albumArtCanvas};
}

export async function getGameSiteInstance(day: number, album: Album): Promise<GameInstanceSiteWrapper> {
    const {game, gameInstance, albumArt} = await getGameInstance(day, album);

    const CACHE: (HTMLCanvasElement | undefined)[] = [undefined, undefined, undefined, undefined, undefined, undefined];

    return {
        base: game,
        getCanvasForGuess: (failed: number): HTMLCanvasElement => {
            if (game.stacked) {
                if (CACHE[failed] === undefined)
                    CACHE[failed] = <HTMLCanvasElement><unknown>gameInstance.getCanvasForGuess(failed);
                return CACHE[failed]!;
            } else {
                return <HTMLCanvasElement><unknown>gameInstance.getCanvasForGuess(failed);
            }
        },
        getShareCanvas: <() => HTMLCanvasElement><unknown>gameInstance.getShareCanvas,
        getFinishedCanvas: () => <HTMLCanvasElement><unknown>albumArt
    }
}