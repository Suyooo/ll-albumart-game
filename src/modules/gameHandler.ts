import type { AlbumInfo } from "$data/albumpool";
import type { GameInfo } from "$data/gamepool";
import { loadAssetImage } from "$modules/canvasUtil.js";
import type { Canvas, Image } from "canvas";
import { createCanvas } from "canvas";

export const CANVAS_SIZE = 640;

export interface Game {
    stacked: boolean;
    hasAltFinished: boolean;
    forceAltFinished: boolean;

    getGameInstance(day: number, album: AlbumInfo, image: Image, scaledImage: Canvas): Promise<GameInstance>;
}

export interface GameInstance {
    getCanvasForGuess(failed: number): Canvas;

    getShareCanvas(): Canvas;

    getAltFinishedCanvas?(): Canvas;
}

export interface GameInstanceSiteWrapper {
    base: Game;

    getCanvasForGuess(failed: number): HTMLCanvasElement;

    getShareCanvas(): HTMLCanvasElement;

    getFinishedCanvas(): HTMLCanvasElement;

    getAltFinishedCanvas(): HTMLCanvasElement;
}

const GAME_CACHE: { [filename: string]: Game } = {};

async function getGameFromGameInfo(gameInfo: GameInfo): Promise<Game> {
    const filename = gameInfo.filename;
    if (GAME_CACHE[filename] === undefined) {
        GAME_CACHE[filename] = await import(`$modules/games/game-${filename}.ts`);
    }
    return GAME_CACHE[filename];
}

export async function getGameInstance(
    day: number,
    gameInfo: GameInfo,
    album: AlbumInfo
): Promise<{ game: Game; gameInstance: GameInstance; scaledAlbumArt: Canvas }> {
    const [game, image] = await Promise.all([getGameFromGameInfo(gameInfo), loadAssetImage(album.url)]);

    let paddingOriginal = Math.ceil((image.width - image.height) / 2);
    const rescaleHeight = Math.floor((CANVAS_SIZE / image.width) * image.height);
    let paddingRescale = Math.ceil((CANVAS_SIZE - rescaleHeight) / 2);
    if (paddingRescale < 10) {
        paddingOriginal = paddingRescale = 0;
    }

    const scaledAlbumArtCanvas = createCanvas(CANVAS_SIZE, CANVAS_SIZE);
    const scaledAlbumArtCtx = scaledAlbumArtCanvas.getContext("2d");
    scaledAlbumArtCtx.drawImage(
        image,
        0,
        0,
        image.width,
        image.height,
        0,
        paddingRescale,
        CANVAS_SIZE,
        CANVAS_SIZE - paddingRescale * 2
    );

    return {
        game,
        gameInstance: await game.getGameInstance(day, album, image, scaledAlbumArtCanvas),
        scaledAlbumArt: scaledAlbumArtCanvas,
    };
}

export async function getGameSiteInstance(
    day: number,
    gameInfo: GameInfo,
    album: AlbumInfo
): Promise<GameInstanceSiteWrapper> {
    const { game, gameInstance, scaledAlbumArt } = await getGameInstance(day, gameInfo, album);

    const CACHE: (HTMLCanvasElement | undefined)[] = [undefined, undefined, undefined, undefined, undefined, undefined];

    return {
        base: game,
        getCanvasForGuess: (failed: number): HTMLCanvasElement => {
            if (game.stacked) {
                if (CACHE[failed] === undefined)
                    CACHE[failed] = <HTMLCanvasElement>(<unknown>gameInstance.getCanvasForGuess(failed));
                return CACHE[failed]!;
            } else {
                return <HTMLCanvasElement>(<unknown>gameInstance.getCanvasForGuess(failed));
            }
        },
        getShareCanvas: <() => HTMLCanvasElement>(<unknown>gameInstance.getShareCanvas),
        getFinishedCanvas: () => <HTMLCanvasElement>(<unknown>scaledAlbumArt),
        getAltFinishedCanvas: game.hasAltFinished
            ? <() => HTMLCanvasElement>(<unknown>gameInstance.getAltFinishedCanvas)
            : () => <HTMLCanvasElement>(<unknown>scaledAlbumArt),
    };
}
