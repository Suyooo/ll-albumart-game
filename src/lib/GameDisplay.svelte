<script lang="ts">
    import "../app.css";
    import {onMount} from "svelte";
    import {scale} from 'svelte/transition';
    import type {GameInstanceWrapper} from "../js/games.js";

    export let failed: number;
    export let game: GameInstanceWrapper;
    let canvasContainer: HTMLDivElement;
    onMount(() => {
        if (game.base.stacked) {
            const canvases = [];
            for (let i = 0; i <= failed; i++) {
                canvases.push(<HTMLCanvasElement>game.getCanvasForGuess(i));
            }
            canvasContainer.replaceChildren(...canvases);
        } else {
            canvasContainer.replaceChildren(<HTMLCanvasElement>game.getCanvasForGuess(failed));
        }
    });
</script>

<div class="w-full max-w-sm aspect-square mx-auto bg-black relative"
     bind:this={canvasContainer} in:scale={{start:1.1,opacity:1}}></div>