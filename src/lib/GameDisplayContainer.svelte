<script lang="ts">
    import type {GameInstanceSiteWrapper} from "$modules/gameHandler";
    import {getGameSiteInstance} from "$modules/gameHandler";
    import {ALBUM, GAME, STATE} from "$stores/state";
    import {onMount} from "svelte";

    import GameDisplay from "./GameDisplay.svelte";
    import Spinner from "./Spinner.svelte";

    let game: GameInstanceSiteWrapper;
    onMount(() => {
        getGameSiteInstance($STATE.day, GAME, ALBUM).then((game_) => game = game_);
    });
</script>

{#if game}
    <GameDisplay {game}/>
{:else}
    <Spinner/>
{/if}