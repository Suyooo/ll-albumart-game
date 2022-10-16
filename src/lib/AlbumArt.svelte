<script lang="ts">
    import "../app.css";
    import {onMount} from "svelte";
    import {scale} from 'svelte/transition';
    import type {Album} from "../js/albumpool";
    import type {GameInstance} from "../js/games.js";
    import {getGameInstance} from "../js/games.js";

    export let day: number;
    export let album: Album;
    export let failed: number = 0;

    let game: GameInstance, canvasContainer: HTMLDivElement;
    onMount(() => getGameInstance(day, album).then((game_) => game = game_));
    $: canvasContainer?.replaceChildren(<HTMLCanvasElement>game.getCanvasForGuess(failed));
</script>

<div class="flex-grow flex items-center justify-center">
    {#if game}
        {#key failed}
            <div class="max-w-sm mx-auto" bind:this={canvasContainer} in:scale={{start:1.1,opacity:1}}></div>
        {/key}
    {:else}
        Loading...
    {/if}
</div>