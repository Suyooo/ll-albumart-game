<script lang="ts">
    import { ALBUM_POOL } from "$data/albumpool.js";
    import { GAME_POOL } from "$data/gamepool.js";
    import ModMode from "$lib/ModMode.svelte";
    import GameDisplayContainer from "$lib/GameDisplayContainer.svelte";
    import Guess from "$lib/Guess.svelte";
    import Header from "$lib/Header.svelte";
    import Input from "$lib/Input.svelte";
    import Modal from "$lib/Modal.svelte";
    import ModalHelp from "$lib/ModalHelp.svelte";
    import Result from "$lib/Result.svelte";
    import { getIdsForDay } from "$modules/daily.js";
    import { initPlayState } from "$stores/state.js";
    ("$stores/state.js");
    import { type ComponentType, onMount, setContext } from "svelte";
    import { rerollDays } from "$data/rerolls.js";

    setContext("DEFINE_BUILDTIME", VITE_DEFINE_BUILDTIME);
    setContext("ALBUM_POOL", ALBUM_POOL);
    setContext("GAME_POOL", GAME_POOL);
    const { ALBUM, ALL_STATES, GAME, STATE } = initPlayState();
    setContext("ALBUM", ALBUM);
    setContext("GAME", GAME);
    setContext("STATE", STATE);
    setContext("ALL_STATES", ALL_STATES);

    const modModeActive = (localStorage.getItem("llalbum-modmode-webhook") || "").length > 0;
    if (modModeActive) {
        setContext("REROLLS", rerollDays);
        setContext("getIdsForDay", getIdsForDay);
    }

    let modalTitle: string = "";
    let modalComponent: ComponentType | null = null;

    function openModalEvent(event: CustomEvent<{ title: string; component: any }>) {
        openModal(event.detail.title, event.detail.component);
    }

    function openModal(title: string, component: any) {
        modalTitle = title;
        modalComponent = component;
    }

    function closeModal() {
        modalComponent = null;
    }

    let announcerPolite: HTMLDivElement, announcerAssertive: HTMLDivElement;
    setContext<(s: string, priority?: "polite" | "assertive") => void>(
        "reader",
        (s: string, priority?: "polite" | "assertive") => {
            const div = document.createElement("div");
            div.innerText = s;
            if (priority === "assertive") {
                announcerAssertive.append(div);
            } else {
                announcerPolite.append(div);
            }
        }
    );

    onMount(() => {
        if ($ALL_STATES.length === 1 && $STATE.guesses.length === 0 && import.meta.env.PROD) {
            // First ever ame, show help PROD
            openModal("How to Play", ModalHelp);
        }
    });
</script>

<div class="flex flex-col w-full h-full items-center overflow-auto" tabindex="-1">
    <Header on:openmodal={openModalEvent} />

    <main class="w-full max-w-screen-sm flex-grow flex flex-col mb-6">
        <div class="md:flex-grow flex flex-col items-center justify-center">
            <GameDisplayContainer />
        </div>
        <div
            class="px-8 mt-4 flex-grow flex flex-col items-center justify-between"
            aria-live={$STATE.finished ? "polite" : "off"}
        >
            {#if $STATE.finished}
                <Result />
            {:else}
                <Input />
                <div class="w-full mt-4 px-4" aria-live="assertive">
                    {#each { length: 6 } as _, i}
                        <Guess {i} />
                    {/each}
                </div>
            {/if}
        </div>
    </main>

    <div class="vhd">
        <div bind:this={announcerPolite} aria-live="polite" />
        <div bind:this={announcerAssertive} aria-live="assertive" />
    </div>
</div>
{#if modModeActive}
    <ModMode />
{/if}
{#if modalComponent != null}
    <Modal title={modalTitle} inner={modalComponent} on:closemodal={closeModal} />
{/if}
