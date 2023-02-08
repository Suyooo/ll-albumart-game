<script lang="ts">
    import Wrong from "$icon/Wrong.svelte";
    import {ALL_STATES, STATE} from "$stores/state";
    import {STATISTICS} from "$stores/statistics";
    import {quartOut} from 'svelte/easing';

    let filter: number[] | undefined, max: number, bars: number[][], resetOption: HTMLOptionElement;

    $: {
        let failCountPool: [number, number, number, number, number, number, number];
        if (filter === undefined) {
            failCountPool = $STATISTICS.byFailCount;
        } else {
            failCountPool = [0, 0, 0, 0, 0, 0, 0];
            $ALL_STATES
                .filter(s => s.finished && filter.indexOf(s.gameId) !== -1)
                .forEach(s => failCountPool[s.failed]++);
        }

        max = failCountPool.reduce((max, c) => Math.max(c, max), 0);
        bars = failCountPool.map(c => [c, max ? c / max : 0]);
    }

    function onFilterSelect({currentTarget}: Event & { currentTarget: EventTarget & HTMLSelectElement; }) {
        if (currentTarget.value !== "") {
            filter = currentTarget.value.split(",").map(x => parseInt(x));
            resetOption.disabled = false;
            resetOption.innerText = "Reset Filter";
        } else {
            filter = undefined;
            resetOption.disabled = true;
            resetOption.innerText = "Filter";
        }
        showPing = false;
    }

    function grow(_node: Node, {
        delay = 0,
        duration = 500,
        target
    }) {
        return {
            delay,
            duration,
            css: (t: number) => `max-width: ${quartOut(t) * target * 100}%`
        };
    }

    let showPing = true;
</script>

<div class="flex-col space-y-4">
    <div>
        {#key filter}
            {#each bars as [count, width], i}
                {@const highlight = $STATE.finished && $STATE.failed === i && (filter === undefined || filter.indexOf($STATE.gameId) !== -1)}
                <div class="flex items-center justify-center h-6">
                    <div class="w-8 h-full flex items-center justify-center border-gray-100 border-r-2 font-bold"
                         class:text-primary-300={highlight}>
                        {#if i === 6}
                            <Wrong/>
                        {:else}
                            {i + 1}
                        {/if}
                    </div>
                    <div class="flex-grow relative h-full mr-3 overflow-hidden">
                        <div class="absolute h-[80%] top-[10%] my-auto bg-gray-500" style:width={width*100+"%"}
                             class:bg-primary={highlight} class:min-w-[2px]={count > 0}
                             in:grow={{delay: i * 25, target: width}}>
                            <div class="absolute text-xs leading-[1.2rem] px-2 right-0" class:left-full={width < .2}>
                                {count}
                            </div>
                        </div>
                    </div>
                </div>
            {/each}
        {/key}
        <div class="flex items-center justify-end">
            <select class:ping={showPing} on:change={onFilterSelect} on:click={() => showPing = false}>
                <option bind:this={resetOption} disabled selected value="">Filter</option>
                <option value="4,5">Blinds</option>
                <option value="2">Blobs</option>
                <option value="1">Bubbles</option>
                <option value="0">Pixelated</option>
                <option value="7,9">Shuffled</option>
                <option value="6">Tiles</option>
                <option value="3">Zoomed In</option>
                <option value="8">★ Special</option>
            </select>
        </div>
    </div>
    <div>
        <div class="flex px-2 items-center justify-between border-gray-500 border-b-2">
            <div class="font-bold">Rounds Played</div>
            <div>{$STATISTICS.viewed}</div>
        </div>
        <div class="flex px-2 items-center justify-between border-gray-500 border-b-2">
            <div class="font-bold">Rounds Cleared</div>
            <div>{$STATISTICS.cleared} ({($STATISTICS.cleared / $STATISTICS.viewed * 100).toFixed(1)}%)</div>
        </div>
        <div class="flex px-2 items-center justify-between border-gray-500 border-b-2">
            <div class="font-bold">Current Clear Streak</div>
            <div>{$STATISTICS.currentStreak}</div>
        </div>
        <div class="flex px-2 items-center justify-between">
            <div class="font-bold">Highest Clear Streak</div>
            <div>{$STATISTICS.highestStreak}</div>
        </div>
    </div>
</div>

<style lang="postcss">
    select {
        @apply bg-gray-900 px-2 py-1 rounded
    }
</style>