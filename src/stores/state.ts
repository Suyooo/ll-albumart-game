import { ALBUM_POOL } from "$data/albumpool";
import { GAME_POOL } from "$data/gamepool";
import { DAY_TO_PLAY, getIdsForDay } from "$modules/daily";
import { STATISTICS } from "$stores/statistics";
import { writable, readable } from "svelte/store";

export interface PlayState {
    day: number;
    albumId: number;
    gameId: number;
    failed: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    cleared: boolean;
    finished: boolean;
    guesses: (string | null)[];
}

export function initPlayState() {
    const loadedStates = import.meta.env.DEV ? undefined : localStorage.getItem("llalbum-states");
    const parsedStates: PlayState[] = loadedStates ? JSON.parse(loadedStates) : [];
    const IS_FIRST_PLAY = parsedStates.length === 0;

    if (IS_FIRST_PLAY || DAY_TO_PLAY > parsedStates.at(-1)!.day) {
        const prevState = parsedStates.at(-1);
        if (prevState) {
            if (!prevState.finished) {
                prevState.finished = true;
                STATISTICS.addFinishedState(prevState);
            }
            if (DAY_TO_PLAY - prevState.day > 1) {
                STATISTICS.breakStreak();
            }
        }

        // Add new day
        const { rolledAlbumId, rolledGameId } = getIdsForDay(DAY_TO_PLAY);
        parsedStates.push({
            day: DAY_TO_PLAY,
            albumId: rolledAlbumId,
            gameId: rolledGameId,
            failed: 0,
            cleared: false,
            finished: false,
            guesses: [],
        });
        STATISTICS.addNewDay();
    }

    // No need to make these into stores: albumId and gameId never change unless refreshing on a new day
    const ALBUM = ALBUM_POOL[parsedStates.at(-1)!.albumId];
    const GAME = GAME_POOL[parsedStates.at(-1)!.gameId];

    const STATE = writable<PlayState>(parsedStates.at(-1));

    STATE.subscribe((newState) => {
        parsedStates[parsedStates.length - 1] = newState;
        if (import.meta.env.PROD) localStorage.setItem("llalbum-states", JSON.stringify(parsedStates));
    });

    const ALL_STATES = readable<PlayState[]>([], (set) => {
        set(parsedStates);
        const unsub = STATE.subscribe(() => set(parsedStates));
        return () => {
            unsub();
        };
    });
    return { ALBUM, GAME, STATE, ALL_STATES };
}
