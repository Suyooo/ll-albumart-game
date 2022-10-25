import {Canvas, createCanvas, loadImage} from "canvas";
import fs from "fs";
import type {PlayState} from "$stores/state";
import {CURRENT_DAY, getIdsForDay} from "$modules/daily";
import {getGameInstance} from "$modules/gameHandler";
import {ALBUM_POOL} from "$data/albumpool";
import {GAME_POOL} from "$data/gamepool";

const jpegConfig = {
    quality: 1,
    progressive: false,
    chromaSubsampling: false
};

(async () => {
    // It might be smarter to store this in a JSON or something, but it's pretty fast anyway
    const prevStates: PlayState[] = [];
    for (let i = 1; i < CURRENT_DAY; i++) {
        const {rolledAlbumId, rolledGameId} = getIdsForDay(i, prevStates);
        prevStates.push({
            day: i,
            albumId: rolledAlbumId,
            gameId: rolledGameId
        });
    }

    const {rolledAlbumId, rolledGameId} = getIdsForDay(CURRENT_DAY, prevStates);
    const {gameInstance} = await getGameInstance(CURRENT_DAY, GAME_POOL[rolledGameId], ALBUM_POOL[rolledAlbumId]);
    const shareCanvas = gameInstance.getShareCanvas();
    const shareWithBgCanvas = new Canvas(shareCanvas.width, shareCanvas.height);
    const shareWithBgCtx = shareWithBgCanvas.getContext("2d");
    shareWithBgCtx.fillStyle = "black";
    shareWithBgCtx.fillRect(0, 0, shareCanvas.width, shareCanvas.height);
    shareWithBgCtx.drawImage(shareCanvas, 0, 0);

    const stream = shareCanvas.createJPEGStream(jpegConfig);
    const out = fs.createWriteStream("share/" + CURRENT_DAY + ".jpg");
    stream.pipe(out);
    const sharePromise = new Promise((resolve) => {
        out.on("finish", resolve);
    });

    const wideCanvas = createCanvas(shareCanvas.height * 2, shareCanvas.height);
    const wideCanvasCtx = wideCanvas.getContext("2d");
    const templateCanvas = await loadImage("share/template.png");
    wideCanvasCtx.drawImage(templateCanvas, 0, 0, shareCanvas.height * 2, shareCanvas.height);
    wideCanvasCtx.drawImage(shareCanvas, shareCanvas.height * .5, 0);

    const wideStream = wideCanvas.createJPEGStream(jpegConfig);
    const wideOut = fs.createWriteStream("share/" + CURRENT_DAY + "w.jpg");
    wideStream.pipe(wideOut);
    const widePromise = new Promise((resolve) => {
        wideOut.on("finish", resolve);
    });

    const template = fs.readFileSync("share/template.html").toString();
    const page = template.replace(/\{\{DAY}}/g, CURRENT_DAY.toString());
    fs.writeFileSync("share/" + CURRENT_DAY + ".html", page);

    await sharePromise;
    await widePromise;
})();