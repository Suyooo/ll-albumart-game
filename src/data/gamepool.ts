import json from "./gamepool.json" assert {type: "json"};

export interface GameInfo {
    filename: string,
    startOnDay: number,
    name: string,
    description: string,
    weight: number,
    groupId?: number,
    messageOverride?: string
}

export const GAME_POOL: GameInfo[] = <GameInfo[]>json;