<script lang="ts">
    import {STATE} from "$stores/state";
    import Left from "$icon/Left.svelte";
    import Right from "$icon/Right.svelte";
    import {onMount} from "svelte";
    import {scale} from 'svelte/transition';
    import type {GameInstanceSiteWrapper} from "$modules/gameHandler.js";

    export let game: GameInstanceSiteWrapper;

    let maxStage: number = $STATE.finished ? 6 : $STATE.failed;
    let stage: number = maxStage;

    let canvasContainer: HTMLDivElement;

    function changeStage(d: number) {
        stage += d;
        if (stage < 0) stage = 0;
        if (stage > maxStage) stage = maxStage;
        updateCanvasList();
    }

    function updateCanvasList() {
        if ($STATE.finished && stage === maxStage) {
            canvasContainer.replaceChildren(game.getFinishedCanvas());
        } else if (game.base.stacked) {
            const canvases = [];
            for (let i = 0; i <= stage && i < 6; i++) {
                canvases.push(game.getCanvasForGuess(i));
            }
            canvasContainer.replaceChildren(...canvases);
        } else {
            canvasContainer.replaceChildren(game.getCanvasForGuess(Math.min(stage, 5)));
        }
    }

    onMount(updateCanvasList);
</script>

<div class="w-full relative overflow-visible flex items-center justify-center">
    <div class="w-8 mx-2 flex-shrink">
        <button class="w-8 h-8 flex items-center justify-center bg-primary-500 rounded select-none
            transition-colors duration-200" disabled="{stage === 0}" class:opacity-50={stage === 0}
                on:click={() => changeStage(-1)} aria-label="Previous Step">
            <Left/>
        </button>
    </div>
    <div class="max-w-sm basis-96 aspect-square bg-black relative" bind:this={canvasContainer}
         aria-label={$STATE.cleared && stage === maxStage ? "Album Art" : "Hidden Album Art"}
         class:glow={$STATE.cleared && stage === maxStage} in:scale={{start:1.1,opacity:1}}></div>
    <div class="w-8 mx-2 flex-shrink">
        <button class="w-8 h-8 flex items-center justify-center bg-primary-500 rounded select-none
        transition-colors duration-200" disabled={stage >= maxStage} class:opacity-50={stage >= maxStage}
                on:click={() => changeStage(1)} aria-label="Next Step">
            <Right/>
        </button>
    </div>
</div>

<style lang="postcss">
    div > :global(canvas) {
        @apply absolute left-0 top-0 w-full;
    }

    .glow {
        box-shadow: 0 0 2rem theme("colors.primary.100");
    }
</style>