<script lang="ts">
    import {default as autocomplete, VALID_GUESSES} from "$actions/autocomplete";
    import PageButton from "$lib/styled/PageButton.svelte";
    import isDesktop from "$modules/isDesktop";
    import {ALBUM, STATE} from "$stores/state";
    import {STATISTICS} from "$stores/statistics";
    import {getContext} from "svelte";
    import {fly} from 'svelte/transition';

    let input: string, skipDisabled: boolean = false, showRejected: boolean = false,
            inputElement: HTMLInputElement & { autocompleterOpen?: () => void };

    function enterSubmit(e: KeyboardEvent): void {
        showRejected = false;
        if (e.key === "Enter" && !e.repeat && input) {
            submit();
        }
    }

    const read = getContext<(s: string, priority?: "polite" | "assertive") => void>("reader");

    function focusInputElement(): void {
        // Always focus on desktop, but only focus on mobile if in portrait mode (to avoid keyboard hiding canvas)
        if (isDesktop() || window.matchMedia("(orientation: portrait)").matches) {
            inputElement.select();
            inputElement.focus();
        }
    }

    function submit(): void {
        if (!VALID_GUESSES.has(input)) {
            if (!document.querySelector(".autocomplete div[role=option]")) {
                // Show a warning if there are no options for the current input
                read("This is an invalid guess. You must select an option from the autocomplete list.");
                showRejected = true;
                focusInputElement();
            }
            return;
        }

        resolveTurn(input);
    }

    function skip(): void {
        if (skipDisabled) {
            return;
        }

        resolveTurn(null);
    }

    function resolveTurn(guessOrSkip: string | null): void {
        $STATE.guesses.push(guessOrSkip);
        if (input === ALBUM.artistEn + " - " + ALBUM.titleEn || input === ALBUM.artistJa + " - " + ALBUM.titleJa) {
            $STATE.cleared = $STATE.finished = true;
            STATISTICS.addFinishedState($STATE);
        } else {
            $STATE.failed++;
            skipDisabled = true;
            setTimeout(() => {
                skipDisabled = false;
            }, $STATE.failed < 5 ? 500 : 2000);

            if ($STATE.failed >= 6) {
                $STATE.finished = true;
                STATISTICS.addFinishedState($STATE);
            } else {
                input = "";
                focusInputElement();
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
        <div class="absolute top-2 left-0 -translate-y-full -mt-4 w-full rounded bg-wrong text-white text-center
            select-none pointer-events-none" transition:fly={{duration: 200, y: 10}}>
            <div class="p-0.5">Invalid guess! Select an option from the list!</div>
        </div>
    {/if}
    <label for="input" class="vhd">Your Guess. Autocomplete.</label>
    <input class="flex-grow text-sm w-full rounded p-2 text-white bg-gray-700 ring-inset ring-2 ring-primary-500
               focus:ring-white" id="input" on:keydown={enterSubmit} placeholder="Which album is this?" type="text"
           use:autocomplete bind:value={input} bind:this={inputElement} on:autocomplete={setInputValue}>
    <div class="w-full flex flex-row-reverse justify-between mt-2">
        <PageButton class="w-32" disabled={!input} on:click={submit}>
            Submit
        </PageButton>
        <PageButton class="w-32" disabled={skipDisabled} on:click={skip}>
            {#if $STATE.failed < 5}
                Skip Turn
            {:else}
                Give Up
            {/if}
        </PageButton>
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