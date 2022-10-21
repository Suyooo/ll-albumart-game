import autocompleter from "autocompleter";
import type {AutocompleteItem} from "autocompleter";
import type {Action} from "svelte/action";
import fuzzysort from "fuzzysort";
import type {Album} from "$data/albumpool";
import {ALBUMPOOL} from "$data/albumpool";

interface ACTarget extends AutocompleteItem {
    en: Fuzzysort.Prepared,
    ja: Fuzzysort.Prepared,
    enTitleOnly: Fuzzysort.Prepared,
    jaTitleOnly: Fuzzysort.Prepared,
    album: Album
}

interface ACResult extends AutocompleteItem {
    label: string,
    value: Album,
    isEn: boolean,
    result: Fuzzysort.Result,
    prefixArtist?: string
}

export const VALID_GUESSES = new Set();
const acTargets: ACTarget[] = ALBUMPOOL.map(album => {
    const en = album.artistEn + " - " + album.titleEn;
    const ja = album.artistJa + " - " + album.titleJa;
    VALID_GUESSES.add(en);
    VALID_GUESSES.add(ja);

    return {
        en: fuzzysort.prepare(en),
        ja: fuzzysort.prepare(ja),
        enTitleOnly: fuzzysort.prepare(album.titleEn),
        jaTitleOnly: fuzzysort.prepare(album.titleJa),
        album: album
    }
});

const acOptions: Fuzzysort.KeysOptions<ACTarget> = {
    threshold: -10000,
    limit: 5,
    all: false,
    keys: ["en", "ja", "enTitleOnly", "jaTitleOnly"]
};

export const autocomplete: Action<HTMLInputElement> = (node: HTMLInputElement) => {
    const acInstance = autocompleter<ACResult>({
        input: node,
        fetch: function (text: string, update: (res: ACResult[]) => void): void {
            if (VALID_GUESSES.has(text)) update([]);
            else update(fuzzysort.go(text, acTargets, acOptions)
                .map(keysResult => {
                    const result = keysResult[0] || keysResult[1] || keysResult[2] || keysResult[3];
                    const value = keysResult.obj.album;
                    const isEn = result === keysResult[0] || result === keysResult[2];
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
            node.dispatchEvent(new CustomEvent<string>("select", {detail: item.label}));
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