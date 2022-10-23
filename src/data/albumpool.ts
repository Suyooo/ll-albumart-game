import json from "./albumpool.json" assert { type: 'json' };

export interface Album {
    url: string,
    startOnDay: number,
    titleEn: string,
    artistEn: string,
    realEn?: string,
    titleJa: string,
    artistJa: string,
    realJa?: string
}

export const ALBUM_POOL: Album[] = <Album[]>json;