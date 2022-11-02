import type {AlbumInfo} from "$data/albumpool";
import {ALBUM_POOL} from "$data/albumpool";
import type {GameInfo} from "$data/gamepool";
import {GAME_POOL} from "$data/gamepool";
import {rerollDays} from "$data/rerolls";
import {seededRNG} from "$modules/rng";

const FIRST_DAY_TIMESTAMP = 1667228400000;
const MS_PER_DAY = 86400000;
export const CURRENT_DAY = Math.floor((Date.now() - FIRST_DAY_TIMESTAMP) / MS_PER_DAY)
    + (typeof localStorage !== "undefined" ? (parseInt(localStorage.getItem("llalbum-day-offset")) || 0) : 0);

interface Pickable {
    id: number;
    cumulativeWeight: number;
}

function getFilteredPoolForDay<T extends (AlbumInfo | GameInfo)>(list: T[], day: number): (T & Pickable)[] {
    const pool: (T & Pickable)[] = list.map((item, id) => ({id, cumulativeWeight: 0, ...item}))
        .filter(item => item.startOnDay <= day);

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

export function getIdsForDay(day: number): { rolledAlbumId: number, rolledGameId: number } {
    if (DAILY_ROLL_CACHE.hasOwnProperty(day)) {
        return DAILY_ROLL_CACHE[day];
    }

    // Hardcoding first few rounds as an "intro" - so the first week is one of each game, to give people a taste :)
    if (day <= 7) {
        // D1: Eutopia (Pixelated)
        //     This was a random roll I swear but since LLHeardle started with a Lanzhu solo too, this fits great lol
        if (day === 1) return {rolledAlbumId: 119, rolledGameId: 0};
        // D2: Bokura wa Ima no Naka de (Blinds H)
        if (day === 2) return {rolledAlbumId: 144, rolledGameId: 4};
        // D3: Starlight Prologue (Shuffled)
        if (day === 3) return {rolledAlbumId: 10, rolledGameId: 7};
        // D4: Torikoriko PLEASE!! (Tiles)
        if (day === 4) return {rolledAlbumId: 86, rolledGameId: 6};
        // D5: Susume Tomorrow / START:DASH!! (Blobs)
        if (day === 5) return {rolledAlbumId: 146, rolledGameId: 2};
        // D6: Eien no Isshun (Zoomed In)
        if (day === 6) return {rolledAlbumId: 123, rolledGameId: 3};
        // D7: Bouken Type A, B, C!! (Bubbles)
        if (day === 7) return {rolledAlbumId: 39, rolledGameId: 1};
    }

    let rng: () => number;
    const blockedAlbumIds = new Set<number>();
    const blockedGameIds = new Set<number>();
    if (INDEV) {
        rng = seededRNG(Math.floor(Math.random() * 100000000));
        day = 999998;
    } else {
        rng = seededRNG(day);
        if (rerollDays.has(day)) rng(); // throw away a roll

        // Avoid repeats: last 100 for albums, last 3 for game modes.
        // Caution: Changing these numbers will break things immediately and forever
        //
        // To avoid rerolling within a groupId for games, games with groupIds are added to the set with the negative
        // groupId (so: number >= 0 blocks that gameId, number < 0 blocks that groupId)
        //
        // And yes, that means every visit, the entire history will get recreated.
        // Is it inefficient? Yes! Is it inefficient to the point that it makes a noticeable difference for players? No!
        // So I think it's a fine tradeoff - by doing this instead of relying on a user's save file, we sacrifice some
        // performance for the guarantee that everyone will always have exactly the same song forever
        for (let i = Math.max(day - 100, 0); i < day; i++) {
            const prevDayIds = getIdsForDay(day);
            blockedAlbumIds.add(prevDayIds.rolledAlbumId);
            if (i >= day - 3) {
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