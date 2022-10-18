<script lang="ts">
    import type {AutocompleteResult} from "autocompleter/autocomplete";
    import {initAutocomplete, VALID_GUESSES} from "$js/autocomplete";

    import {createEventDispatcher, onDestroy, onMount} from "svelte";

    export let failed: 0 | 1 | 2 | 3 | 4 | 5 | 6;

    const dispatch = createEventDispatcher<{ guess: string }>();
    let input: string, disabled: boolean = false, inputElement: HTMLInputElement;

    function submit(): void {
        if (!input || VALID_GUESSES.has(input)) {
            disabled = true;
            setTimeout(() => { disabled = false; }, failed < 4 ? 500 : 2000);
            dispatch("guess", input);
            input = "";
        }
    }

    let autocompleteInstance: AutocompleteResult;
    onMount(() => autocompleteInstance = initAutocomplete(inputElement, (s: string) => input = s));
    onDestroy(() => autocompleteInstance?.destroy());
</script>

<div class="w-full flex flex-col sm:flex-row items-center justify-between mb-4 mt-4
    space-x-0 sm:space-x-4 space-y-2 sm:space-y-0">
    <input class="flex-grow w-full rounded p-2 text-white bg-gray-700 text-sm ring-inset ring-2 ring-primary-500
        focus:ring-white" placeholder="Which album is this?" bind:value={input} bind:this={inputElement}
        on:keydown={e => { if (e.key === "Enter" && !e.repeat && input) submit(); }}>
    <button class="w-32 rounded p-1 uppercase tracking-widest transition-colors duration-200" {disabled}
            class:bg-gray-700={disabled} class:bg-primary-500={input && !disabled}
            class:bg-primary-700={!input && !disabled} on:click={submit}>
        {#if input}
            Submit
        {:else if failed < 5}
            Skip
        {:else}
            Give Up
        {/if}
    </button>
</div>

<style lang="postcss">
    input {
        @apply outline-0;
        @apply border-0;
    }

    :global(.autocomplete mark) {
        @apply bg-primary-700;
        @apply text-white;
        @apply rounded;
    }

    /*noinspection CssUnusedSymbol*/
    :global(.autocomplete:not(:hover) > .selected) {
        @apply bg-primary-900;
    }
</style>