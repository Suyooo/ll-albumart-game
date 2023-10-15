import { test, expect } from "vitest";
import fs from "fs";
import { getIdsForDay, ACTUAL_CURRENT_DAY } from "$modules/daily.js";
import { ROLL_HISTORY_FILE, type RollHistory } from "$modules/rollHistory.js";

test("Test against roll history", () => {
    expect(
        fs.existsSync(ROLL_HISTORY_FILE),
        `${ROLL_HISTORY_FILE} does not exist, failing test to play it safe. If this is the first test run, create an empty file to run this test with ignored results.`
    ).toBeTruthy();
    const prevRollHistory: RollHistory = JSON.parse(fs.readFileSync(ROLL_HISTORY_FILE).toString() || "{}");
    const prevRollHistorySize = Object.keys(prevRollHistory).length;
    const thisRollHistory: RollHistory = {};

    let day = 1;
    while (day <= ACTUAL_CURRENT_DAY) {
        const rollRes = getIdsForDay(day, true);
        if (day <= prevRollHistorySize) {
            expect(
                prevRollHistory[day],
                `${ROLL_HISTORY_FILE} does not contain day ${day}, failing test to play it safe. There must not be gaps in the history file.`
            ).toBeDefined();
            expect(rollRes.rolledAlbumId, `Album ID differs on day ${day}`).toBe(prevRollHistory[day][0]);
            expect(rollRes.rolledGameId, `Game ID differs on day ${day}`).toBe(prevRollHistory[day][1]);
        }
        thisRollHistory[day] = [rollRes.rolledAlbumId, rollRes.rolledGameId];
        day++;
    }

    fs.writeFileSync(ROLL_HISTORY_FILE, JSON.stringify(thisRollHistory));
});
