<script lang="ts">
    import "../app.css";
    import GameDisplay from "$lib/GameDisplay.svelte";
    import {onMount} from "svelte";
    import type {Album} from "../js/albumpool";
    import type {GameInstance} from "../js/games.js";
    import {getGameInstance} from "../js/games.js";

    export let day: number;
    export let album: Album;
    export let failed: number = 0;

    let game: GameInstance;
    onMount(() => {
        getGameInstance(day, album).then((game_) => {
            game = game_
        });
    });
</script>

<div class="flex-grow flex items-center justify-center">
    {#if game}
        {#key failed}
            <GameDisplay {failed} {game} />
        {/key}
    {:else}
        Loading...
    {/if}
</div>