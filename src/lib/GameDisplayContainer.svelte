<script lang="ts">
    import {onMount} from "svelte";
    import {fly} from 'svelte/transition';
    
    import GameDisplay from "./GameDisplay.svelte";
    import Spinner from "./Spinner.svelte";
    import type {Album} from "$js/albumpool";
    import type {GameInstanceSiteWrapper} from "$js/games.js";
    import {getGameInstance} from "$js/games.js";

    export let finished: boolean;
    export let day: number;
    export let album: Album;
    export let failed: number = 0;

    let game: GameInstanceSiteWrapper;
    onMount(() => {
        getGameInstance(day, album).then((game_) => game = game_);
    });
</script>

<div class="flex-grow flex flex-col items-center justify-center">
    {#if game}
        {#key (finished ? -1 : failed)}
            <GameDisplay {game} {finished} {failed} />
        {/key}
        {#if finished}
            <div class="text-sm mt-2 text-center max-w-sm mx-auto" in:fly={{x: 30, duration: 1000}}>
                {album.artistEn} - <span class="font-bold">{album.titleEn}</span>
            </div>
        {/if}
    {:else}
        <Spinner/>
    {/if}
</div>
