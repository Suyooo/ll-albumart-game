import json from "./gamepool.json" assert { type: 'json' };

export interface GameInfo {
    filename: string,
    startOnDay: number,
    name: string,
    weight: number
}

export const GAME_POOL: GameInfo[] = <GameInfo[]>json;