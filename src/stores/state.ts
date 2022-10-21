import type {Album} from "$data/albumpool";
import {ALBUMPOOL} from "$data/albumpool";
import type {Writable} from "svelte/store";
import {derived, writable} from "svelte/store";

interface PlayState {
    day: number,
    albumId: number,
    failed: 0 | 1 | 2 | 3 | 4 | 5 | 6,
    cleared: boolean,
    finished: boolean,
    guesses: (string | null)[]
}

export const STATE = writable<PlayState>({
    day: 1,
    albumId: 0,
    failed: 0,
    cleared: false,
    finished: false,
    guesses: []
});

export const ALBUM = derived<Writable<PlayState>, Album>(
    STATE,
    $STATE => ALBUMPOOL[$STATE.albumId]
);