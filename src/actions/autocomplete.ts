import autocompleter from "autocompleter";
import type {AutocompleteItem} from "autocompleter";
import type {Action} from "svelte/action";
import fuzzysort from "fuzzysort";
import type {AlbumInfo} from "$data/albumpool";
import {ALBUM_POOL} from "$data/albumpool";

interface ACTarget extends AutocompleteItem {
    en: Fuzzysort.Prepared,
    ja: Fuzzysort.Prepared,
    enTitleOnly: Fuzzysort.Prepared,
    jaTitleOnly: Fuzzysort.Prepared,
    album: AlbumInfo
}

interface ACResult extends AutocompleteItem {
    label: string,
    value: AlbumInfo,
    isEn: boolean,
    result: Fuzzysort.Result,
    prefixArtist?: string
}

function punctuationFullWidthToHalfWidth(s: string): string {
    return s.replace(/[\uFF00-\uFF5E]/g, function (char) {
        return String.fromCharCode(32 /* space */ + (char.charCodeAt(0) - 65280 /* start of fullwidth block */));
    }).replace(/　/g /* fullwidth space is U+3000, not U+FF00 */, " ");
}

export const VALID_GUESSES = new Set();
const acTargets: ACTarget[] = ALBUM_POOL.map(album => {
    const en = album.artistEn + " - " + album.titleEn;
    const ja = album.artistJa + " - " + album.titleJa;
    VALID_GUESSES.add(en);
    VALID_GUESSES.add(ja);

    // EN titles should only contain half-width punctuation - but, you know, just in case...
    return {
        en: fuzzysort.prepare(punctuationFullWidthToHalfWidth(en)),
        ja: fuzzysort.prepare(punctuationFullWidthToHalfWidth(ja)),
        enTitleOnly: fuzzysort.prepare(punctuationFullWidthToHalfWidth(album.titleEn)),
        jaTitleOnly: fuzzysort.prepare(punctuationFullWidthToHalfWidth(album.titleJa)),
        album: album
    }
});

// If the player's browser is set to Japanese, prefer Japanese album titles, otherwise prefer English
// (No matter what, the other language will still show up for autocomplete suggestions if you enter it)
const preferJa = navigator.language.startsWith("ja");

const acOptions: Fuzzysort.KeysOptions<ACTarget> = {
    threshold: -10000,
    limit: 5,
    all: false,
    keys: preferJa ? ["ja", "en", "jaTitleOnly", "enTitleOnly"] : ["en", "ja", "enTitleOnly", "jaTitleOnly"]
};

export const autocomplete: Action<HTMLInputElement> = (node: HTMLInputElement) => {
    const acInstance = autocompleter<ACResult>({
        input: node,
        fetch: function (text: string, update: (res: ACResult[]) => void): void {
            console.log(punctuationFullWidthToHalfWidth(text));
            if (VALID_GUESSES.has(text)) update([]);
            else update(fuzzysort.go(punctuationFullWidthToHalfWidth(text), acTargets, acOptions)
                .map(keysResult => {
                    const result = keysResult[0] ?? keysResult[1] ?? keysResult[2] ?? keysResult[3];
                    const isEn = preferJa
                        ? result === keysResult[1] || result === keysResult[3]
                        : result === keysResult[0] || result === keysResult[2];
                    const value = keysResult.obj.album;
                    const prefixArtist = (result !== keysResult[0] && result !== keysResult[1])
                        ? (isEn ? value.artistEn : value.artistJa)
                        : undefined;
                    return <ACResult>{
                        result, value, prefixArtist, isEn,
                        label: (prefixArtist ? prefixArtist + " - " : "") + result.target,
                    };
                })
            );
        },
        onSelect: function (item: ACResult): void {
            node.dispatchEvent(new CustomEvent<string>("autocomplete", {
                detail: item.isEn
                    ? item.value.artistEn + " - " + item.value.titleEn
                    : item.value.artistJa + " - " + item.value.titleJa
            }));
        },
        render: function (item: ACResult): HTMLDivElement | undefined {
            const itemElement = document.createElement("div");
            itemElement.innerHTML = (item.prefixArtist ? item.prefixArtist + " - " : "") +
                fuzzysort.highlight(item.result, "<mark>", "</mark>") || item.label;
            if ((item.isEn && item.value.realEn) || (!item.isEn && item.value.realJa)) {
                itemElement.innerHTML +=
                    "<div>("
                    + (item.isEn ? item.value.realEn : item.value.realJa)
                        .replace(" [", " <span>[")
                    + "</span>)</div>";
            }
            return itemElement;
        },
        showOnFocus: true,
        minLength: 1
    });

    return {
        destroy: () => acInstance.destroy()
    };
}