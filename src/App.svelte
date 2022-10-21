<script lang="ts">
    import {ALBUMPOOL} from "$data/albumpool";

    import Header from "$lib/Header.svelte";
    import GameDisplayContainer from "$lib/GameDisplayContainer.svelte";
    import Input from "$lib/Input.svelte";
    import Guess from "$lib/Guess.svelte";
    import Footer from "$lib/Footer.svelte";
    import Result from "$lib/Result.svelte";
    import {ALBUM, STATE} from "$stores/state";

    do {
        $STATE.day = Math.floor(Math.random() * 1000);
        $STATE.albumId = Math.floor(Math.random() * ALBUMPOOL.length);
    } while ($ALBUM.url === "");
</script>

<Header/>

<main class="w-full max-w-screen-sm flex-grow flex flex-col">
    <GameDisplayContainer />
    <div class="px-8 flex-grow flex flex-col items-center justify-between">
        {#if $STATE.finished}
            <Result />
        {:else}
            <Input />
            <div class="w-full">
                {#each {length: 6} as _, i}
                    <Guess {i}/>
                {/each}
            </div>
        {/if}
    </div>
</main>

<Footer/>
