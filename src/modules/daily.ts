import {ALBUMPOOL} from "$data/albumpool";
import {seededRNG} from "$modules/rng";

const FIRST_DAY_TIMESTAMP = 1666191600000;
const MS_PER_DAY = 86400000;
export const CURRENT_DAY = Math.floor((Date.now() - FIRST_DAY_TIMESTAMP) / MS_PER_DAY);

const FILTERED_POOL = ALBUMPOOL.filter(album => album.startOnDay <= CURRENT_DAY);
export const ROLLED_ALBUM_ID = Math.floor(seededRNG(CURRENT_DAY + 456456)() * FILTERED_POOL.length);
export const ROLLED_ALBUM = FILTERED_POOL[ROLLED_ALBUM_ID];