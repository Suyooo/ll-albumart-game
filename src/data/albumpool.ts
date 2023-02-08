import json from "./albumpool.json" assert {type: "json"};

export interface AlbumInfo {
    url: string,
    startOnDay: number,
    weight: number,
    titleEn: string,
    artistEn: string,
    altEn?: string,
    titleJa: string,
    artistJa: string,
    altJa?: string
}

export const ALBUM_POOL: AlbumInfo[] = <AlbumInfo[]>json;