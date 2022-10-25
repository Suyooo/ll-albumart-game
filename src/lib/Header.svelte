<script lang="ts">
    import {createEventDispatcher} from "svelte";
    import About from "$icon/About.svelte";
    import Help from "$icon/Help.svelte";
    import Stats from "$icon/Statistics.svelte";
    import ModalAbout from "$lib/ModalAbout.svelte";
    import ModalHelp from "$lib/ModalHelp.svelte";
    import ModalStatistics from "$lib/ModalStatistics.svelte";

    const dispatch = createEventDispatcher<{ openmodal: { title: string, component: any } }>();

    function modalOpener(title, component): () => void {
        return () => {
            dispatch("openmodal", {title, component});
        }
    }
</script>

<header class="w-full border-white border-b-2 mb-4">
    <div class="text-gray-400 max-w-screen-md mx-auto flex items-center">
        <button class="w-10 h-10 mt-1 flex items-center justify-center"
            on:click={modalOpener("About", ModalAbout)}>
            <About/>
        </button>
        <div class="w-10">&nbsp;</div>
        <h1 class="flex-grow text-center text-white text-2xl font-bold py-2">
            <span class="text-primary">LL!</span> <span class="inline-block">Guess That Album</span>
        </h1>
        <button class="w-10 h-10 mt-1 flex items-center justify-center"
            on:click={modalOpener("Stats", ModalStatistics)}>
            <Stats/>
        </button>
        <button class="w-10 h-10 mt-1 flex items-center justify-center"
                on:click={modalOpener("How To Play", ModalHelp)}>
            <Help/>
        </button>
    </div>
</header>