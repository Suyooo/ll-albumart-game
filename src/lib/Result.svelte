<script lang="ts">
    import type { AlbumInfo } from "$data/albumpool.js";
    import type { GameInfo } from "$data/gamepool.js";
    import Checkmark from "$icon/Copied.svelte";
    import Share from "$icon/Share.svelte";
    import PageButton from "$lib/styled/PageButton.svelte";
    import isDesktop from "$modules/isDesktop";
    import type { PlayState } from "$stores/state.js";
    import { getContext, onMount } from "svelte";
    import { fade, fly } from "svelte-reduced-motion/transition";
    import type { Writable } from "svelte/store";

    const ALBUM = getContext<AlbumInfo>("ALBUM");
    const GAME = getContext<GameInfo>("GAME");
    const STATE = getContext<Writable<PlayState>>("STATE");

    let copied: boolean = false;
    let timerSpeak: string, timerText: string;
    let timerOver: boolean = false;
    let animateBlocks: boolean = false;

    function getShareText(): string {
        return (
            "LL! Guess That Album #" +
            $STATE.day +
            "\n\ud83d\udcbf" +
            $STATE.guesses
                .map((guess: string | null, index: number) => {
                    if (index < $STATE.failed) {
                        if (guess === null) return "\u2b1c";
                        else return "\ud83d\udfe5";
                    } else if (index === $STATE.failed) return "\ud83d\udfe9";
                    else return;
                })
                .join("") +
            "\u2b1b".repeat(6 - $STATE.failed - ($STATE.cleared ? 1 : 0)) +
            "\n#LLGuessThatAlbum #lovelive #ラブライブ\nhttps://llalbum.suyo.be/" +
            $STATE.day
        );
    }

    const read = getContext<(s: string, priority?: "polite" | "assertive") => void>("reader");

    function shareResult() {
        const shareText = getShareText();
        if (
            navigator.share &&
            navigator.canShare({ text: shareText }) &&
            !isDesktop() &&
            // Firefox for Android does not support sharing text via navigator.share
            // There is no way to programmatically check whether a browser supports sharing text via the native share
            // mechanism, so we simply have to remember to manually remove this when it is implemented in Firefox
            !navigator.userAgent.includes("Firefox")
        ) {
            navigator.share({ text: shareText });
        } else {
            // PC browsers usually don't have a native share mechanism - just copy it instead
            navigator.clipboard
                .writeText(shareText)
                .then(() => {
                    read("Your result has been copied to your clipboard.", "assertive");
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
            timerText = hours + (minutes < 10 ? ":0" : ":") + minutes + (seconds < 10 ? ":0" : ":") + seconds;
            timerSpeak = hours + " hours and " + minutes + "minutes";
        }
    }

    updateResultTimer();

    onMount(() => {
        setInterval(() => updateResultTimer(), 1000);
        updateResultTimer();
    });
</script>

<div
    class="flex flex-col items-center mt-12"
    in:fly={{ y: -50, duration: 1000 }}
    on:introstart={() => (animateBlocks = true)}
>
    <h2 class="tracking-widest uppercase font-bold text-2xl" class:text-accent-text={GAME.messageOverride}>
        {#if GAME.messageOverride}
            {GAME.messageOverride}
        {:else if !$STATE.cleared}
            Too bad
        {:else if $STATE.failed === 5}
            Close one
        {:else if $STATE.failed === 4}
            You got it
        {:else if $STATE.failed === 3}
            Good job
        {:else if $STATE.failed === 2}
            Nice one
        {:else if $STATE.failed === 1}
            No problem
        {:else if $STATE.failed === 0}
            Amazing
        {/if}
    </h2>
    <div class="text-sm text-center">
        {#if !$STATE.cleared}
            You have run out of guesses.
            <span class="vhd">The answer was: {ALBUM.artistEn} - {ALBUM.titleEn}</span>
        {:else if $STATE.failed > 0}
            You guessed today's album art in <b>{$STATE.failed + 1} guesses</b>!
        {:else}
            You guessed today's album art on <b>the first guess</b>!
        {/if}
    </div>
    <div class="flex space-x-3 mt-2 mb-3" aria-hidden="true">
        {#each { length: 6 } as _, i (i + (animateBlocks ? 6 : 0))}
            <div
                class="w-6 h-2"
                in:fade={{ delay: 150 * i }}
                class:bg-guess-unused={i >= $STATE.guesses.length}
                class:bg-guess-skipped={i < $STATE.guesses.length - ($STATE.cleared ? 1 : 0) &&
                    $STATE.guesses[i] === null}
                class:bg-guess-correct={i === $STATE.guesses.length - 1 && $STATE.cleared}
                class:bg-guess-wrong={i < $STATE.guesses.length - ($STATE.cleared ? 1 : 0) &&
                    $STATE.guesses[i] !== null}
            >
                &nbsp;
            </div>
        {/each}
    </div>
</div>

<div in:fly={{ x: -50, delay: 500, duration: 1000 }}>
    <PageButton on:click={shareResult} label="Share Your Result" class="h-[unset] px-3 py-2 gap-x-2">
        {#if copied}
            <Checkmark />
            <span aria-hidden="true">Copied to your Clipboard</span>
        {:else}
            <Share />
            <span aria-hidden="true">Share Your Result</span>
        {/if}
    </PageButton>
</div>

<div in:fly={{ x: -50, delay: 600, duration: 1000 }} aria-live="polite">
    {#if timerOver}
        <div class="text-sm flex items-center space-x-2" aria-atomic="true">
            <div>The next round is available</div>
            <div class="text-xl uppercase tracking-widest">NOW!</div>
            <div>(refresh the page)</div>
        </div>
    {:else}
        <div class="text-sm flex items-center space-x-2" aria-atomic="true">
            <div>The next round starts in</div>
            <div class="text-xl uppercase tracking-widest">
                <span class="vhd">{timerSpeak}</span>
                <span aria-hidden="true">{timerText}</span>
            </div>
        </div>
    {/if}
</div>
