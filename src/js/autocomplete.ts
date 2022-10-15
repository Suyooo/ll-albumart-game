import autocomplete from "autocompleter";
import type {AutocompleteItem} from "autocompleter";
import type {AutocompleteResult} from "autocompleter/autocomplete";
import fuzzysort from "fuzzysort";
import {ALBUMPOOL} from "./albumpool";

interface ACTarget extends AutocompleteItem {
    en: Fuzzysort.Prepared,
    ja: Fuzzysort.Prepared
}

interface ACResult extends AutocompleteItem {
    label: string,
    result: Fuzzysort.Result
}

export const VALID_GUESSES = new Set();
const acTargets: ACTarget[] = ALBUMPOOL.map(album => {
    const en = album.artistEn + " - " + album.titleEn;
    const ja = album.artistJa + " - " + album.titleJa;
    VALID_GUESSES.add(en);
    VALID_GUESSES.add(ja);

    return {
        en: fuzzysort.prepare(en),
        ja: fuzzysort.prepare(ja)
    }
});

const acOptions: Fuzzysort.KeysOptions<ACTarget> = {
    threshold: -1000,
    limit: 5,
    all: false,
    keys: ["en", "ja"]
};

export function initAutocomplete(inputElement: HTMLInputElement, setInputValue: (s: string) => void): AutocompleteResult {
    return autocomplete<ACResult>({
        input: inputElement,
        fetch: function (text: string, update: (res: ACResult[]) => void): void {
            update(fuzzysort.go(text, acTargets, acOptions)
                .map(keysResult => <ACResult>({
                    result: keysResult[0] || keysResult[1],
                    label: keysResult[0]?.target || keysResult[1]?.target
                }))
            );
        },
        onSelect: function (item: ACResult): void {
            setInputValue(item.label);
        },
        render: function (item: ACResult): HTMLDivElement | undefined {
            const itemElement = document.createElement("div");
            itemElement.className = "w-full hover:bg-emerald-900 text-white border-gray-700 px-2 py-1 " +
                "border-b-2 last:border-b-0"
            itemElement.innerHTML =
                fuzzysort.highlight(item.result, "<mark>", "</mark>") || item.label;
            return itemElement;
        },
        showOnFocus: true,
        className: "bg-gray-800 border-white border-2 border-t-0 rounded-b mt-[-2px]",
        disableAutoSelect: true
    });
}