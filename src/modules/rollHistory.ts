import fs from "fs";
export const ROLL_HISTORY_FILE = "roll-history.json";

export type RollHistoryItem = [number, number];
export type RollHistory = { [day: string]: RollHistoryItem };

let rollHistory: RollHistory | undefined = undefined;

export function recordRoll(day: number, album: number, game: number) {
    if (rollHistory === undefined) {
        rollHistory = JSON.parse(
            (fs.existsSync(ROLL_HISTORY_FILE) ? fs.readFileSync(ROLL_HISTORY_FILE).toString() : null) || "{}"
        );
    }
    if (rollHistory![day] === undefined) {
        rollHistory![day] = [album, game];
        fs.writeFileSync(ROLL_HISTORY_FILE, JSON.stringify(rollHistory));
    }
}
