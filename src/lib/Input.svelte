<script lang="ts">
    import {autocomplete, VALID_GUESSES} from "$actions/autocomplete";

    import {createEventDispatcher} from "svelte";

    export let failed: 0 | 1 | 2 | 3 | 4 | 5 | 6;

    const dispatch = createEventDispatcher<{ guess: string }>();
    let input: string, disabled: boolean = false, inputElement: HTMLInputElement;

    function enterSubmit(e: KeyboardEvent): void {
        if (e.key === "Enter" && !e.repeat && input) {
            submit();
        }
    }

    function submit(): void {
        if (!input || VALID_GUESSES.has(input)) {
            disabled = true;
            setTimeout(() => { disabled = false; }, failed < 4 ? 500 : 2000);
            dispatch("guess", input);
            input = "";
            inputElement.focus();
        }
    }

    function setInputValue(e: CustomEvent<string>): void {
        input = e.detail;
        inputElement.focus();
        requestAnimationFrame(() => {
            inputElement.scrollLeft = inputElement.scrollWidth;
        });
    }
</script>

<div class="w-full flex flex-col sm:flex-row justify-between mb-4 mt-4
    space-x-0 sm:space-x-4 space-y-2 sm:space-y-0 items-end sm:items-center">
    <input class="flex-grow w-full rounded p-2 text-white bg-gray-700 text-sm ring-inset ring-2 ring-primary-500
        focus:ring-white" placeholder="Which album is this?" on:keydown={enterSubmit} bind:value={input}
        bind:this={inputElement} use:autocomplete on:select={setInputValue}>
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
        outline: none !important;
        border: 0 !important;
    }

    /*noinspection CssUnusedSymbol*/
    :global(.autocomplete) {
        @apply bg-gray-800 border-white border-2 border-t-0 rounded-b mt-[-2px] overflow-auto;
    }

    :global(.autocomplete > div) {
        @apply w-full hover:bg-primary-900 border-gray-700 p-2 border-b-2 last:border-b-0 text-white leading-none;
    }

    :global(.autocomplete mark) {
        @apply bg-primary-700 text-white rounded;
    }

    /*noinspection CssUnusedSymbol*/
    :global(.autocomplete:not(:hover) > .selected) {
        @apply bg-primary-900;
    }

    :global(.autocomplete > div > div) {
        @apply ml-4 text-gray-400 text-xs tracking-tighter;
    }
</style>