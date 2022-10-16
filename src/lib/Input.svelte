<script lang="ts">
    import "../app.css";
    import type {AutocompleteResult} from "autocompleter/autocomplete";
    import {createEventDispatcher, onDestroy, onMount} from "svelte";
    import {initAutocomplete, VALID_GUESSES} from "../js/autocomplete";

    export let failed: 0 | 1 | 2 | 3 | 4 | 5 | 6;
    export let finished: boolean;

    const dispatch = createEventDispatcher<{ guess: string }>();
    let input: string, disabled: boolean = false, inputElement: HTMLInputElement;

    function submit(): void {
        if (!input || VALID_GUESSES.has(input)) {
            dispatch("guess", input);
            input = "";
            disabled = true;
            setTimeout(() => { disabled = false; }, 500);
        }
    }

    let autocompleteInstance: AutocompleteResult;
    onMount(() => autocompleteInstance = initAutocomplete(inputElement, (s: string) => input = s));
    onDestroy(() => autocompleteInstance?.destroy());
</script>

<div class="w-full flex items-center justify-between mb-8 mt-4" class:hidden={finished}>
    <input class="flex-grow rounded p-2 text-white bg-gray-700 text-sm ring-inset ring-2 ring-emerald-600
        focus:ring-white" placeholder="Which album is this?" bind:value={input} bind:this={inputElement}
        on:keydown={e => { if (e.key === "Enter" && !e.repeat && input) submit(); }}>
    <div class="flex flex-col items-center ml-4 relative">
        <span class="text-gray-400 uppercase tracking-widest text-xs absolute w-full text-center -bottom-5">
            Guess {failed + 1}/6
        </span>
        <button class="w-32 rounded p-1 uppercase tracking-widest transition-colors duration-200" {disabled}
                class:bg-gray-800={disabled} class:bg-emerald-600={input && !disabled}
                class:bg-emerald-800={!input && !disabled} on:click={submit}>
            {#if input}
                Submit
            {:else if failed < 5}
                Skip
            {:else}
                Give Up
            {/if}
        </button>
    </div>
</div>