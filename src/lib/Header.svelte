<script lang="ts">
    import About from "$icon/About.svelte";
    import Help from "$icon/Help.svelte";
    import Stats from "$icon/Statistics.svelte";
    import ModalAbout from "$lib/ModalAbout.svelte";
    import ModalHelp from "$lib/ModalHelp.svelte";
    import ModalStatistics from "$lib/ModalStatistics.svelte";
    import HeaderButton from "$lib/styled/HeaderButton.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ openmodal: { title: string; component: any } }>();

    function modalOpener(title: string, component: any): () => void {
        return () => {
            dispatch("openmodal", { title, component });
        };
    }
</script>

<header class="w-full border-header-label border-b-2 mb-4">
    <div class="max-w-screen-md mx-auto flex items-center mt-0.5">
        <a class="opacity-0 focus:opacity-100 absolute left-5 pointer-events-none" href="#input">Skip to game</a>
        <HeaderButton label="About" on:click={modalOpener("About", ModalAbout)}>
            <About />
        </HeaderButton>
        <div class="w-10" aria-hidden="true">&nbsp;</div>
        <div class="flex-grow text-center text-header-label text-2xl font-bold py-2" aria-hidden="true">
            <span class="text-accent">LL!</span> <span class="inline-block">Guess That Album</span>
        </div>
        <HeaderButton label="Stats" on:click={modalOpener("Stats", ModalStatistics)}>
            <Stats />
        </HeaderButton>
        <HeaderButton label="How To Play" on:click={modalOpener("How To Play", ModalHelp)}>
            <Help />
        </HeaderButton>
    </div>
</header>
