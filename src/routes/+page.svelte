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
        albumId: <keyof ALBUMPOOL>89,
        failed: 0,
        cleared: false,
        finished: false,
        guesses: []
    };

    function addGuess(event) {
        STATE.guesses.push(event.detail || null);
        if (event.detail === ALBUMPOOL[STATE.albumId].artistEn + " - " + ALBUMPOOL[STATE.albumId].titleEn ||
            event.detail === ALBUMPOOL[STATE.albumId].artistJa + " - " + ALBUMPOOL[STATE.albumId].titleJa) {
            STATE.cleared = STATE.finished = true;
        } else {
            STATE.failed++;
            if (STATE.failed >= 6) STATE.finished = true;
        }
    }
</script>

<div class="text-gray-100 bg-gray-900 flex flex-col w-full h-full items-center overflow-auto">
    <Header/>

    <main class="w-full max-w-screen-sm flex-grow flex flex-col">
        <AlbumArt/>

        <Input failed={STATE.failed} finished={STATE.finished} on:guess={addGuess} />
        {#each {length: 6} as _, i}
            <Guess guess={STATE.guesses[i]} cleared={STATE.cleared}
                isEmpty={STATE.failed < i || (STATE.failed === i && !STATE.cleared)} isCurrent={STATE.failed === i} />
        {/each}
    </main>

    <Footer/>
</div>