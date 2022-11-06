<script lang="ts">
    import dragscroll from "$actions/dragscroll";
    import Left from "$icon/Left.svelte";
    import Right from "$icon/Right.svelte";
    import ZoomIn from "$icon/ZoomIn.svelte";
    import ZoomOut from "$icon/ZoomOut.svelte";
    import type {GameInstanceSiteWrapper} from "$modules/gameHandler.js";
    import {ALBUM, GAME, STATE} from "$stores/state";
    import {onMount} from "svelte";
    import {fly, scale} from 'svelte/transition';

    export let game: GameInstanceSiteWrapper;

    let maxStage: number = $STATE.finished ? 6 : $STATE.failed;
    let stage: number = maxStage;
    let zoomed: boolean = false;
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
    <div class="w-8 mx-2 flex-shrink-0">
        <button class="w-8 h-8 flex items-center justify-center bg-primary-500 rounded select-none
            transition-colors duration-200" disabled="{stage === 0}" class:opacity-50={stage === 0}
                on:click={() => changeStage(-1)} aria-label="Previous Step">
            <Left/>
        </button>
    </div>
    <div class="max-w-sm flex-grow flex flex-col items-end">
        <div class="max-w-sm w-full aspect-square bg-black relative overflow-auto" bind:this={canvasContainer}
             aria-label={$STATE.cleared && stage === maxStage ? "Album Art" : "Hidden Album Art"} class:zoomed
             class:glow={$STATE.cleared && stage === maxStage} in:scale={{start:1.1,opacity:1}} use:dragscroll>
        </div>
        <div class="max-w-sm w-full flex items-center mt-2">
            <div class="w-8 flex-shrink-0">&nbsp;</div>
            <div class="flex-grow px-4">
                {#if $STATE.finished}
                    <!-- aria-hidden: Answer is screen read in Result. This one is just for visual presentation -->
                    <div class="text-xs max-w-sm text-center" in:fly={{y: -30, duration: 1000}} aria-hidden="true">
                        {ALBUM.artistEn} -
                        <b>{@html ALBUM.realEn
                                ? ALBUM.realEn.replace(" [", " <span class='inline-block'>[") + "</span>"
                                : ALBUM.titleEn}</b>
                    </div>
                {:else}
                    <div class="text-xs max-w-sm text-center">
                        <b>{GAME.name.substring(0, GAME.name.indexOf(" (")) || GAME.name}</b>: {GAME.description}
                    </div>
                {/if}
            </div>
            <button class="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-primary-500 rounded select-none
            transition-colors duration-200 self-start" on:click={() => zoomed = !zoomed} aria-label="Toggle Zoom">
                {#if zoomed}
                    <ZoomOut/>
                {:else}
                    <ZoomIn/>
                {/if}
            </button>
        </div>
    </div>
    <div class="w-8 mx-2 flex-shrink-0">
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

    div.zoomed {
        @apply cursor-grab;
    }

    div.zoomed > :global(canvas) {
        @apply w-[640px];
    }

    .glow {
        box-shadow: 0 0 2rem theme("colors.primary.100");
    }
</style>