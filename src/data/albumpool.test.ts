import { ALBUM_POOL } from "./albumpool.js";
import { DAY_CURRENT } from "$modules/daily.js";
import { describe, test, expect } from "vitest";
import fs from "fs";
import { loadAssetImage } from "$modules/canvasUtil.js";

describe("Album Image Data", async () => {
    for (const album of ALBUM_POOL) {
        test(album.artistEn + " - " + album.titleEn, async () => {
            if (album.url === "") {
                if (typeof album.weight === "number") {
                    expect(album.weight, "Album without image must have weight 0").toBe(0);
                } else {
                    for (const dayLimit in album.weight) {
                        if (parseInt(dayLimit) >= DAY_CURRENT) {
                            expect(
                                album.weight[dayLimit],
                                "Album without image must have weight 0 from CURRENT_DAY onwards"
                            ).toBe(0);
                        }
                    }
                }
            } else {
                const fileName = "public" + album.url.split("?")[0];
                expect(fs.existsSync(fileName), "File does not exist").toBeTruthy();
                const image = await loadAssetImage(album.url);
                expect(image.width, "Image is too small").toBeGreaterThanOrEqual(640);
                expect(image.height, "Image is too small").toBeGreaterThanOrEqual(640);
            }
        });
    }
});
