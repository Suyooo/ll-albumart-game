import type {AlbumInfo} from "$data/albumpool";
import {ALBUM_POOL} from "$data/albumpool";
import type {AutocompleteItem} from "$modules/autocompleter/autocompleter";
import autocompleter from "$modules/autocompleter/autocompleter";
import fuzzysort from "fuzzysort";
import type {Action} from "svelte/action";

interface ACTarget extends AutocompleteItem {
    en: Fuzzysort.Prepared,
    ja: Fuzzysort.Prepared,
    enTitleOnly: Fuzzysort.Prepared,
    jaTitleOnly: Fuzzysort.Prepared,
    album: AlbumInfo
}

interface ACResult extends AutocompleteItem {
    value: AlbumInfo,
    isEn: boolean,
    resultTitle?: Fuzzysort.Result,
    resultTitleHasArtist: boolean,
    resultReal?: Fuzzysort.Result
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
        enRealOnly: album.realEn && fuzzysort.prepare(punctuationFullWidthToHalfWidth(album.realEn)),
        jaRealOnly: album.realJa && fuzzysort.prepare(punctuationFullWidthToHalfWidth(album.realJa)),
        album: album
    }
});

// If the player's browser is set to Japanese, prefer Japanese album titles, otherwise prefer English
// (No matter what, the other language will still show up for autocomplete suggestions if you enter it)
const preferJa = navigator.language.startsWith("ja");

const acOptions: Fuzzysort.KeysOptions<ACTarget> = {
    threshold: -15000,
    limit: 5,
    all: false,
    keys: preferJa
            ? ["ja", "en", "jaTitleOnly", "enTitleOnly", "jaRealOnly", "enRealOnly"]
            : ["en", "ja", "enTitleOnly", "jaTitleOnly", "enRealOnly", "jaRealOnly"],
    // 1.5x badness for realEn/realJa-only matches (so title matches take priority in sorting)
    scoreFn: (res) =>
            res.reduce((max, v, i) =>
                    v ? Math.max(max, v.score * (i >= 4 ? 1.5 : 1)) : max, -20000)
};

const autocomplete: Action<HTMLInputElement> = (node: HTMLInputElement) => {
    const acInstance = autocompleter<ACResult>({
        input: node,
        fetch: function (text: string, update: (res: ACResult[]) => void): void {
            if (VALID_GUESSES.has(text) || !text) {
                acInstance.close();
            } else {
                update(fuzzysort.go(punctuationFullWidthToHalfWidth(text), acTargets, acOptions)
                        .map(keysResult => {
                            const resultTitle = keysResult[0] ?? keysResult[1] ?? keysResult[2] ?? keysResult[3];
                            const resultReal = keysResult[4] ?? keysResult[5];
                            const isEn = preferJa
                                    ? (resultTitle && (resultTitle === keysResult[1] || resultTitle === keysResult[3]))
                                    || (resultReal && resultReal === keysResult[5])
                                    : (resultTitle && (resultTitle === keysResult[0] || resultTitle === keysResult[2]))
                                    || (resultReal && resultReal === keysResult[4]);
                            const value = keysResult.obj.album;
                            const resultTitleHasArtist = resultTitle === keysResult[0] || resultTitle === keysResult[1];
                            return <ACResult>{
                                resultTitle, resultTitleHasArtist, resultReal, value, isEn
                            };
                        })
                );
            }
        },
        onSelect: function (item: ACResult): void {
            node.dispatchEvent(new CustomEvent<string>("autocomplete", {
                detail: item.isEn
                        ? item.value.artistEn + " - " + item.value.titleEn
                        : item.value.artistJa + " - " + item.value.titleJa
            }));
        },
        render: function (item: ACResult): HTMLDivElement | undefined {
            const lang = (item.isEn ? "En" : "Ja");
            const itemElement = document.createElement("div");
            itemElement.innerHTML = item.resultTitle
                    ? (item.resultTitleHasArtist ? "" : item.value["artist" + lang] + " - ") +
                    fuzzysort.highlight(item.resultTitle, "<mark>", "</mark>")
                    : item.value["artist" + lang] + " - " + item.value["title" + lang];
            if (item.value["real" + lang]) {
                itemElement.innerHTML +=
                        "<div>("
                        + (item.resultReal
                                ? fuzzysort.highlight(item.resultReal, "<mark>", "</mark>")
                                : item.value["real" + lang])
                                .replace(" [", " <span>[").replace(" <mark>[", " <span><mark>[")
                        + (item.value["real" + lang].indexOf("[") !== -1 ? "</span>" : "")
                        + ")</div>";
            }
            return itemElement;
        },
        showOnFocus: true,
        minLength: 1,
        emptyMsg: "No matching albums found"
    });

    node["autocompleterOpen"] = acInstance.open;
    node["autocompleterClose"] = acInstance.close;
    return {
        destroy: () => acInstance.destroy()
    };
}

export default autocomplete;