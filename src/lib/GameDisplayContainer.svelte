<script lang="ts">
    import "../app.css";
    import GameDisplay from "$lib/GameDisplay.svelte";
    import Spinner from "$lib/Spinner.svelte";
    import {onMount} from "svelte";
    import {fly} from 'svelte/transition';
    import type {Album} from "../js/albumpool";
    import type {GameInstanceWrapper} from "../js/games.js";
    import {getGameInstance} from "../js/games.js";

    export let finished: boolean;
    export let day: number;
    export let album: Album;
    export let failed: number = 0;

    let game: GameInstanceWrapper;
    onMount(() => {
        getGameInstance(day, album).then((game_) => game = game_);
    });
</script>

<div class="flex-grow flex flex-col items-center justify-center">
    {#if game}
        {#key failed}
            <GameDisplay {failed} {game} />
        {/key}
        {#if finished}
            <div class="text-sm mt-2" in:fly={{x: 30, duration: 1000}}>
                {album.artistEn} - <span class="font-bold">{album.titleEn}</span>
            </div>
        {/if}
    {:else}
        <Spinner/>
    {/if}
</div>