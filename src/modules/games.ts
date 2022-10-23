import type {AlbumInfo} from "$data/albumpool";
import type {GameInfo} from "$data/gamepool";
import {smoothScaleSquareWithSrc} from "./canvasUtil";
import type {Canvas, Image} from "canvas";
import {createCanvas, loadImage} from "canvas";

export const CANVAS_SIZE = 640;

export interface Game {
    stacked: boolean,

    getGameInstance(day: number, album: AlbumInfo, image: Image, scaledImage: Canvas): GameInstance
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

const GAME_CACHE: {[filename: string]: Game} = {};

async function getGameFromGameInfo(gameInfo: GameInfo): Promise<Game> {
    const filename = gameInfo.filename;
    if (GAME_CACHE[filename] === undefined) {
        GAME_CACHE[filename] = await import(`$modules/games/game-${filename}.ts`);
    }
    return GAME_CACHE[filename];
}

export async function getGameInstance(day: number, gameInfo: GameInfo, album: AlbumInfo):
    Promise<{ game: Game, gameInstance: GameInstance, albumArt: Canvas }> {
    const [game, image] = await Promise.all(
        [getGameFromGameInfo(gameInfo), loadImage(`.${album.url}`)]
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

export async function getGameSiteInstance(day: number, gameInfo: GameInfo, album: AlbumInfo): Promise<GameInstanceSiteWrapper> {
    const {game, gameInstance, albumArt} = await getGameInstance(day, gameInfo, album);

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