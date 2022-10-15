<script lang="ts">
    import {ALBUMPOOL} from "../js/albumpool";

    import Header from "./Header.svelte";
    import AlbumArt from "./AlbumArt.svelte";
    import Input from "./Input.svelte";
    import Guess from "./Guess.svelte";
    import Footer from "./Footer.svelte";

    interface PlayState {
        albumId: keyof ALBUMPOOL,
        failed: 0 | 1 | 2 | 3 | 4 | 5 | 6,
        cleared: boolean,
        finished: boolean,
        guesses: (string | null)[]
    }

    const STATE: PlayState = {
        albumId: <keyof ALBUMPOOL>0,
        failed: 0,
        cleared: false,
        finished: false,
        guesses: []
    };

    function doGuess(event) {
        STATE.guesses.push(event.detail || null);
        STATE.failed++;
    }
</script>

<div class="text-gray-100 bg-gray-900 flex flex-col w-full h-full items-center overflow-auto">
    <Header/>

    <main class="w-full max-w-screen-sm flex-grow flex flex-col">
        <AlbumArt/>

        <Input failed={STATE.failed} finished={STATE.finished} on:submit={doGuess} />
        {#each {length: 6} as _, i}
            <Guess guess={STATE.guesses[i]} cleared={STATE.cleared}
                isEmpty={STATE.failed <= i} isCurrent={STATE.failed === i} />
        {/each}
    </main>

    <Footer/>
</div>