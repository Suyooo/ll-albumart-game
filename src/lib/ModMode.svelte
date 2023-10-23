<script lang="ts">
    import type { AlbumInfo } from "$data/albumpool.js";
    import Down from "$icon/Down.svelte";
    import Up from "$icon/Up.svelte";
    import PageButton from "$lib/styled/PageButton.svelte";
    import { getContext } from "svelte";
    import { slide } from "svelte-reduced-motion/transition";
    import type { getIdsForDay as getIdsForDayFunc } from "$modules/daily.js";
    import type { Writable } from "svelte/store";
    import type { PlayState } from "$stores/state.js";
    import type { GameInfo } from "$data/gamepool.js";

    const ALBUM_POOL = getContext<AlbumInfo[]>("ALBUM_POOL");
    const GAME_POOL = getContext<GameInfo[]>("GAME_POOL");
    const STATE = getContext<Writable<PlayState>>("STATE");
    const getIdsForDay = getContext<typeof getIdsForDayFunc>("getIdsForDay");

    let show = true;
    let showPrevRounds = false;
    let showAlbumHistory = false;

    $: {
        if ($STATE.finished) {
            openPanels();
        }
    }
    function openPanels() {
        if (show) {
            showPrevRounds = showAlbumHistory = true;
        }
    }

    $: {
        if (!show) {
            closePanels();
        }
    }
    function closePanels() {
        showPrevRounds = showAlbumHistory = false;
    }
</script>

<div class="fixed w-full max-w-sm bottom-0 right-8">
    <button
        class="w-full flex px-2 items-center justify-between bg-accent font-bold rounded-t-xl uppercase tracking-widest"
        on:click={() => (show = !show)}
    >
        Dev Mode
        {#if show}
            <Down />
        {:else}
            <Up />
        {/if}
    </button>
    {#if show}
        <div class="bg-input-background border-accent border-l-4 border-r-4 py-1 px-2" transition:slide={{}}>
            {#if import.meta.env.DEV && import.meta.env.VITE_LOCK_DAY === undefined}
                Running NODE_ENV=DEV with VITE_LOCK_DAY unset - rounds get randomized every refresh!
            {:else}
                <b>Day {$STATE.day}</b>
                <div class="mt-1 w-full flex items-center justify-between">
                    <label for="devmode_day_offset">Day Offset</label>
                    <input id="devmode_day_offset" type="number" class="w-20 px-2" placeholder="0" />
                </div>
                <div class="mt-1 w-full flex items-center justify-between">
                    <label for="devmode_reroll_offset">Reroll Offset</label>
                    <input id="devmode_reroll_offset" type="number" class="w-20 px-2" placeholder="0" min="0" />
                </div>

                <button
                    class="mt-4 w-full flex px-2 items-center justify-between bg-accent rounded-t uppercase tracking-widest"
                    class:rounded-b={!showPrevRounds}
                    on:click={() => (showPrevRounds = !showPrevRounds)}
                >
                    Previous Rounds
                    {#if !showPrevRounds}
                        <Down />
                    {:else}
                        <Up />
                    {/if}
                </button>
                {#if showPrevRounds}
                    <div
                        class="bg-background border-accent border-2 border-t-0 py-1 px-2 rounded-b max-h-80 overflow-y-scroll"
                        transition:slide={{}}
                    >
                        <table>
                            {#each { length: $STATE.day - 1 } as _, i}
                                {@const d = $STATE.day - 1 - i}
                                <tr>
                                    <td rowspan="2" class="text-center text-xs font-bold pr-2 align-top leading-4">
                                        {d}
                                    </td>
                                    <td class="text-sm leading-4">
                                        {ALBUM_POOL[getIdsForDay(d, true).rolledAlbumId].titleEn}
                                    </td>
                                </tr>
                                <tr>
                                    <td class="text-xs text-subtle leading-3">
                                        {GAME_POOL[getIdsForDay(d, true).rolledGameId].name}
                                    </td>
                                </tr>
                            {/each}
                        </table>
                    </div>
                {/if}

                <button
                    class="mt-4 w-full flex px-2 items-center justify-between bg-accent rounded-t uppercase tracking-widest"
                    class:rounded-b={!showAlbumHistory}
                    on:click={() => (showAlbumHistory = !showAlbumHistory)}
                >
                    Rounds with this Album
                    {#if !showAlbumHistory}
                        <Down />
                    {:else}
                        <Up />
                    {/if}
                </button>
                {#if showAlbumHistory}
                    <div
                        class="bg-background border-accent border-2 border-t-0 py-1 px-2 rounded-b max-h-40 overflow-y-scroll"
                        transition:slide={{}}
                    >
                        <table>
                            {#each { length: $STATE.day - 1 } as _, i}
                                {@const d = $STATE.day - 1 - i}
                                {#if getIdsForDay(d, true).rolledAlbumId == $STATE.albumId}
                                    <tr>
                                        <td class="text-center text-xs font-bold pr-2 align-top leading-4">
                                            {d}
                                        </td>
                                        <td class="text-sm leading-4">
                                            {GAME_POOL[getIdsForDay(d, true).rolledGameId].name}
                                        </td>
                                    </tr>
                                {/if}
                            {/each}
                        </table>
                    </div>
                {/if}

                <div class="mt-4 mb-1 w-full flex items-center justify-end">
                    <PageButton class="px-2">Upload Reroll</PageButton>
                </div>
            {/if}
        </div>
    {/if}
</div>
