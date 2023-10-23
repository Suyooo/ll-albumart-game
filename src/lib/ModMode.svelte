<script lang="ts">
    import type { AlbumInfo } from "$data/albumpool.js";
    import Down from "$icon/Down.svelte";
    import Up from "$icon/Up.svelte";
    import PageButton from "$lib/styled/PageButton.svelte";
    import { getContext } from "svelte";
    import { slide } from "svelte-reduced-motion/transition";
    import { DAY_CURRENT, type getIdsForDay as getIdsForDayFunc } from "$modules/daily.js";
    import type { Writable } from "svelte/store";
    import type { PlayState } from "$stores/state.js";
    import type { GameInfo } from "$data/gamepool.js";
    import type { rerollDays } from "$data/rerolls.js";
    import Left from "$icon/Left.svelte";
    import Right from "$icon/Right.svelte";

    const ALBUM_POOL = getContext<AlbumInfo[]>("ALBUM_POOL");
    const GAME_POOL = getContext<GameInfo[]>("GAME_POOL");
    const REROLLS = getContext<typeof rerollDays>("REROLLS");
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

    const initialDayOffset = parseInt(localStorage.getItem("llalbum-modmode-day-offset") ?? "0");
    let dayOffset = initialDayOffset;
    function setDayOffset(n: number) {
        localStorage.setItem(`llalbum-modmode-day-offset`, (n ?? 0).toString());
        window.location.reload();
    }

    const rerollOffsetObject = JSON.parse(localStorage.getItem("llalbum-modmode-reroll-offset") ?? "null");
    const initialRerollOffset =
        rerollOffsetObject === null || rerollOffsetObject.day !== $STATE.day ? 0 : rerollOffsetObject.rerollOffset;
    let rerollOffset = initialRerollOffset;
    function setRerollOffset(n: number) {
        localStorage.setItem(
            `llalbum-modmode-reroll-offset`,
            JSON.stringify({ day: $STATE.day, rerollOffset: n ?? 0 })
        );
        window.location.reload();
    }
</script>

<div class="fixed w-full max-w-sm bottom-0 right-8">
    <button
        class="w-full flex px-2 py-1 items-center justify-between bg-accent font-bold rounded-t-xl uppercase tracking-widest"
        on:click={() => (show = !show)}
    >
        Mod Mode
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
                <div>
                    <b>Shown Round:</b>
                    {#if import.meta.env.DEV}
                        Day {import.meta.env.VITE_LOCK_DAY}
                        <span class="text-xs">(locked)</span>
                    {:else}
                        Day {$STATE.day}
                        <span class="text-xs">({initialDayOffset >= 0 ? "+" : ""}{initialDayOffset})</span>
                    {/if},
                    {(REROLLS[$STATE.day] ?? 0) + initialRerollOffset} Rerolls
                    <span class="text-xs">({initialRerollOffset >= 0 ? "+" : ""}{initialRerollOffset})</span>
                </div>
                <div>
                    <b>Actual current round:</b> Day {DAY_CURRENT}, {REROLLS[DAY_CURRENT] ?? 0} Rerolls
                </div>
                <div class="mt-1 w-full flex items-center justify-between">
                    <label for="devmode_day_offset">Day Offset</label>
                    <div class="flex items-center">
                        <PageButton
                            label="Reduce Day Offset"
                            disabled={$STATE.day + initialDayOffset <= 1}
                            on:click={() => setDayOffset(initialDayOffset - 1)}
                        >
                            <Left />
                        </PageButton>
                        <PageButton
                            label="Increase Day Offset"
                            on:click={() => setDayOffset(initialDayOffset + 1)}
                            class="ml-2"
                        >
                            <Right />
                        </PageButton>
                        <input
                            id="devmode_day_offset"
                            type="number"
                            class="ml-4 w-14 px-1"
                            min="-{$STATE.day - 1}"
                            placeholder="0"
                            bind:value={dayOffset}
                        />
                        <PageButton label="Set Day Offset" on:click={() => setDayOffset(dayOffset)} class="ml-2">
                            Set
                        </PageButton>
                    </div>
                </div>
                <div class="mt-1 w-full flex items-center justify-between">
                    <label for="devmode_reroll_offset">Reroll Offset</label>
                    <div class="flex items-center">
                        <PageButton
                            label="Reduce Reroll Offset"
                            disabled={REROLLS[$STATE.day] + initialRerollOffset <= 0}
                            on:click={() => setRerollOffset(initialRerollOffset - 1)}
                        >
                            <Left />
                        </PageButton>
                        <PageButton
                            label="Increase Reroll Offset"
                            on:click={() => setRerollOffset(initialRerollOffset + 1)}
                            class="ml-2"
                        >
                            <Right />
                        </PageButton>
                        <input
                            id="devmode_reroll_offset"
                            type="number"
                            class="ml-4 w-14 px-1"
                            min="-{REROLLS[$STATE.day] || 0}"
                            placeholder="0"
                            bind:value={rerollOffset}
                        />
                        <PageButton
                            label="Set Reroll Offset"
                            on:click={() => setRerollOffset(rerollOffset)}
                            class="ml-2"
                        >
                            Set
                        </PageButton>
                    </div>
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

                <div class="mt-4 mb-1 w-full flex items-center justify-between">
                    <PageButton class="px-2">Reset Day State</PageButton>
                    <PageButton class="px-2">Upload Reroll</PageButton>
                </div>
            {/if}
        </div>
    {/if}
</div>
