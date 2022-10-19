import json from "./albumpool.json" assert { type: 'json' };

export interface Album {
    url: string,
    titleEn: string,
    artistEn: string,
    titleJa: string,
    artistJa: string
}

export const ALBUMPOOL: Album[] = <Album[]>json;