<script lang="ts">
    import {default as autocomplete, VALID_GUESSES} from "$actions/autocomplete";
    import isDesktop from "$modules/isDesktop";
    import {ALBUM, STATE} from "$stores/state";
    import {STATISTICS} from "$stores/statistics";
    import {getContext} from "svelte";
    import {fly} from 'svelte/transition';

    let input: string, disabled: boolean = false, showRejected: boolean = false, inputElement: HTMLInputElement;

    function enterSubmit(e: KeyboardEvent): void {
        showRejected = false;
        if (e.key === "Enter" && !e.repeat && input) {
            submit();
        }
    }

    const read = getContext<(s: string, priority?: "polite" | "assertive") => void>("reader");

    function submit(): void {
        if (disabled) {
            return;
        }
        if (input && !VALID_GUESSES.has(input)) {
            if (!document.querySelector(".autocomplete div[role=option]")) {
                // show a warning if there are no options for the current input
                read("This is an invalid guess. You must select an option from the autocomplete list.");
                showRejected = true;
            }
            return;
        }

        $STATE.guesses.push(input || null);
        if (input === ALBUM.artistEn + " - " + ALBUM.titleEn ||
            input === ALBUM.artistJa + " - " + ALBUM.titleJa) {
            $STATE.cleared = $STATE.finished = true;
            STATISTICS.addFinishedState($STATE);
        } else {
            $STATE.failed++;
            disabled = true;
            setTimeout(() => {
                disabled = false;
            }, $STATE.failed < 5 ? 500 : 2000);

            if ($STATE.failed >= 6) {
                $STATE.finished = true;
                STATISTICS.addFinishedState($STATE);
            } else {
                input = "";
                // Always focus on desktop, but only focus on mobile if in portrait mode to avoid keyboard hiding canvas
                if (isDesktop() || window.matchMedia("(orientation: portrait)").matches) {
                    inputElement.focus();
                }
            }
        }
    }

    function setInputValue(e: CustomEvent<string>): void {
        showRejected = false;
        input = e.detail;
        inputElement.focus();
        requestAnimationFrame(() => {
            inputElement.scrollLeft = inputElement.scrollWidth;
        });
    }
</script>

<div class="relative w-full">
    {#if showRejected}
        <div class="absolute top-2 left-0 -translate-y-full w-full rounded bg-wrong text-white text-center
            select-none pointer-events-none" transition:fly={{duration: 200, y: 10}}>
            <div class="p-0.5">Invalid guess! Select an option from the list!</div>
        </div>
    {/if}
    <label for="input" class="vhd">Your Guess. Autocomplete.</label>
    <div class="w-full flex flex-col sm:flex-row justify-between mb-4 mt-4 space-x-0 sm:space-x-4 space-y-2 sm:space-y-0
         items-end sm:items-center">
        <input id="input" type="text" placeholder="Which album is this?" on:keydown={enterSubmit} use:autocomplete
               class="flex-grow text-sm w-full rounded p-2 text-white bg-gray-700 ring-inset ring-2 ring-primary-500
               focus:ring-white" bind:value={input} bind:this={inputElement} on:autocomplete={setInputValue}>
        <button class="w-32 h-8 rounded p-1 uppercase tracking-widest transition-colors duration-200"
                class:bg-gray-700={disabled} class:bg-primary-500={input && !disabled}
                class:bg-primary-700={!input && !disabled} on:click={submit} aria-disabled={disabled}>
            {#if input}
                Submit
            {:else if $STATE.failed < 5}
                Skip
            {:else}
                Give Up
            {/if}
        </button>
    </div>
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
        @apply w-full border-gray-700 p-2 border-b-2 last:border-b-0 text-white leading-none;
    }

    /*noinspection CssUnusedSymbol*/
    :global(.autocomplete > div:not(.empty):hover) {
        @apply bg-primary-900;
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