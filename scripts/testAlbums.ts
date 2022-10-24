import {loadImage} from "canvas";
import {ALBUM_POOL} from "../src/data/albumpool.js";

(async () => {
    for (const album of ALBUM_POOL) {
        if (album.url === "") continue;
        const image = await loadImage("public" + album.url);
        if (image.width < 640 || image.height < 640) console.log(album.titleEn + " is too small");
        const rescaleHeight = Math.floor(640 / image.width * image.height);
        const paddingRescale = Math.ceil((640 - rescaleHeight) / 2);
        if (paddingRescale >= 10) console.log(album.titleEn + " is a wide cover (just fyi)");
    }
})();