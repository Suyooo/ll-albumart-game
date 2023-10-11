import { Canvas, createCanvas, loadImage } from "canvas";
import fs from "fs";
import { CURRENT_DAY, getIdsForDay } from "$modules/daily";
import { getGameInstance } from "$modules/gameHandler";
import { ALBUM_POOL } from "$data/albumpool";
import { GAME_POOL } from "$data/gamepool";

const jpegConfig = {
    quality: 1,
    progressive: false,
    chromaSubsampling: false,
};

(async () => {
    if (!fs.existsSync("dist/share")) {
        fs.mkdirSync("dist/share");
    }

    const { rolledAlbumId, rolledGameId } = getIdsForDay(CURRENT_DAY);
    const queryIdx = ALBUM_POOL[rolledAlbumId].url.indexOf("?");
    if (queryIdx !== -1) {
        ALBUM_POOL[rolledAlbumId].url = ALBUM_POOL[rolledAlbumId].url.substring(0, queryIdx);
    }

    const { gameInstance } = await getGameInstance(CURRENT_DAY, GAME_POOL[rolledGameId], ALBUM_POOL[rolledAlbumId]);
    const shareCanvas = gameInstance.getShareCanvas();
    const shareWithBgCanvas = new Canvas(shareCanvas.width, shareCanvas.height);
    const shareWithBgCtx = shareWithBgCanvas.getContext("2d");
    shareWithBgCtx.fillStyle = "black";
    shareWithBgCtx.fillRect(0, 0, shareCanvas.width, shareCanvas.height);
    shareWithBgCtx.drawImage(shareCanvas, 0, 0);

    const stream = shareCanvas.createJPEGStream(jpegConfig);
    const out = fs.createWriteStream("dist/share/" + CURRENT_DAY + ".jpg");
    stream.pipe(out);
    const sharePromise = new Promise((resolve) => {
        out.on("finish", resolve);
    });

    const wideShareCanvas = createCanvas(shareCanvas.height * 2, shareCanvas.height);
    const wideShareCanvasCtx = wideShareCanvas.getContext("2d");
    const templateCanvas = await loadImage("share_templates/template.png");
    wideShareCanvasCtx.drawImage(templateCanvas, 0, 0, shareCanvas.height * 2, shareCanvas.height);
    wideShareCanvasCtx.drawImage(shareCanvas, shareCanvas.height * 0.5, 0);

    const wideShareStream = wideShareCanvas.createJPEGStream(jpegConfig);
    const wideShareOut = fs.createWriteStream("dist/share/" + CURRENT_DAY + "w.jpg");
    wideShareStream.pipe(wideShareOut);
    const wideSharePromise = new Promise((resolve) => {
        wideShareOut.on("finish", resolve);
    });

    const template = fs.readFileSync("share_templates/template.html").toString();
    const page = template.replace(/\{\{DAY}}/g, CURRENT_DAY.toString());
    fs.writeFileSync("dist/share/" + CURRENT_DAY + ".html", page);

    const templateDiscord = fs.readFileSync("share_templates/template-discord.html").toString();
    const pageDiscord = templateDiscord.replace(/\{\{DAY}}/g, CURRENT_DAY.toString());
    fs.writeFileSync("dist/share/" + CURRENT_DAY + "d.html", pageDiscord);

    await sharePromise;
    await wideSharePromise;
})();
