<script lang="ts">
    import GameDisplayContainer from "$lib/GameDisplayContainer.svelte";
    import Guess from "$lib/Guess.svelte";

    import Header from "$lib/Header.svelte";
    import Input from "$lib/Input.svelte";
    import Modal from "$lib/Modal.svelte";
    import ModalHelp from "$lib/ModalHelp.svelte";
    import Result from "$lib/Result.svelte";
    import { ALL_STATES, STATE } from "$stores/state.js";
    import { type ComponentType, onMount, setContext } from "svelte";
    import { fade } from "svelte-reduced-motion/transition";

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

<div class="flex flex-col w-full h-full items-center overflow-auto" tabindex="-1" in:fade={{ duration: 100 }}>
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
                <div class="w-full mt-4" aria-live="assertive">
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
{#if modalComponent != null}
    <Modal title={modalTitle} inner={modalComponent} on:closemodal={closeModal} />
{/if}
