<script lang="ts">
    import {STATE, ALBUM, GAME} from "$stores/state";
    import {onMount} from "svelte";
    import {fly} from 'svelte/transition';

    import GameDisplay from "./GameDisplay.svelte";
    import Spinner from "./Spinner.svelte";
    import type {GameInstanceSiteWrapper} from "$modules/gameHandler";
    import {getGameSiteInstance} from "$modules/gameHandler";

    let game: GameInstanceSiteWrapper;
    onMount(() => {
        getGameSiteInstance($STATE.day, GAME, ALBUM).then((game_) => game = game_);
    });
</script>

{#if game}
    {#key ($STATE.finished ? -1 : $STATE.failed)}
        <GameDisplay {game} cleared={$STATE.cleared} finished={$STATE.finished} failed={$STATE.failed}/>
    {/key}
{:else}
    <Spinner/>
{/if}
{#if $STATE.finished}
    <div class="text-xs max-w-sm text-center mt-4" in:fly={{y: -30, duration: 1000}}>
        {ALBUM.artistEn} -
        <b>{@html ALBUM.realEn
            ? ALBUM.realEn.replace(" [", " <span class='inline-block'>[") + "</span>"
            : ALBUM.titleEn}</b>
    </div>
{/if}

<style>
</style>
