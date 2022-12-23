<script lang="ts">
    // required re-assignment to make vite constants work nice
    const CONST_INDEV: boolean = INDEV;
    const CONST_BUILDTIME: number = BUILDTIME;
    const CONST_BUILDDATE: string = BUILDDATE;

    let checkPromise: Promise<string> | null = null;

    function check() {
        checkPromise = fetch(window.location.href, {cache: "reload"}).then(response => {
            const latest = Date.parse(response.headers.get("Last-Modified"));
            // 5-minute delay to account for delay between build/file writing/upload
            if (latest - 300000 > CONST_BUILDTIME) {
                return "There is an update available. Try refreshing the page, or, if that doesn't work, clearing your browser cache! If you run into problems getting the update, please contact me.";
            } else {
                return "You are on the latest version!";
            }
        });
    }
</script>

<div class="flex-col space-y-4">
    <div>
        This site was made by <a href="https://twitter.com/Suyo_">@Suyo_</a>
        <div class="text-xs">
            If you have any problems, comments, or ideas for new game modes, feel free to send them to me!
        </div>
    </div>
    <div>Some cool stuff used for this site:
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
    <div class="mt-6 text-xs text-gray-400 tracking-tighter leading-4">
        Love Live! and all album art, song titles and project/group names are copyrighted: ©PL! ©PL!S ©PL!N ©PL!SP
        ©SUNRISE
        ©bushiroad<br>
        This is a not-for-profit fan project, and unaffiliated with any of the projects or companies above.
    </div>
    <div class="mt-6 text-xs text-gray-400 tracking-tighter leading-4">
        <div>
            Current Version: {CONST_BUILDDATE} {CONST_INDEV ? " (Dev Mode)" : ""}
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

