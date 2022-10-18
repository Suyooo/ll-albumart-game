<script lang="ts">
    export let cleared: boolean;
    export let failed: number;
    export let getShareText: () => string;

    import {fly} from "svelte/transition";

    let copied: boolean = false;

    function share() {
        if (navigator.share && !(navigator.userAgent.includes("Firefox") && navigator.userAgent.includes("Android"))) {
            // Firefox for Android does not support sharing text via navigator.share
            // There is no way to programmatically check whether a browser supports sharing text via the native share
            // mechanism, so we simply have to remember to manually remove this when it is implemented in Firefox
            navigator.share({text: getShareText()})
                .catch((err) => {
                    alert("Unable to share your result: " + err);
                });
        } else {
            // PC browsers usually don't have a native share mechanism - just copy it instead
            navigator.clipboard.writeText(getShareText())
                .then(() => {
                    copied = true;
                })
                .catch((err) => {
                    alert("Unable to share or copy your result: " + err);
                });
        }
    }
</script>

<div class="w-full flex flex-col items-center justify-between mb-8 mt-4" in:fly={{y: 30, duration: 1000}}>
    <h2 class="tracking-widest uppercase font-bold text-2xl">
        {#if !cleared}
            Oops
        {:else if failed === 5}
            Close one
        {:else if failed === 4}
            You got it
        {:else if failed === 3}
            Good job
        {:else if failed === 2}
            Nice one
        {:else if failed === 1}
            No problem
        {:else if failed === 0}
            Amazing
        {/if}
    </h2>
    <span class="text-sm" in:fly={{y: 20, delay: 150,duration: 1000}}>
        {#if !cleared}
            You have run out of guesses.
        {:else if failed > 0}
            You guessed today's album art in <b>{failed+1} guesses</b>!
        {:else}
            You guessed today's album art on <b>the first guess</b>!
        {/if}
    </span>
    <button class="mt-6 px-3 py-2 rounded p-1 uppercase tracking-widest transition-colors duration-200 bg-primary-500"
        in:fly={{y: 40, delay: 300, duration: 1000}} on:click={share}>
        {#if copied}
            Copied to your Clipboard ✔
        {:else}
            Share Result ⬈
        {/if}
    </button>
</div>