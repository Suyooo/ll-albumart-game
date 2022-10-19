import json from "./albumpool.json" assert { type: 'json' };

export interface Album {
    url: string,
    titleEn: string,
    artistEn: string,
    realEn?: string,
    titleJa: string,
    artistJa: string,
    realJa?: string
}

export const ALBUMPOOL: Album[] = <Album[]>json;