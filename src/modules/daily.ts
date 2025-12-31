import type { AlbumInfo } from "$data/albumpool";
import { ALBUM_POOL } from "$data/albumpool";
import type { GameInfo } from "$data/gamepool";
import { GAME_POOL } from "$data/gamepool";
import { rerollDays } from "$data/rerolls";
import { seededRNG } from "$modules/rng";
import { recordRoll } from "$modules/rollHistory.js";

const ZERO_DAY_TIMESTAMP = 1667487600000; // game begins 24h after this
// quick day counter: https://www.timeanddate.com/date/durationresult.html?d1=4&m1=11&y1=2022
const MS_PER_DAY = 86400000;

export const DAY_CURRENT = Math.floor((Date.now() - ZERO_DAY_TIMESTAMP) / MS_PER_DAY);
export const DAY_MODMODE_OR_NORMAL =
	DAY_CURRENT +
	(typeof localStorage !== "undefined" ? parseInt(localStorage.getItem("llalbum-modmode-day-offset") || "0") : 0);
export const DAY_DEVMODE = parseInt(import.meta.env.VITE_LOCK_DAY) || Math.floor(Math.random() * 1000000);
export const DAY_TO_PLAY = import.meta.env.DEV ? DAY_DEVMODE : DAY_MODMODE_OR_NORMAL;

interface Pickable {
	id: number;
	cumulativeWeight: number;
}

function getFilteredPoolForDay<T extends AlbumInfo | GameInfo>(list: readonly T[], day: number): (T & Pickable)[] {
	const pool: (T & Pickable)[] = list
		.map((item, id) => ({ id, cumulativeWeight: 0, ...item }))
		.filter((item) => item.startOnDay <= day);

	pool.reduce((acc, item): number => {
		let w: number;
		if (typeof item.weight === "number") {
			w = item.weight;
		} else {
			const highestFromDay = Object.keys(item.weight)
				.map((x) => parseInt(x))
				.reduce((highest, fromDay) => (fromDay <= day && fromDay > highest ? fromDay : highest));
			w = item.weight[highestFromDay];
		}
		item.cumulativeWeight = acc + w;
		return item.cumulativeWeight;
	}, 0);

	return pool;
}

function pickFrom(list: readonly Pickable[], rng: () => number, blocked: Set<number>): number {
	let rolled: number;
	do {
		const weight = rng() * list.at(-1)!.cumulativeWeight;
		const index = list.findIndex((game) => game.cumulativeWeight > weight);
		rolled = list[index].id;
	} while (blocked.has(rolled));
	return rolled;
}

const DAILY_ROLL_CACHE: { [day: number]: { rolledAlbumId: number; rolledGameId: number } } = {};

const FORCED_DAYS: { [day: number]: { rolledAlbumId: number; rolledGameId: number } } = {
	// Hardcoding first few rounds as an "intro" - so the first week is one of each game, to give people a taste :)
	1: { rolledAlbumId: 119, rolledGameId: 0 }, // D1: Eutopia (Pixelated)
	2: { rolledAlbumId: 144, rolledGameId: 4 }, // D2: Bokura wa Ima no Naka de (Blinds H)
	3: { rolledAlbumId: 10, rolledGameId: 7 }, // D3: Starlight Prologue (Shuffled)
	4: { rolledAlbumId: 86, rolledGameId: 6 }, // D4: Torikoriko PLEASE!! (Tiles)
	5: { rolledAlbumId: 146, rolledGameId: 2 }, // D5: Susume Tomorrow / START:DASH!! (Blobs)
	6: { rolledAlbumId: 123, rolledGameId: 3 }, // D6: Eien no Isshun (Zoomed In)
	7: { rolledAlbumId: 39, rolledGameId: 1 }, // D7: Bouken Type A, B, C!! (Bubbles)
	// First random week - I increased the game reroll limit on day 14, so results might be different otherwise
	8: { rolledAlbumId: 32, rolledGameId: 4 },
	9: { rolledAlbumId: 26, rolledGameId: 0 },
	10: { rolledAlbumId: 115, rolledGameId: 2 },
	11: { rolledAlbumId: 8, rolledGameId: 1 },
	12: { rolledAlbumId: 118, rolledGameId: 5 },
	13: { rolledAlbumId: 229, rolledGameId: 6 },
	14: { rolledAlbumId: 186, rolledGameId: 7 },
	58: { rolledAlbumId: 9, rolledGameId: 8 }, // New Year 2023: Special Fireworks Mode
	100: { rolledAlbumId: 129, rolledGameId: 9 }, // Introduction of Shuffled-Moving Mode
	147: { rolledAlbumId: 150, rolledGameId: 3 }, // Last day of SIF
	148: { rolledAlbumId: 21, rolledGameId: 10 }, // April Fools 2023: Special Kotobomb Mode
	234: { rolledAlbumId: 249, rolledGameId: 1 }, // Last day of SIFAS final event
	366: { rolledAlbumId: 121, rolledGameId: 11 }, // Introduction of Monochrome Mode
	423: { rolledAlbumId: 158, rolledGameId: 8 }, // New Year 2024: Special Fireworks Mode
	514: { rolledAlbumId: 12, rolledGameId: 12 }, // April Fools 2024: Special Gravity Mode
	1000: { rolledAlbumId: 158, rolledGameId: 11 }, // Checkpoint at 1000-1150 to limit regenerations
	1001: { rolledAlbumId: 195, rolledGameId: 7 },
	1002: { rolledAlbumId: 310, rolledGameId: 2 },
	1003: { rolledAlbumId: 339, rolledGameId: 6 },
	1004: { rolledAlbumId: 235, rolledGameId: 0 },
	1005: { rolledAlbumId: 24, rolledGameId: 1 },
	1006: { rolledAlbumId: 297, rolledGameId: 3 },
	1007: { rolledAlbumId: 327, rolledGameId: 11 },
	1008: { rolledAlbumId: 276, rolledGameId: 4 },
	1009: { rolledAlbumId: 52, rolledGameId: 6 },
	1010: { rolledAlbumId: 12, rolledGameId: 7 },
	1011: { rolledAlbumId: 314, rolledGameId: 0 },
	1012: { rolledAlbumId: 263, rolledGameId: 2 },
	1013: { rolledAlbumId: 148, rolledGameId: 3 },
	1014: { rolledAlbumId: 240, rolledGameId: 1 },
	1015: { rolledAlbumId: 338, rolledGameId: 5 },
	1016: { rolledAlbumId: 152, rolledGameId: 6 },
	1017: { rolledAlbumId: 187, rolledGameId: 11 },
	1018: { rolledAlbumId: 168, rolledGameId: 0 },
	1019: { rolledAlbumId: 159, rolledGameId: 3 },
	1020: { rolledAlbumId: 16, rolledGameId: 1 },
	1021: { rolledAlbumId: 270, rolledGameId: 5 },
	1022: { rolledAlbumId: 315, rolledGameId: 2 },
	1023: { rolledAlbumId: 133, rolledGameId: 7 },
	1024: { rolledAlbumId: 292, rolledGameId: 0 },
	1025: { rolledAlbumId: 23, rolledGameId: 11 },
	1026: { rolledAlbumId: 128, rolledGameId: 6 },
	1027: { rolledAlbumId: 178, rolledGameId: 4 },
	1028: { rolledAlbumId: 156, rolledGameId: 1 },
	1029: { rolledAlbumId: 114, rolledGameId: 3 },
	1030: { rolledAlbumId: 312, rolledGameId: 9 },
	1031: { rolledAlbumId: 252, rolledGameId: 0 },
	1032: { rolledAlbumId: 163, rolledGameId: 6 },
	1033: { rolledAlbumId: 192, rolledGameId: 11 },
	1034: { rolledAlbumId: 162, rolledGameId: 5 },
	1035: { rolledAlbumId: 267, rolledGameId: 1 },
	1036: { rolledAlbumId: 334, rolledGameId: 2 },
	1037: { rolledAlbumId: 55, rolledGameId: 3 },
	1038: { rolledAlbumId: 243, rolledGameId: 0 },
	1039: { rolledAlbumId: 110, rolledGameId: 6 },
	1040: { rolledAlbumId: 34, rolledGameId: 5 },
	1041: { rolledAlbumId: 142, rolledGameId: 11 },
	1042: { rolledAlbumId: 151, rolledGameId: 9 },
	1043: { rolledAlbumId: 295, rolledGameId: 3 },
	1044: { rolledAlbumId: 296, rolledGameId: 0 },
	1045: { rolledAlbumId: 45, rolledGameId: 1 },
	1046: { rolledAlbumId: 275, rolledGameId: 5 },
	1047: { rolledAlbumId: 289, rolledGameId: 6 },
	1048: { rolledAlbumId: 0, rolledGameId: 2 },
	1049: { rolledAlbumId: 53, rolledGameId: 11 },
	1050: { rolledAlbumId: 50, rolledGameId: 0 },
	1051: { rolledAlbumId: 9, rolledGameId: 3 },
	1052: { rolledAlbumId: 84, rolledGameId: 5 },
	1053: { rolledAlbumId: 237, rolledGameId: 6 },
	1054: { rolledAlbumId: 193, rolledGameId: 2 },
	1055: { rolledAlbumId: 3, rolledGameId: 11 },
	1056: { rolledAlbumId: 161, rolledGameId: 0 },
	1057: { rolledAlbumId: 131, rolledGameId: 3 },
	1058: { rolledAlbumId: 281, rolledGameId: 4 },
	1059: { rolledAlbumId: 323, rolledGameId: 7 },
	1060: { rolledAlbumId: 282, rolledGameId: 2 },
	1061: { rolledAlbumId: 278, rolledGameId: 6 },
	1062: { rolledAlbumId: 86, rolledGameId: 1 },
	1063: { rolledAlbumId: 155, rolledGameId: 3 },
	1064: { rolledAlbumId: 247, rolledGameId: 0 },
	1065: { rolledAlbumId: 1, rolledGameId: 11 },
	1066: { rolledAlbumId: 293, rolledGameId: 5 },
	1067: { rolledAlbumId: 223, rolledGameId: 6 },
	1068: { rolledAlbumId: 112, rolledGameId: 1 },
	1069: { rolledAlbumId: 248, rolledGameId: 3 },
	1070: { rolledAlbumId: 300, rolledGameId: 0 },
	1071: { rolledAlbumId: 165, rolledGameId: 7 },
	1072: { rolledAlbumId: 277, rolledGameId: 5 },
	1073: { rolledAlbumId: 137, rolledGameId: 6 },
	1074: { rolledAlbumId: 97, rolledGameId: 2 },
	1075: { rolledAlbumId: 231, rolledGameId: 11 },
	1076: { rolledAlbumId: 274, rolledGameId: 1 },
	1077: { rolledAlbumId: 335, rolledGameId: 7 },
	1078: { rolledAlbumId: 311, rolledGameId: 3 },
	1079: { rolledAlbumId: 150, rolledGameId: 4 },
	1080: { rolledAlbumId: 340, rolledGameId: 2 },
	1081: { rolledAlbumId: 343, rolledGameId: 6 }, // Introduction of IKIZULIVE!
	1082: { rolledAlbumId: 313, rolledGameId: 0 },
	1083: { rolledAlbumId: 126, rolledGameId: 9 },
	1084: { rolledAlbumId: 279, rolledGameId: 3 },
	1085: { rolledAlbumId: 80, rolledGameId: 5 },
	1086: { rolledAlbumId: 260, rolledGameId: 1 },
	1087: { rolledAlbumId: 288, rolledGameId: 2 },
	1088: { rolledAlbumId: 318, rolledGameId: 0 },
	1089: { rolledAlbumId: 27, rolledGameId: 11 },
	1090: { rolledAlbumId: 306, rolledGameId: 6 },
	1091: { rolledAlbumId: 351, rolledGameId: 4 },
	1092: { rolledAlbumId: 92, rolledGameId: 3 },
	1093: { rolledAlbumId: 144, rolledGameId: 2 },
	1094: { rolledAlbumId: 341, rolledGameId: 1 },
	1095: { rolledAlbumId: 319, rolledGameId: 0 },
	1096: { rolledAlbumId: 143, rolledGameId: 6 },
	1097: { rolledAlbumId: 269, rolledGameId: 5 },
	1098: { rolledAlbumId: 47, rolledGameId: 3 },
	1099: { rolledAlbumId: 309, rolledGameId: 11 },
	1100: { rolledAlbumId: 239, rolledGameId: 1 },
	1101: { rolledAlbumId: 91, rolledGameId: 2 },
	1102: { rolledAlbumId: 350, rolledGameId: 0 },
	1103: { rolledAlbumId: 251, rolledGameId: 6 },
	1104: { rolledAlbumId: 331, rolledGameId: 4 },
	1105: { rolledAlbumId: 167, rolledGameId: 3 },
	1106: { rolledAlbumId: 301, rolledGameId: 11 },
	1107: { rolledAlbumId: 283, rolledGameId: 2 },
	1108: { rolledAlbumId: 88, rolledGameId: 0 },
	1109: { rolledAlbumId: 230, rolledGameId: 6 },
	1110: { rolledAlbumId: 160, rolledGameId: 7 },
	1111: { rolledAlbumId: 157, rolledGameId: 3 },
	1112: { rolledAlbumId: 266, rolledGameId: 4 },
	1113: { rolledAlbumId: 130, rolledGameId: 2 },
	1114: { rolledAlbumId: 102, rolledGameId: 11 },
	1115: { rolledAlbumId: 346, rolledGameId: 0 },
	1116: { rolledAlbumId: 224, rolledGameId: 6 },
	1117: { rolledAlbumId: 105, rolledGameId: 3 },
	1118: { rolledAlbumId: 317, rolledGameId: 1 },
	1119: { rolledAlbumId: 307, rolledGameId: 4 },
	1120: { rolledAlbumId: 175, rolledGameId: 11 },
	1121: { rolledAlbumId: 107, rolledGameId: 2 },
	1122: { rolledAlbumId: 98, rolledGameId: 7 },
	1123: { rolledAlbumId: 28, rolledGameId: 0 },
	1124: { rolledAlbumId: 10, rolledGameId: 3 },
	1125: { rolledAlbumId: 330, rolledGameId: 5 },
	1126: { rolledAlbumId: 99, rolledGameId: 6 },
	1127: { rolledAlbumId: 46, rolledGameId: 2 },
	1128: { rolledAlbumId: 149, rolledGameId: 7 },
	1129: { rolledAlbumId: 261, rolledGameId: 0 },
	1130: { rolledAlbumId: 321, rolledGameId: 11 },
	1131: { rolledAlbumId: 141, rolledGameId: 4 },
	1132: { rolledAlbumId: 320, rolledGameId: 6 },
	1133: { rolledAlbumId: 324, rolledGameId: 3 },
	1134: { rolledAlbumId: 146, rolledGameId: 1 },
	1135: { rolledAlbumId: 194, rolledGameId: 2 },
	1136: { rolledAlbumId: 94, rolledGameId: 0 },
	1137: { rolledAlbumId: 115, rolledGameId: 11 },
	1138: { rolledAlbumId: 20, rolledGameId: 6 },
	1139: { rolledAlbumId: 11, rolledGameId: 3 },
	1140: { rolledAlbumId: 191, rolledGameId: 4 },
	1141: { rolledAlbumId: 246, rolledGameId: 7 },
	1142: { rolledAlbumId: 154, rolledGameId: 0 },
	1143: { rolledAlbumId: 305, rolledGameId: 11 },
	1144: { rolledAlbumId: 134, rolledGameId: 6 },
	1145: { rolledAlbumId: 184, rolledGameId: 3 },
	1146: { rolledAlbumId: 104, rolledGameId: 5 },
	1147: { rolledAlbumId: 362, rolledGameId: 7 },
	1148: { rolledAlbumId: 118, rolledGameId: 0 },
	1149: { rolledAlbumId: 345, rolledGameId: 11 },
	1150: { rolledAlbumId: 43, rolledGameId: 2 },
	1154: { rolledAlbumId: 226, rolledGameId: 8 }, // New Year 2026: Special Fireworks Mode
};

export function getIdsForDay(day: number, ignoreDev: boolean = false): { rolledAlbumId: number; rolledGameId: number } {
	if (DAILY_ROLL_CACHE.hasOwnProperty(day)) {
		return DAILY_ROLL_CACHE[day];
	}
	if (FORCED_DAYS.hasOwnProperty(day)) {
		const ret = FORCED_DAYS[day];
		recordRollIfProd(day, ret.rolledAlbumId, ret.rolledGameId);
		return ret;
	}

	let rng: () => number;
	let rerolls = rerollDays[day] || 0;
	const modModeRerollOffsetObject =
		typeof localStorage !== "undefined"
			? JSON.parse(localStorage.getItem("llalbum-modmode-reroll-offset") ?? "null")
			: null;
	if (day === DAY_TO_PLAY && modModeRerollOffsetObject !== null && modModeRerollOffsetObject.day === day) {
		rerolls += modModeRerollOffsetObject.rerollOffset;
	}

	const blockedAlbumIds = new Set<number>();
	const blockedGameIds = new Set<number>();
	if (import.meta.env.DEV && import.meta.env.VITE_LOCK_DAY === undefined && !ignoreDev) {
		rng = seededRNG(Math.floor(Math.random() * 100000000));
		day = 999998;
	} else {
		rng = seededRNG(day);
		// Reroll mechanics were changed on day 223 (other part below)
		if (day <= 222) {
			while (rerolls > 0) {
				rng(); // throw away a roll
				rerolls--;
			}
		}

		// Avoid repeats: last 150 for albums, last 5 for game modes.
		// Caution: Changing these numbers will break things immediately and forever
		//
		// To avoid rerolling within a groupId for games, games with groupIds are added to the set with the negative
		// groupId (so: number >= 0 blocks that gameId, number < 0 blocks that groupId)
		//
		// And yes, that means every visit, the entire history will get recreated.
		// Is it inefficient? Yes! Is it inefficient to the point that it makes a noticeable difference for players? No!
		// So I think it's a fine tradeoff - by doing this instead of relying on a user's save file, we sacrifice some
		// performance for the guarantee that everyone will always have exactly the same song forever
		for (let i = Math.max(day - 150, 1); i < day; i++) {
			const prevDayIds = getIdsForDay(i);
			blockedAlbumIds.add(prevDayIds.rolledAlbumId);
			if (i >= day - 5) {
				const groupId = GAME_POOL[prevDayIds.rolledGameId].groupId;
				if (groupId !== undefined) {
					blockedGameIds.add(-groupId);
				} else {
					blockedGameIds.add(prevDayIds.rolledGameId);
				}
			}
		}
	}

	let rolledAlbumId = pickFrom(getFilteredPoolForDay(ALBUM_POOL, day), rng, blockedAlbumIds);

	rng(); // throw away some rolls
	rng();
	const filteredGamePool = getFilteredPoolForDay(GAME_POOL, day);
	let rolledGameId: number;
	let rolledGameGroupId: number | undefined;
	do {
		rolledGameId = pickFrom(filteredGamePool, rng, blockedGameIds);
		rolledGameGroupId = GAME_POOL[rolledGameId].groupId;
	} while (rolledGameGroupId !== undefined && blockedGameIds.has(-rolledGameGroupId));

	// Reroll mechanics were changed on day 223 (other part above)
	if (day > 222) {
		while (rerolls > 0) {
			const prevRolledAlbumId = rolledAlbumId;
			rolledAlbumId = pickFrom(getFilteredPoolForDay(ALBUM_POOL, day), rng, blockedAlbumIds);
			if (rolledAlbumId !== prevRolledAlbumId) {
				rerolls -= 1;
			}
		}
	}

	recordRollIfProd(day, rolledAlbumId, rolledGameId);
	const ret = { rolledAlbumId, rolledGameId };
	DAILY_ROLL_CACHE[day] = ret;
	return ret;
}

function recordRollIfProd(day: number, album: number, game: number) {
	if (import.meta.env.PROD && import.meta.env.SSR) recordRoll(day, album, game);
}
