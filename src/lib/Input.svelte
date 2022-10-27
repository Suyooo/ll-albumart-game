<script lang="ts">
    import {autocomplete, VALID_GUESSES} from "$actions/autocomplete";
    import {STATE, ALBUM} from "$stores/state";
    import {STATISTICS} from "$stores/statistics";

    let input: string, disabled: boolean = false, inputElement: HTMLInputElement;

    function enterSubmit(e: KeyboardEvent): void {
        if (e.key === "Enter" && !e.repeat && input) {
            submit();
        }
    }

    function submit(): void {
        if (!input || VALID_GUESSES.has(input)) {
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
                    inputElement.focus();
                }
            }
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
    <input id="input" class="flex-grow w-full rounded p-2 text-white bg-gray-700 text-sm ring-inset ring-2
        ring-primary-500 focus:ring-white" placeholder="Which album is this?" on:keydown={enterSubmit}
           bind:value={input} bind:this={inputElement} use:autocomplete on:autocomplete={setInputValue}>
    <button class="w-32 rounded p-1 uppercase tracking-widest transition-colors duration-200" {disabled}
            class:bg-gray-700={disabled} class:bg-primary-500={input && !disabled}
            class:bg-primary-700={!input && !disabled} on:click={submit}>
        {#if input}
            Submit
        {:else if $STATE.failed < 5}
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