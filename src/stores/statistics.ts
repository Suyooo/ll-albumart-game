import type { Readable } from "svelte/store";
import { writable } from "svelte/store";
import type { PlayState } from "./state";

export interface Statistics {
    viewed: number;
    cleared: number;
    byFailCount: [number, number, number, number, number, number, number];
    currentStreak: number;
    highestStreak: number;
}

const loadedStats = import.meta.env.DEV ? undefined : localStorage.getItem("llalbum-statistics");
const parsedStats: Statistics = loadedStats
    ? JSON.parse(loadedStats)
    : {
          viewed: 0,
          cleared: 0,
          byFailCount: [0, 0, 0, 0, 0, 0, 0],
          currentStreak: 0,
          highestStreak: 0,
      };
const { subscribe, update } = writable(parsedStats);

// noinspection JSUnusedGlobalSymbols
export const STATISTICS: Readable<Statistics> & {
    addNewDay: () => void;
    addFinishedState: (state: PlayState) => void;
    breakStreak: () => void;
} = {
    subscribe,
    addNewDay: () =>
        update((statistics) => {
            statistics.viewed++;
            return statistics;
        }),
    addFinishedState: (state) =>
        update((statistics) => {
            if (state.cleared) {
                statistics.cleared++;
                statistics.byFailCount[state.failed]++;
                statistics.currentStreak++;
                if (statistics.currentStreak > statistics.highestStreak) {
                    statistics.highestStreak = statistics.currentStreak;
                }
            } else {
                statistics.byFailCount[6]++;
                statistics.currentStreak = 0;
            }
            return statistics;
        }),
    breakStreak: () =>
        update((statistics) => {
            statistics.currentStreak = 0;
            return statistics;
        }),
};

STATISTICS.subscribe((newStatistics) => {
    if (import.meta.env.PROD) localStorage.setItem("llalbum-statistics", JSON.stringify(newStatistics));
});
