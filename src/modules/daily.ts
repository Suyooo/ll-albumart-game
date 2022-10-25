import type {AlbumInfo} from "$data/albumpool";
import {ALBUM_POOL} from "$data/albumpool";
import type {GameInfo} from "$data/gamepool";
import {GAME_POOL} from "$data/gamepool";
import {seededRNG} from "$modules/rng";
import type {PlayState} from "$stores/state";

const FIRST_DAY_TIMESTAMP = 1666191600000;
const MS_PER_DAY = 86400000;
export const CURRENT_DAY = Math.floor((Date.now() - FIRST_DAY_TIMESTAMP) / MS_PER_DAY)
    + ((typeof localStorage !== "undefined" ? parseInt(localStorage.getItem("dayOffset")) : 0) || 0);

export interface FilteredAlbumInfo extends AlbumInfo {
    id: number;
    cumulativeWeight: number;
}

export interface FilteredGameInfo extends GameInfo {
    id: number;
    cumulativeWeight: number;
}

function getFilteredAlbumPoolForDay(day: number): FilteredAlbumInfo[] {
    const pool: FilteredAlbumInfo[] = ALBUM_POOL
        .map((album, id) => ({id, cumulativeWeight: 0, ...album}))
        .filter(album => album.startOnDay <= day);

    pool.reduce((acc, album): number => {
        album.cumulativeWeight = acc + album.weight;
        return album.cumulativeWeight;
    }, 0);

    return pool;
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
// Setting localStorage.dayOffset = 1 means you will get the next day's round, which allows me to play a day ahead, and
// to check whether it's a good round. If not, it can be skipped by adding the day to this array: the seed will be
// offset by +1 each time I add another day in here
const offsetDays = [];

export function getIdsForDay(day: number, states: PlayState[]) {
    // Hardcoding first few rounds as an "intro" - so the first six days are one of each game, to give people a taste :)
    if (day < 7) {
        // D1: Eutopia (Pixelated)
        //     This was a random roll I swear but since LLHeardle started with a Lanzhu solo too, this fits great lol
        if (day === 1) return {rolledAlbumId: 119, rolledGameId: 0};
        // D2: Bokura wa Ima no Naka de (Blinds H)
        if (day === 2) return {rolledAlbumId: 144, rolledGameId: 4};
        // D3: Bouken Type A, B, C!! (Bubbles)
        if (day === 3) return {rolledAlbumId: 39, rolledGameId: 1};
        // D4: We'll get the next dream!! (Tiles)
        if (day === 4) return {rolledAlbumId: 91, rolledGameId: 6};
        // D5: Starlight Prologue (Blobs)
        if (day === 5) return {rolledAlbumId: 10, rolledGameId: 2};
        // D6: Eien no Isshun (Zoomed In)
        if (day === 6) return {rolledAlbumId: 123, rolledGameId: 3};
    }

    let offset: number;
    const blockedAlbums = new Set();
    const blockedGames = new Set();
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

    let rolledAlbumId: number;
    const filteredAlbumPool = getFilteredAlbumPoolForDay(day);
    do {
        const filteredAlbumTargetWeight = rng() * filteredAlbumPool.at(-1).cumulativeWeight;
        const filteredAlbumIndex =
            filteredAlbumPool.findIndex(album => album.cumulativeWeight > filteredAlbumTargetWeight);
        rolledAlbumId = filteredAlbumPool[filteredAlbumIndex].id;
    } while (blockedAlbums.has(rolledAlbumId));

    // throw away some rolls
    rng();
    rng();

    let rolledGameId: number;
    const filteredGamePool = getFilteredGamePoolForDay(day);
    do {
        const filteredGameTargetWeight = rng() * filteredGamePool.at(-1).cumulativeWeight;
        const filteredGameIndex = filteredGamePool.findIndex(game => game.cumulativeWeight > filteredGameTargetWeight);
        rolledGameId = filteredGamePool[filteredGameIndex].id;
    } while (blockedGames.has(rolledGameId));

    return {rolledAlbumId, rolledGameId};
}