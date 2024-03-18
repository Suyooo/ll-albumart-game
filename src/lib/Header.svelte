<script lang="ts">
    import About from "$icon/About.svelte";
    import Help from "$icon/Help.svelte";
    import Stats from "$icon/Statistics.svelte";
    import ThemeDark from "$icon/ThemeDark.svelte";
    import ThemeLight from "$icon/ThemeLight.svelte";
    import ModalAbout from "$lib/ModalAbout.svelte";
    import ModalHelp from "$lib/ModalHelp.svelte";
    import ModalStatistics from "$lib/ModalStatistics.svelte";
    import ModalTheme from "$lib/ModalTheme.svelte";
    import HeaderButton from "$lib/styled/HeaderButton.svelte";
    import type { PlayState } from "$stores/state.js";
    import { createEventDispatcher, getContext } from "svelte";
    import type { Writable } from "svelte/store";

    const dispatch = createEventDispatcher<{ openmodal: { title: string; component: any } }>();

    function modalOpener(title: string, component: any): () => void {
        return () => {
            dispatch("openmodal", { title, component });
        };
    }

    let theme = localStorage.getItem("llalbum-theme") || "dark";
    const STATE = getContext<Writable<PlayState>>("STATE");
    let themeShowPing = $STATE.day === 366 && localStorage.getItem("llalbum-theme") === null;
    function toggleTheme(newTheme: string) {
        if (themeShowPing) {
            dispatch("openmodal", { title: "New: Color Theme", component: ModalTheme });
            themeShowPing = false;
        } else {
            theme = newTheme;
        }
        localStorage.setItem("llalbum-theme", theme);
        document.querySelector("body")!.dataset["theme"] = theme;
    }
</script>

<header class="w-full border-header-label border-b-2 mb-4">
    <div class="max-w-screen-md mx-auto flex items-center mt-0.5">
        <a class="opacity-0 focus:opacity-100 absolute left-5 pointer-events-none" href="#input">Skip to game</a>
        <HeaderButton label="About" on:click={modalOpener("About", ModalAbout)}>
            <About />
        </HeaderButton>
        {#if theme === "light"}
            <HeaderButton label="Dark Mode" on:click={() => toggleTheme("dark")}>
                <ThemeDark />
            </HeaderButton>
        {:else}
            <HeaderButton label="Light Mode" on:click={() => toggleTheme("light")}>
                <ThemeLight />
            </HeaderButton>
        {/if}
        {#if themeShowPing}<div class="bg-accent ping w-2 h-2 rounded-full -ml-3 -mt-5" />{/if}
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
