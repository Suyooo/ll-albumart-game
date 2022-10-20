<script lang="ts">
    import Checkmark from "$icon/Copied.svelte";
    import Share from "$icon/Share.svelte";
    import {onMount} from "svelte";
    import {fade, fly} from "svelte/transition";

    export let cleared: boolean;
    export let guesses: (string | null)[];
    export let failed: number;
    export let getShareText: () => string;

    let copied: boolean = false;
    let timer: string;
    let timerOver: boolean = false;

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

    function updateResultTimer() {
        // 1st January 2100, 0:00 JST (so the countdown will always work as long as you cut off days)
        const secondsLeft = (4102412400000 - Date.now()) / 1000;
        if (secondsLeft <= 0) {
            timerOver = true;
        } else {
            const hours = Math.floor(secondsLeft / 3600) % 24;
            const minutes = Math.floor(secondsLeft / 60) % 60;
            const seconds = Math.floor(secondsLeft) % 60;
            timer = hours + (minutes < 10 ? ":0" : ":") + minutes + (seconds < 10 ? ":0" : ":") + seconds;
        }
    }

    onMount(() => {
        setInterval(() => updateResultTimer(), 1000);
        updateResultTimer();
    });
</script>

<div class="w-full flex flex-col items-center justify-between mt-16" in:fly={{y: -30, duration: 500}}>
    <h2 class="tracking-widest uppercase font-bold text-2xl">
        {#if !cleared}
            Too bad
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
    <div class="text-sm text-center" in:fly={{y: -20, duration: 1000}}>
        {#if !cleared}
            You have run out of guesses.
        {:else if failed > 0}
            You guessed today's album art in <b>{failed + 1} guesses</b>!
        {:else}
            You guessed today's album art on <b>the first guess</b>!
        {/if}
    </div>
    <div class="mt-4 flex space-x-3" in:fly={{y: -40, duration: 1000}}>
        {#each {length: 6} as _, i}
            <div class="w-6 h-2" in:fade={{delay: 150 * i}}
                 class:bg-unused={i >= guesses.length}
                 class:bg-skipped={i < guesses.length - (cleared ? 1 : 0) && guesses[i] === null}
                 class:bg-correct={i === guesses.length - 1 && cleared}
                 class:bg-wrong={i < guesses.length - (cleared ? 1 : 0) && guesses[i] !== null}>
                &nbsp;
            </div>
        {/each}
    </div>
    <button class="mt-12 px-3 py-2 rounded p-1 uppercase tracking-widest transition-colors duration-200 bg-primary-500
        flex items-center space-x-2" in:fly={{x: -50, delay: 500, duration: 1000}} on:click={share}>
        {#if copied}
            <Checkmark/>
            <span>Copied to your Clipboard</span>
        {:else}
            <Share/>
            <span>Share Result</span>
        {/if}
    </button>
    <div class="text-sm flex items-center space-x-2 mt-20" in:fly={{x: -50, delay: 600, duration: 1000}}>
        {#if timerOver}
            <div>The next round is available</div>
            <div class="text-xl uppercase tracking-widest">NOW!</div>
            <div>(refresh the page)</div>
        {:else}
            <div>The next round starts in</div>
            <div class="text-xl uppercase tracking-widest">{timer}</div>
        {/if}
    </div>
</div>