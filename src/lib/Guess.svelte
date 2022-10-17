<script lang="ts">
    import "../app.css";
    import {fly} from 'svelte/transition';

    export let guess: string | null | undefined = undefined;
    export let cleared: boolean;
    export let isEmpty: boolean;
    export let isCurrent: boolean;

    let isCorrect: boolean, isSkipped: boolean, isWrong: boolean, isNextGuess: boolean;
    $: isCorrect = isCurrent && cleared;
    $: isSkipped = !isEmpty && guess === null;
    $: isWrong = !isEmpty && !isCurrent && guess !== null;
    $: isNextGuess = isCurrent && !cleared;
</script>

<div class="w-full my-1 p-2 border-2 text-sm flex min-h-10 transition-colors duration-[400ms]"
     class:border-current={isNextGuess}
     class:border-unused={isEmpty && !isNextGuess}
     class:border-skipped={isSkipped}
     class:border-correct={isCorrect}
     class:border-wrong={isWrong}>
    {#if !isEmpty}
        <div class="w-4 mr-3" in:fly={{x: 30}}>
            {#if isCorrect}
                🟩
            {:else if isWrong}
                🟥
            {:else}
                ⬜️
            {/if}
        </div>
        <div class="flex-grow" class:font-bold={isCorrect} class:text-gray-500={isSkipped} in:fly={{x: 30}}>
            {#if !isSkipped}
                {guess}
            {:else}
                (skip)
            {/if}
        </div>
    {/if}
</div>