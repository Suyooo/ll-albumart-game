<script lang="ts">
    import createAutocomplete from "$actions/autocomplete";
    import type { AlbumInfo } from "$data/albumpool.js";
    import PageButton from "$lib/styled/PageButton.svelte";
    import isDesktop from "$modules/isDesktop";
    import type { PlayState } from "$stores/state.js";
    import { STATISTICS } from "$stores/statistics";
    import { getContext } from "svelte";
    import { fly } from "svelte-reduced-motion/transition";
    import type { Writable } from "svelte/store";

    const ALBUM = getContext<AlbumInfo>("ALBUM");
    const STATE = getContext<Writable<PlayState>>("STATE");

    let input: string,
        skipDisabled: boolean = false,
        showRejected: boolean = false,
        inputElement: HTMLInputElement;

    const { autocomplete, VALID_GUESSES } = createAutocomplete(getContext("ALBUM_POOL"));

    function enterSubmit(e: KeyboardEvent): void {
        showRejected = false;
        if (e.key === "Enter" && !e.repeat && input) {
            submit();
        }
    }

    const read = getContext<(s: string, priority?: "polite" | "assertive") => void>("reader");

    function focusInputElement(): void {
        // Always focus on desktop
        if (isDesktop()) {
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
        if (input) {
            read("Please clear the guess input field to confirm that you want to skip.");
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
            setTimeout(
                () => {
                    skipDisabled = false;
                },
                $STATE.failed < 5 ? 500 : 2000
            );

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
        <div
            class="absolute top-2 left-0 -translate-y-full -mt-4 w-full rounded bg-guess-wrong text-text text-center select-none pointer-events-none"
            transition:fly={{ duration: 200, y: 10 }}
        >
            <div class="p-0.5">Invalid guess! Select an option from the list!</div>
        </div>
    {/if}
    <label for="input" class="vhd">Your Guess. Autocomplete.</label>
    <input
        class="flex-grow text-sm w-full rounded p-2 text-text bg-input-background ring-inset ring-2 ring-accent focus:ring-input-border placeholder:text-input-placeholder"
        id="input"
        on:keydown={enterSubmit}
        placeholder="Which album is this?"
        type="text"
        autocapitalize="off"
        autocomplete="off"
        use:autocomplete
        bind:value={input}
        bind:this={inputElement}
        on:autocomplete={setInputValue}
    />
    <div class="w-full flex flex-row-reverse justify-between mt-2">
        <PageButton class="w-32" disabled={!input} on:click={submit}>Submit</PageButton>
        <PageButton class="w-32" disabled={skipDisabled || (input?.length ?? 0) > 0} on:click={skip}>
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
        @apply bg-input-dropdown border-input-border border-2 border-t-0 rounded-b overflow-auto;
    }

    :global(.autocomplete > div) {
        @apply w-full border-input-listsep p-2 border-b-2 last:border-b-0 text-text leading-none;
    }

    /*noinspection CssUnusedSymbol*/
    :global(.autocomplete > div:not(.empty):hover) {
        @apply bg-input-hover;
    }

    :global(.autocomplete mark) {
        @apply bg-input-highlight text-text rounded;
    }

    /*noinspection CssUnusedSymbol*/
    :global(.autocomplete:not(:hover) > .selected) {
        @apply bg-input-hover;
    }

    :global(.autocomplete > div > div) {
        @apply ml-4 text-input-placeholder text-xs tracking-tighter;
    }
</style>
