import { rerollDays } from "$data/rerolls.js";
import { DAY_CURRENT } from "$modules/daily.js";
import fs from "fs";

if (process.argv.length < 4) {
    console.error("Not enough arguments. npm run set-reroll -- [day] [rerolls]");
    process.exit(1);
}

const newDay = parseInt(process.argv[2]);
const newRerolls = parseInt(process.argv[3]);
const oldDay = parseInt(Object.keys(rerollDays).at(-1)!);
const oldRerolls = rerollDays[oldDay];

if (newDay < oldDay || newDay <= DAY_CURRENT) {
    console.error("Can't set rerolls for past days");
    process.exit(1);
}
if ((newDay > oldDay && newRerolls === 0) || (newDay === oldDay && newRerolls === oldRerolls)) {
    // ignore silently (since current state equals desired state)
    process.exit(0);
}
const replaceLastLine = newDay === oldDay;

const lines = fs.readFileSync("src/data/rerolls.ts").toString().split("\n");
const endOfJsonLineIdx = lines.lastIndexOf("};");
const newLine = `    ${newDay}: ${newRerolls},`;
if (replaceLastLine) {
    if (newRerolls === 0) {
        lines.splice(endOfJsonLineIdx - 1, 1);
    } else {
        lines[endOfJsonLineIdx - 1] = newLine;
    }
} else {
    lines.splice(endOfJsonLineIdx, 0, newLine);
}
fs.writeFileSync("src/data/rerolls.ts", lines.join("\n"));
