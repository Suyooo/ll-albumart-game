<script lang="ts">
    import "../app.css";
    import {onMount} from "svelte";
    import {scale} from 'svelte/transition';
    import type {GameInstance} from "../js/games.js";

    export let failed: number;
    export let game: GameInstance;
    let canvasContainer: HTMLDivElement;
    onMount(() => canvasContainer.replaceChildren(<HTMLCanvasElement>game.getCanvasForGuess(failed)));
</script>

<div class="max-w-sm mx-auto bg-black" in:scale={{start:1.1,opacity:1}} bind:this={canvasContainer}></div>