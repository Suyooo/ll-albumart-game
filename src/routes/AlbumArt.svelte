<script lang="ts">
    import "../app.css";
    import type {Album} from "../js/albumpool";
    import {getGameInstance} from "../js/games.js";

    export let day: number;
    export let album: Album;
    export let failed: number;
</script>

<div class="max-w-sm mx-auto flex-grow">
    {#await getGameInstance(day, album)}
        Loading...
    {:then game}
        <img src="{game.getCanvasForGuess(failed).toDataURL('image/png')}" alt="Guess That Album!">
    {/await}
</div>