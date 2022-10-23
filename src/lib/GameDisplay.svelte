<script lang="ts">
    import Left from "$icon/Left.svelte";
    import Right from "$icon/Right.svelte";
    import {onMount} from "svelte";
    import {scale} from 'svelte/transition';
    import type {GameInstanceSiteWrapper} from "$modules/gameHandler.js";

    export let game: GameInstanceSiteWrapper;
    export let cleared: boolean;
    export let finished: boolean;
    export let failed: number = 0;

    let maxStage: number = failed + (finished && failed < 6 ? 1 : 0);
    let stage: number = maxStage;

    let canvasContainer: HTMLDivElement;

    function updateCanvasList() {
        if (finished && stage === maxStage) {
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
    <div class="w-10 mx-2 flex-shrink">
        {#if stage > 0}
            <button class="w-full h-10 flex items-center justify-center bg-primary-500 rounded select-none
            transition-colors duration-200" on:click={() => { stage--; updateCanvasList(); }}>
                <Left/>
            </button>
        {/if}
    </div>
    <div class="max-w-sm basis-96 aspect-square bg-black relative"
         class:glow={cleared && stage === maxStage} in:scale={{start:1.1,opacity:1}} bind:this={canvasContainer}></div>
    <div class="w-10 mx-2 flex-shrink">
        {#if stage < maxStage}
            <button class="w-full h-10 flex items-center justify-center bg-primary-500 rounded select-none
            transition-colors duration-200" on:click={() => { stage++; updateCanvasList(); }}>
                <Right/>
            </button>
        {/if}
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