<script lang="ts">
    import {STATE, ALBUM, GAME} from "$stores/state";
    import {onMount} from "svelte";

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
        <GameDisplay {game} />
    {/key}
{:else}
    <Spinner/>
{/if}

<style>
</style>
