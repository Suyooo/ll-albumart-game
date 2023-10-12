import { loadImage } from "canvas";
import { ALBUM_POOL } from "./albumpool.js";
import { ACTUAL_CURRENT_DAY } from "$modules/daily.js";
import { describe, test } from "vitest";
import { expect } from "vitest";
import fs from "fs";

describe("Album Image Data", async () => {
    for (const album of ALBUM_POOL) {
        test(album.artistEn + " - " + album.titleEn, async () => {
            if (album.url === "") {
                if (typeof album.weight === "number") {
                    expect(album.weight, "Album without image must have weight 0").toBe(0);
                } else {
                    for (const dayLimit in album.weight) {
                        if (parseInt(dayLimit) >= ACTUAL_CURRENT_DAY) {
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
                const image = await loadImage(fileName);
                expect(image.width, "Image is too small").toBeGreaterThanOrEqual(640);
                expect(image.height, "Image is too small").toBeGreaterThanOrEqual(640);
            }
        });
    }
});
