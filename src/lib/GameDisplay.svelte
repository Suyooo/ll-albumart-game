<script lang="ts">
    import "../app.css";
    import {onMount} from "svelte";
    import {scale} from 'svelte/transition';
    import type {GameInstanceSiteWrapper} from "$js/games.js";

    export let game: GameInstanceSiteWrapper;
    export let finished: boolean;
    export let failed: number;

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

<div class="w-full max-w-sm aspect-square relative overflow-visible flex items-center">
    <div class="w-full max-w-sm aspect-square mx-auto bg-black relative"
        in:scale={{start:1.1,opacity:1}} bind:this={canvasContainer}></div>
    {#if stage > 0}
        <button class="absolute -left-16 w-10 h-10 flex items-center justify-center bg-primary-500 rounded select-none
            transition-colors" on:click={() => { stage--; updateCanvasList(); }}>🢀</button>
    {/if}
    {#if stage < maxStage}
        <button class="absolute -right-16 w-10 h-10 flex items-center justify-center bg-primary-500 rounded select-none
            transition-colors" on:click={() => { stage++; updateCanvasList(); }}>🢂</button>
    {/if}
</div>