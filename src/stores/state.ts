import {CURRENT_DAY, ROLLED_ALBUM, ROLLED_ALBUM_ID} from "$modules/daily";
import {STATISTICS} from "$stores/statistics";
import {writable, readable} from "svelte/store";

export interface PlayState {
    day: number,
    albumId: number,
    failed: 0 | 1 | 2 | 3 | 4 | 5 | 6,
    cleared: boolean,
    finished: boolean,
    guesses: (string | null)[]
}

const loadedStates = localStorage.getItem("playStates");
const parsedStates: PlayState[] = loadedStates ? JSON.parse(loadedStates) : [];
export const IS_FIRST_PLAY = parsedStates.length === 0;

if (IS_FIRST_PLAY || CURRENT_DAY > parsedStates.at(-1)?.day) {
    const prevState = parsedStates.at(-1);
    if (prevState) {
        if (!prevState.finished) {
            prevState.finished = true;
            STATISTICS.addFinishedState(prevState);
        }
        if (CURRENT_DAY - prevState.day > 1) {
            STATISTICS.breakStreak();
        }
    }

    // Add new day
    parsedStates.push({
        day: CURRENT_DAY,
        albumId: ROLLED_ALBUM_ID,
        failed: 0,
        cleared: false,
        finished: false,
        guesses: []
    });
    STATISTICS.addNewDay();
}

export const STATE = writable<PlayState>(parsedStates.at(-1));
export const ALBUM = ROLLED_ALBUM;

STATE.subscribe(newState => {
    parsedStates.pop();
    parsedStates.push(newState);
    localStorage.setItem("playStates", JSON.stringify(parsedStates));
});

export const ALL_STATES = readable<PlayState[]>([], (set) => {
    set(parsedStates);
    const unsub = STATE.subscribe(() => set(parsedStates));
    return () => { unsub() };
});