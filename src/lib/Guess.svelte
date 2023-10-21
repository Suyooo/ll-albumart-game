<script lang="ts">
    import Correct from "$icon/Correct.svelte";
    import Skip from "$icon/Skip.svelte";
    import Wrong from "$icon/Wrong.svelte";
    import type { PlayState } from "$stores/state.js";
    import { getContext } from "svelte";
    import { fly } from "svelte-reduced-motion/transition";
    import type { Writable } from "svelte/store";

    const STATE = getContext<Writable<PlayState>>("STATE");

    export let i: number = 0;
    $: guess = $STATE.guesses[i];

    $: isEmpty = $STATE.failed < i || ($STATE.failed === i && !$STATE.cleared);
    $: isCurrent = $STATE.failed === i;
    $: isCorrect = isCurrent && $STATE.cleared;
    $: isSkipped = !isEmpty && guess === null;
    $: isWrong = !isEmpty && !isCurrent && guess !== null;
    $: isNextGuess = isCurrent && !$STATE.cleared;
</script>

<div
    class="w-full my-1 px-2 py-1 border-2 text-sm flex min-h-8 transition-colors duration-[400ms]"
    class:border-guess-current={isNextGuess}
    class:border-guess-unused={isEmpty && !isNextGuess}
    class:border-guess-skipped={isSkipped}
    class:border-guess-correct={isCorrect}
    class:border-guess-wrong={isWrong}
>
    {#if !isEmpty}
        <div
            class="w-4 mr-3"
            class:text-guess-skipped={isSkipped}
            class:text-guess-correct={isCorrect}
            class:text-guess-wrong={isWrong}
            in:fly={{ x: 30 }}
        >
            {#if isCorrect}
                <Correct />
            {:else if isWrong}
                <Wrong />
            {:else}
                <Skip />
            {/if}
        </div>
        <div
            class="flex-grow leading-none py-[.25em]"
            class:font-bold={isCorrect}
            class:text-guess-current={isSkipped}
            in:fly={{ x: 30 }}
        >
            {#if !isSkipped}
                {#if isWrong}
                    <span class="vhd">Wrong Guess:</span>
                {/if}
                {guess}
            {:else}
                (skip)
            {/if}
        </div>
    {/if}
</div>
