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
    class:border-current={isNextGuess}
    class:border-unused={isEmpty && !isNextGuess}
    class:border-skipped={isSkipped}
    class:border-correct={isCorrect}
    class:border-wrong={isWrong}
>
    {#if !isEmpty}
        <div
            class="w-4 mr-3"
            class:text-skipped={isSkipped}
            class:text-correct={isCorrect}
            class:text-wrong={isWrong}
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
            class:text-gray-500={isSkipped}
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
