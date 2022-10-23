import {ALBUM_POOL} from "$data/albumpool";
import {seededRNG} from "$modules/rng";

const FIRST_DAY_TIMESTAMP = 1666191600000;
const MS_PER_DAY = 86400000;
export const CURRENT_DAY = Math.floor((Date.now() - FIRST_DAY_TIMESTAMP) / MS_PER_DAY) + 200000;

const FILTERED_POOL = ALBUM_POOL.filter(album => album.startOnDay <= CURRENT_DAY && album.url !== "");
export const ROLLED_ALBUM_ID = Math.floor(seededRNG(CURRENT_DAY)() * FILTERED_POOL.length);
export const ROLLED_ALBUM = FILTERED_POOL[ROLLED_ALBUM_ID];