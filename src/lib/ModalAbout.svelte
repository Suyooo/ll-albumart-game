<script lang="ts">
    // required re-assignment to make vite constants work nice
    import PageButton from "$lib/styled/PageButton.svelte";
    import type { PlayState } from "$stores/state.js";
    import { STATISTICS } from "$stores/statistics";
    import { getContext } from "svelte";
    import type { Readable } from "svelte/store";

    const ALL_STATES = getContext<Readable<PlayState[]>>("ALL_STATES");

    const buildTime: number = getContext("DEFINE_BUILDTIME");

    const read = getContext<(s: string, priority?: "polite" | "assertive") => void>("reader");
    let exported: boolean = false;

    function exportSave() {
        navigator.clipboard
            .writeText(
                JSON.stringify({
                    states: $ALL_STATES,
                    statistics: $STATISTICS,
                })
            )
            .then(() => {
                read("Your save data has been copied to your clipboard.", "assertive");
                exported = true;
            })
            .catch((err) => {
                alert("Unable to share or copy your save data: " + err);
            });
    }

    function importSave() {
        const saveDataEntered = prompt(
            "Please paste your save data here to import it.\n\n" +
                "WARNING: Any save data you have will be overwritten! (Click Cancel if you don't want that)"
        );
        if (saveDataEntered !== null) {
            let saveDataParsed;
            try {
                saveDataParsed = JSON.parse(saveDataEntered);
                if (saveDataParsed["states"]) {
                    localStorage.setItem("llalbum-states", JSON.stringify(saveDataParsed["states"]));
                }
                if (saveDataParsed["statistics"]) {
                    localStorage.setItem("llalbum-statistics", JSON.stringify(saveDataParsed["statistics"]));
                }
                window.location.reload();
            } catch (e) {
                alert(
                    "There was a problem moving your save data. If the following error contains something like" +
                        '"JSON", make sure you copied and pasted all of the text from the insecure site. If you did, or' +
                        "there's a different error, please let us know via the links in the About section!\n\n" +
                        "The error was:\n" +
                        e
                );
            }
        }
    }

    let checkPromise: Promise<string> | null = null;

    function check() {
        checkPromise = fetch(window.location.href, { cache: "reload" }).then((response) => {
            const latest = Date.parse(response.headers.get("Last-Modified") ?? "1 January 2030");
            // 5-minute delay to account for delay between build/file writing/upload
            if (latest - 300000 > buildTime) {
                return "There is an update available. Try refreshing the page, or, if that doesn't work, clearing your browser cache! If you run into problems getting the update, please contact me.";
            } else {
                return "You are on the latest version!";
            }
        });
    }
</script>

<div class="flex-col space-y-4">
    <div>
        This site was made by Suyooo
        <ul class="list-disc list-inside ml-4 text-sm">
            <li><a href="https://mstdn.schoolidol.club/@Suyooo">Mastodon</a></li>
            <li><a href="https://www.tumblr.com/suyooo">Tumblr</a></li>
        </ul>
        <div class="text-xs">
            If you have any problems, comments, or ideas for new game modes, feel free to send them to me!
        </div>
    </div>
    <div>
        Some cool stuff used for this site:
        <ul class="list-disc list-inside ml-4 text-sm">
            <li><a href="https://svelte.dev/">Svelte</a></li>
            <li><a href="https://tailwindcss.com/">Tailwind CSS</a></li>
            <li><a href="https://github.com/Automattic/node-canvas">node-canvas</a></li>
            <li><a href="https://kraaden.github.io/autocomplete/">Autocompleter</a></li>
            <li><a href="https://github.com/farzher/fuzzysort">Fuzzysort</a></li>
            <li><a href="https://iconsvg.xyz/">IconSVG</a></li>
        </ul>
    </div>
    <div>
        <a href="https://github.com/Suyooo/ll-albumart-game">Source Code on GitHub</a>
    </div>
    <div>Inspired by Wordle and Heardle</div>
    <div>
        <div class="flex gap-x-2">
            <PageButton class="px-2" label="Export Save Data" on:click={exportSave}>Export Save Data</PageButton>
            <PageButton class="px-2" label="Import Save Data" on:click={importSave}>Import Save Data</PageButton>
        </div>
        {#if exported}
            <div class="mt-1 text-xs text-gray-400 tracking-tighter leading-4">
                Your save data has been copied to your clipboard.
            </div>
        {/if}
    </div>
    <div class="mt-6 text-xs text-gray-400 tracking-tighter leading-4">
        Love Live! and all album art, song titles and project/group names are copyrighted: ©PL! ©PL!S ©PL!N ©PL!SP
        ©SUNRISE ©bushiroad<br />
        This is a not-for-profit fan project, and unaffiliated with any of the projects or companies above.
    </div>
    <div class="mt-6 text-xs text-gray-400 tracking-tighter leading-4">
        <div>
            Current Version: {new Date(buildTime).toLocaleString("en-GB")}
            {import.meta.env.DEV ? " (Dev Mode)" : ""}
            {#if !checkPromise}
                <button class="underline" on:click={check}>(Check)</button>
            {/if}
        </div>
        {#if checkPromise}
            <div>
                ➞
                {#await checkPromise}
                    Checking...
                {:then res}
                    {res}
                    <button class="underline" on:click={check}>(Check again)</button>
                {:catch _e}
                    There was a problem connecting to the server. Please check your connection!
                    <button class="underline" on:click={check}>(Check again)</button>
                {/await}
            </div>
        {/if}
    </div>
</div>
