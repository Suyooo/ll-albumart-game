<script lang="ts">
    import type { GameInstanceSiteWrapper } from "$modules/gameHandler";
    import { getGameSiteInstance } from "$modules/gameHandler";
    import { getContext, onMount } from "svelte";
    import GameDisplay from "./GameDisplay.svelte";
    import Spinner from "./Spinner.svelte";
    import type { Writable } from "svelte/store";
    import type { AlbumInfo } from "$data/albumpool.js";
    import type { GameInfo } from "$data/gamepool.js";
    import type { PlayState } from "$stores/state.js";

    const ALBUM = getContext<AlbumInfo>("ALBUM");
    const GAME = getContext<GameInfo>("GAME");
    const STATE = getContext<Writable<PlayState>>("STATE");

    let game: GameInstanceSiteWrapper;
    onMount(() => {
        getGameSiteInstance($STATE.day, GAME, ALBUM).then((game_) => (game = game_));
    });
</script>

{#if game}
    <GameDisplay {game} />
{:else}
    <Spinner />
{/if}
