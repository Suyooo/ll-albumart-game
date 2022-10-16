<script lang="ts">
    import "../app.css";
    import {onMount} from "svelte";
    import type {Album} from "../js/albumpool";
    import type {GameInstance} from "../js/games.js";
    import {getGameInstance} from "../js/games.js";

    export let day: number;
    export let album: Album;
    export let failed: number;

    let game: GameInstance;
    onMount(() => getGameInstance(day, album).then((game_) => game = game_));
</script>

<div class="max-w-sm mx-auto flex-grow flex items-center justify-center">
    {#if game}
        <img src="{game.getCanvasForGuess(failed).toDataURL('image/png')}" alt="Guess That Album!">
    {:else}
        Loading...
    {/if}
</div>