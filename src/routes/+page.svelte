<script lang="ts">
    import Guess from "./Guess.svelte";

    export const prerender = true;

    const guesses: { guess: string }[] = [
        {guess: "test"},
        {guess: "test"},
        {guess: "test"}
    ]

    function change(i) {
        guesses[i].guess = prompt("do it");
    }
</script>

<header>
    <h1>Welcome to ASASSASA</h1>
</header>

<main>
    {#each guesses as g}
        <Guess guess={g}/>
    {/each}

    <button on:click={() => change(0)}>Change 0</button>
    <button on:click={() => change(1)}>Change 1</button>
    <button on:click={() => change(2)}>Change 2</button>
</main>