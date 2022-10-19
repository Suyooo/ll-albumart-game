<script lang="ts">
    import "../app.css";
    import Correct from "$icon/Correct.svelte";
    import Skip from "$icon/Skip.svelte";
    import Wrong from "$icon/Wrong.svelte";
    import {fly} from 'svelte/transition';

    export let guess: string | null | undefined = undefined;
    export let cleared: boolean;
    export let isEmpty: boolean;
    export let isCurrent: boolean;

    $: isCorrect = isCurrent && cleared;
    $: isSkipped = !isEmpty && guess === null;
    $: isWrong = !isEmpty && !isCurrent && guess !== null;
    $: isNextGuess = isCurrent && !cleared;
</script>

<div class="w-full my-1 px-2 py-1 border-2 text-sm flex min-h-8 transition-colors duration-[400ms]"
     class:border-current={isNextGuess}
     class:border-unused={isEmpty && !isNextGuess}
     class:border-skipped={isSkipped}
     class:border-correct={isCorrect}
     class:border-wrong={isWrong}>
    {#if !isEmpty}
        <div class="w-4 mr-3" class:text-skipped={isSkipped} class:text-correct={isCorrect} class:text-wrong={isWrong}
            in:fly={{x: 30}}>
            {#if isCorrect}
                <Correct />
            {:else if isWrong}
                <Wrong />
            {:else}
                <Skip />
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

<style>
    div > .flex-grow {
        @apply leading-none;
        @apply py-[.25em];
    }
</style>