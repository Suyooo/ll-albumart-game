<script>
    import {quartOut} from 'svelte/easing';
    import Wrong from "$icon/Wrong.svelte";
    import {STATE} from "$stores/state";
    import {STATISTICS} from "$stores/statistics";

    const max = $STATISTICS.byFailCount.reduce((max, c) => Math.max(c, max), 0);
    const bars = $STATISTICS.byFailCount.map(c => [c, c / max]);

    function grow(node, {
        delay = 0,
        duration = 500,
        target
    }) {
        return {
            delay,
            duration,
            css: t => `max-width: ${quartOut(t) * target * 100}%`
        };
    }
</script>

<div class="flex-col space-y-4">
    <div>
        {#each bars as [count, width], i}
            <div class="flex items-center justify-center h-6">
                <div class="w-8 h-full flex items-center justify-center border-gray-100 border-r-2 font-bold"
                     class:text-primary-300={$STATE.finished && $STATE.failed === i}>
                    {#if i === 6}
                        <Wrong/>
                    {:else}
                        {i + 1}
                    {/if}
                </div>
                <div class="flex-grow relative h-full mr-3 overflow-hidden">
                    <div class="absolute h-[80%] top-[10%] my-auto bg-gray-500" style:width={width*100+"%"}
                         class:bg-primary={$STATE.finished && $STATE.failed === i} class:min-w-[2px]={count > 0}
                         in:grow={{delay: i * 25, target: width}}>
                        <div class="absolute text-xs leading-[1.2rem] px-2 right-0" class:left-full={width < .2}>
                            {count}
                        </div>
                    </div>
                </div>
            </div>
        {/each}
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