import type {AlbumInfo} from "$data/albumpool";
import {ALBUM_POOL} from "$data/albumpool";
import type {GameInfo} from "$data/gamepool";
import {GAME_POOL} from "$data/gamepool";
import {seededRNG} from "$modules/rng";

const FIRST_DAY_TIMESTAMP = 1666191600000;
const MS_PER_DAY = 86400000;
export const CURRENT_DAY = Math.floor((Date.now() - FIRST_DAY_TIMESTAMP) / MS_PER_DAY)
    + (parseInt(localStorage.getItem("dayOffset")) || 0);

export interface FilteredAlbumInfo extends AlbumInfo {
    id: number;
}

export interface FilteredGameInfo extends GameInfo {
    id: number;
    cumulativeWeight: number;
}

function getFilteredAlbumPoolForDay(day: number): FilteredAlbumInfo[] {
    return ALBUM_POOL
        .map((album, id) => ({id, ...album}))
        .filter(album => album.startOnDay <= day);
}

function getFilteredGamePoolForDay(day: number) {
    const pool: FilteredGameInfo[] = GAME_POOL
        .map((game, id) => ({id, cumulativeWeight: 0, ...game}))
        .filter(game => game.startOnDay <= day);

    pool.reduce((acc, game): number => {
        game.cumulativeWeight = acc + game.weight;
        return game.cumulativeWeight;
    }, 0);

    return pool;
}

// The rounds are randomized, but curated
// Setting localStorage.dayOffset = 1 means you will get the next day's round, to check whether it's good
// If not, it can be skipped by adding the day to this array: the seed will be offset by +1 each time
const offsetDays = [];

// Maybe hardcode the first few days as an "intro"?
// Pixelized: Eutopia (1)
// Tiles: GHAS (1)
// Bubbles: Bouken ABC (2)
// Crop: Mirai Harmony (2)
// Posterize: starlight prologue (1)
// Blinds: BokuIma H (1)

export function getIdsForDay(day: number) {
    let offset;
    if (INDEV) {
        offset = Math.floor(Math.random() * 100000000);
    } else {
        offset = offsetDays.length;
        for (let i = offsetDays.length - 1; i >= 0; i--) {
            if (day >= offsetDays[i]) break;
            offset--;
        }
    }
    const rng = seededRNG(day + offset);

    const filteredAlbumId = getFilteredAlbumPoolForDay(day);
    const filteredAlbumIndex = Math.floor(rng() * filteredAlbumId.length);
    const rolledAlbumId = filteredAlbumId[filteredAlbumIndex].id;

    // throw away some rolls
    rng();
    rng();

    const filteredGamePool = getFilteredGamePoolForDay(day);
    const filteredGameTargetWeight = rng() * filteredGamePool.at(-1).cumulativeWeight;
    const filteredGameIndex = filteredGamePool.findIndex(game => game.cumulativeWeight > filteredGameTargetWeight);
    const rolledGameId = filteredGamePool[filteredGameIndex].id;

    return {rolledAlbumId, rolledGameId};
}