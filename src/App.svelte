<script lang="ts">
    import {ALBUMPOOL} from "$js/albumpool";

    import Header from "$lib/Header.svelte";
    import GameDisplayContainer from "$lib/GameDisplayContainer.svelte";
    import Input from "$lib/Input.svelte";
    import Guess from "$lib/Guess.svelte";
    import Footer from "$lib/Footer.svelte";

    interface PlayState {
        day: number,
        albumId: number,
        failed: 0 | 1 | 2 | 3 | 4 | 5 | 6,
        cleared: boolean,
        finished: boolean,
        guesses: (string | null)[]
    }

    const STATE: PlayState = {
        day: 1,
        albumId: 0,
        failed: 0,
        cleared: false,
        finished: false,
        guesses: []
    };
    //$: console.log(STATE);
    do {
        STATE.day = Math.floor(Math.random() * 1000);
        STATE.albumId = Math.floor(Math.random() * ALBUMPOOL.length);
    } while (ALBUMPOOL[STATE.albumId].url === "");
    //STATE.albumId = 280;

    function addGuess(event: CustomEvent<string>) {
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

<Header/>

<main class="w-full max-w-screen-sm flex-grow flex flex-col px-8">
    <GameDisplayContainer
            day={STATE.day} finished={STATE.finished} album={ALBUMPOOL[STATE.albumId]} failed={STATE.failed} />

    <Input failed={STATE.failed} finished={STATE.finished} on:guess={addGuess} />
    {#each {length: 6} as _, i}
        <Guess guess={STATE.guesses[i]} cleared={STATE.cleared}
            isEmpty={STATE.failed < i || (STATE.failed === i && !STATE.cleared)} isCurrent={STATE.failed === i} />
    {/each}
</main>

<Footer/>
