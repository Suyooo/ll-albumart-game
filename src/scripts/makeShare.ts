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

/*
    npm run make-share [-- <day>]
*/

const shareDay = process.argv.length > 2 ? parseInt(process.argv[2]) : CURRENT_DAY;

(async () => {
    if (!fs.existsSync("dist/share")) {
        fs.mkdirSync("dist/share", { recursive: true });
    }

    const { rolledAlbumId, rolledGameId } = getIdsForDay(shareDay);
    const { gameInstance } = await getGameInstance(shareDay, GAME_POOL[rolledGameId], ALBUM_POOL[rolledAlbumId]);

    const shareCanvas = gameInstance.getShareCanvas();
    const shareWithBgCanvas = new Canvas(shareCanvas.width, shareCanvas.height);
    const shareWithBgCtx = shareWithBgCanvas.getContext("2d");
    shareWithBgCtx.fillStyle = "black";
    shareWithBgCtx.fillRect(0, 0, shareCanvas.width, shareCanvas.height);
    shareWithBgCtx.drawImage(shareCanvas, 0, 0);

    const stream = shareCanvas.createJPEGStream(jpegConfig);
    const out = fs.createWriteStream("dist/share/" + shareDay + ".jpg");
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
    const wideShareOut = fs.createWriteStream("dist/share/" + shareDay + "w.jpg");
    wideShareStream.pipe(wideShareOut);
    const wideSharePromise = new Promise((resolve) => {
        wideShareOut.on("finish", resolve);
    });

    const template = fs.readFileSync("share_templates/template.html").toString();
    const page = template.replace(/\{\{DAY}}/g, shareDay.toString());
    fs.writeFileSync("dist/share/" + shareDay + ".html", page);

    const templateDiscord = fs.readFileSync("share_templates/template-discord.html").toString();
    const pageDiscord = templateDiscord.replace(/\{\{DAY}}/g, shareDay.toString());
    fs.writeFileSync("dist/share/" + shareDay + "d.html", pageDiscord);

    await sharePromise;
    await wideSharePromise;
})();
