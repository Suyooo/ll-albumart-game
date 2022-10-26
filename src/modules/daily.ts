import type {AlbumInfo} from "$data/albumpool";
import {ALBUM_POOL} from "$data/albumpool";
import type {GameInfo} from "$data/gamepool";
import {GAME_POOL} from "$data/gamepool";
import {seededRNG} from "$modules/rng";
import type {PlayState} from "$stores/state";

const FIRST_DAY_TIMESTAMP = 1667228400000;
const MS_PER_DAY = 86400000;
export const CURRENT_DAY = Math.floor((Date.now() - FIRST_DAY_TIMESTAMP) / MS_PER_DAY)
    + ((typeof localStorage !== "undefined" ? parseInt(localStorage.getItem("dayOffset")) : 0) || 0);

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

// The rounds are randomized, but curated
// Setting localStorage.dayOffset = 1 means you will get the next day's round, which allows me to play a day ahead, and
// to check whether it's a good round. If not, it can be skipped by adding the day to this array: the seed will be
// offset by +1 each time I add another day in here
const offsetDays = [];

export function getIdsForDay(day: number, states: PlayState[]) {
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

    let offset: number;
    const blockedAlbums = new Set<number>();
    const blockedGames = new Set<number>();
    if (INDEV) {
        offset = Math.floor(Math.random() * 100000000);
    } else {
        offset = offsetDays.length;
        for (let i = offsetDays.length - 1; i >= 0; i--) {
            if (day >= offsetDays[i]) break;
            offset--;
        }

        // Avoid repeats: last 100 for albums, last 3 for game modes
        for (let i = Math.max(states.length - 100, 0); i < states.length; i++) {
            blockedAlbums.add(states[i].albumId);
            if (i >= states.length - 3) blockedGames.add(states[i].gameId);
        }
    }

    const rng = seededRNG(day + offset);
    const rolledAlbumId = pickFrom(getFilteredPoolForDay(ALBUM_POOL, day), rng, blockedAlbums);
    rng(); // throw away some rolls
    rng();
    const rolledGameId = pickFrom(getFilteredPoolForDay(GAME_POOL, day), rng, blockedGames);
    return {rolledAlbumId, rolledGameId};
}