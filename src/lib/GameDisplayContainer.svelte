<script lang="ts">
    import {onMount} from "svelte";
    import {fly} from 'svelte/transition';

    import GameDisplay from "./GameDisplay.svelte";
    import Spinner from "./Spinner.svelte";
    import type {Album} from "$data/albumpool";
    import type {GameInstanceSiteWrapper} from "$modules/games";
    import {getGameInstance} from "$modules/games";

    export let cleared: boolean;
    export let finished: boolean;
    export let day: number;
    export let album: Album;
    export let failed: number = 0;

    let game: GameInstanceSiteWrapper;
    onMount(() => {
        getGameInstance(day, album).then((game_) => game = game_);
    });
</script>

<div class="md:flex-grow flex flex-col items-center justify-center">
    {#if game}
        {#key (finished ? -1 : failed)}
            <GameDisplay {game} {cleared} {finished} {failed}/>
        {/key}
    {:else}
        <Spinner/>
    {/if}
    {#if finished}
        <div class="text-xs max-w-sm text-center mt-4" in:fly={{y: -30, duration: 1000}}>
            {album.artistEn} -
            <b>{@html album.realEn
                ? album.realEn.replace(" [", " <span class='inline-block'>[") + "</span>"
                : album.titleEn}</b>
        </div>
    {/if}
</div>

<style>
</style>
