import type {AlbumInfo} from "$data/albumpool";
import {ALBUM_POOL} from "$data/albumpool";
import type {GameInfo} from "$data/gamepool";
import {GAME_POOL} from "$data/gamepool";
import {rerollDays} from "$data/rerolls";
import {seededRNG} from "$modules/rng";

const ZERO_DAY_TIMESTAMP = 1667487600000; // game begins 24h after this
const MS_PER_DAY = 86400000;
export const CURRENT_DAY = INDEV
        ? 100000 + Math.floor(Math.random() * 100000)
        : (Math.floor((Date.now() - ZERO_DAY_TIMESTAMP) / MS_PER_DAY)
                + (typeof localStorage !== "undefined" ? (parseInt(localStorage.getItem("llalbum-day-offset")) || 0) : 0));

interface Pickable {
    id: number;
    cumulativeWeight: number;
}

function getFilteredPoolForDay<T extends (AlbumInfo | GameInfo)>(list: T[], day: number): (T & Pickable)[] {
    const pool: (T & Pickable)[] = list.map((item, id) => ({id, cumulativeWeight: 0, ...item}))
            .filter(item => item.startOnDay <= day && item.weight > 0);

    pool.reduce((acc, item): number => {
        item.cumulativeWeight = acc + item.weight;
        return item.cumulativeWeight;
    }, 0);

    return pool;
}

function pickFrom(list: Pickable[], rng: () => number, blocked: Set<number>): number {
    let rolled: number;
    do {
        const weight = rng() * list.at(-1).cumulativeWeight;
        const index = list.findIndex(game => game.cumulativeWeight > weight);
        rolled = list[index].id;
    } while (blocked.has(rolled));
    return rolled;
}

const DAILY_ROLL_CACHE: { [day: number]: { rolledAlbumId: number, rolledGameId: number } } = {};

const FORCED_DAYS: { [day: number]: { rolledAlbumId: number, rolledGameId: number } } = {
    // Hardcoding first few rounds as an "intro" - so the first week is one of each game, to give people a taste :)
    1: {rolledAlbumId: 119, rolledGameId: 0},   // D1: Eutopia (Pixelated)
    2: {rolledAlbumId: 144, rolledGameId: 4},   // D2: Bokura wa Ima no Naka de (Blinds H)
    3: {rolledAlbumId: 10, rolledGameId: 7},    // D3: Starlight Prologue (Shuffled)
    4: {rolledAlbumId: 86, rolledGameId: 6},    // D4: Torikoriko PLEASE!! (Tiles)
    5: {rolledAlbumId: 146, rolledGameId: 2},   // D5: Susume Tomorrow / START:DASH!! (Blobs)
    6: {rolledAlbumId: 123, rolledGameId: 3},   // D6: Eien no Isshun (Zoomed In)
    7: {rolledAlbumId: 39, rolledGameId: 1},    // D7: Bouken Type A, B, C!! (Bubbles)
    // First random week - I increased the game reroll limit on day 14, so results might be different otherwise
    8: {rolledAlbumId: 32, rolledGameId: 4},
    9: {rolledAlbumId: 26, rolledGameId: 0},
    10: {rolledAlbumId: 115, rolledGameId: 2},
    11: {rolledAlbumId: 8, rolledGameId: 1},
    12: {rolledAlbumId: 118, rolledGameId: 5},
    13: {rolledAlbumId: 229, rolledGameId: 6},
    14: {rolledAlbumId: 186, rolledGameId: 7},
    58: {rolledAlbumId: 9, rolledGameId: 8}   // New Year 2023: Special Fireworks Mode
};

export function getIdsForDay(day: number): { rolledAlbumId: number, rolledGameId: number } {
    if (DAILY_ROLL_CACHE.hasOwnProperty(day)) {
        return DAILY_ROLL_CACHE[day];
    }
    if (FORCED_DAYS.hasOwnProperty(day)) {
        return FORCED_DAYS[day];
    }

    let rng: () => number;
    const blockedAlbumIds = new Set<number>();
    const blockedGameIds = new Set<number>();
    if (INDEV) {
        rng = seededRNG(Math.floor(Math.random() * 100000000));
        day = 999998;
    } else {
        rng = seededRNG(day);
        let rerolls = rerollDays[day] || 0;
        while (rerolls > 0) {
            rng(); // throw away a roll
            rerolls--;
        }

        // Avoid repeats: last 100 for albums, last 5 for game modes.
        // Caution: Changing these numbers will break things immediately and forever
        //
        // To avoid rerolling within a groupId for games, games with groupIds are added to the set with the negative
        // groupId (so: number >= 0 blocks that gameId, number < 0 blocks that groupId)
        //
        // And yes, that means every visit, the entire history will get recreated.
        // Is it inefficient? Yes! Is it inefficient to the point that it makes a noticeable difference for players? No!
        // So I think it's a fine tradeoff - by doing this instead of relying on a user's save file, we sacrifice some
        // performance for the guarantee that everyone will always have exactly the same song forever
        for (let i = Math.max(day - 100, 1); i < day; i++) {
            const prevDayIds = getIdsForDay(i);
            blockedAlbumIds.add(prevDayIds.rolledAlbumId);
            if (i >= day - 5) {
                if (GAME_POOL[prevDayIds.rolledGameId].groupId !== undefined) {
                    blockedGameIds.add(-GAME_POOL[prevDayIds.rolledGameId].groupId);
                } else {
                    blockedGameIds.add(prevDayIds.rolledGameId);
                }
            }
        }
    }

    const rolledAlbumId = pickFrom(getFilteredPoolForDay(ALBUM_POOL, day), rng, blockedAlbumIds);
    rng(); // throw away some rolls
    rng();
    const filteredGamePool = getFilteredPoolForDay(GAME_POOL, day);
    let rolledGameId: number;
    do {
        rolledGameId = pickFrom(filteredGamePool, rng, blockedGameIds);
    } while (GAME_POOL[rolledGameId].groupId !== undefined && blockedGameIds.has(-GAME_POOL[rolledGameId].groupId));

    const ret = {rolledAlbumId, rolledGameId};
    DAILY_ROLL_CACHE[day] = ret;
    return ret;
}