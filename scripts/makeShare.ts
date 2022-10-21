import fs from "fs";
import {CURRENT_DAY, ROLLED_ALBUM} from "$modules/daily";
import {getGameInstance} from "$modules/games";

(async () => {
    const {gameInstance} = await getGameInstance(CURRENT_DAY, ROLLED_ALBUM);
    const shareCanvas = gameInstance.getShareCanvas();

    const stream = shareCanvas.createPNGStream();
    const out = fs.createWriteStream("share/" + CURRENT_DAY + ".png");
    stream.pipe(out);
    await new Promise((resolve) => {
        out.on("finish", resolve);
    })

    const template = fs.readFileSync("share/template.html").toString();
    const page = template.replace(/\{\{DAY}}/g, CURRENT_DAY.toString());
    fs.writeFileSync("share/" + CURRENT_DAY + ".html", page);
})();