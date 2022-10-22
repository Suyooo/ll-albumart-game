import {createCanvas} from "canvas";
import fs from "fs";
import {CURRENT_DAY, ROLLED_ALBUM} from "$modules/daily";
import {getGameInstance} from "$modules/games";

(async () => {
    const {gameInstance} = await getGameInstance(CURRENT_DAY, ROLLED_ALBUM);
    const shareCanvas = gameInstance.getShareCanvas();

    const stream = shareCanvas.createPNGStream();
    const out = fs.createWriteStream("share/" + CURRENT_DAY + ".png");
    stream.pipe(out);
    const sharePromise = new Promise((resolve) => {
        out.on("finish", resolve);
    });

    const wideCanvas = createCanvas(shareCanvas.height / 9 * 16, shareCanvas.height);
    const wideCanvasCtx = wideCanvas.getContext("2d");
    wideCanvasCtx.fillStyle = "#292524";
    wideCanvasCtx.fillRect(0, 0, wideCanvas.width, wideCanvas.height);
    wideCanvasCtx.drawImage(shareCanvas, shareCanvas.height / 9 * 3.5, 0);

    const wideStream = wideCanvas.createPNGStream();
    const wideOut = fs.createWriteStream("share/" + CURRENT_DAY + "w.png");
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