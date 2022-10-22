import fs from "fs";
import axios from "axios";
import {ALBUMPOOL} from "../src/data/albumpool.js";

const downloadQueue: { titleJa?: string, titleEn?: string, url: string, used?: boolean }[] = [
];

(async () => {
    for (const album of ALBUMPOOL) {
        if (album.url) continue;

        const dl = downloadQueue.find(dl => dl.titleEn == album.titleEn || dl.titleJa == album.titleJa);
        if (dl && dl.url) {
            const filename = album.artistEn.replace(" High School Idol Club","")
                    .replace(/ \(CV: [^)]*\)/,"") .replace("-$","_")
                    .toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-") + "_"
                + album.titleEn.toLowerCase().replace(/[^a-zA-Z0-9]+/g, "-")
                    .replace(/-$/g,"") + ".jpg";

            if (dl.url.startsWith("https")) {
                await axios({
                    url: dl.url,
                    responseType: "stream",
                }).then(response => {
                    new Promise(() => {
                        response.data.pipe(fs.createWriteStream("public/albumart/" + filename));
                    });
                });
            } else {
                fs.copyFileSync("public/albumart/" + dl.url, "public/albumart/" + filename);
                fs.unlinkSync("public/albumart/" + dl.url);
            }
            dl.used = true;
            album.url = "/albumart/" + filename;
        }
    }

    fs.writeFileSync("src/data/albumpool.json", JSON.stringify(ALBUMPOOL, null, 4));

    for (const dl of downloadQueue) {
        if (!dl.used) console.log("Unused: " + (dl.titleEn || dl.titleJa));
    }
})();