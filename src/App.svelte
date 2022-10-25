<script lang="ts">
    import Modal from "$lib/Modal.svelte";
    import ModalHelp from "$lib/ModalHelp.svelte";
    import {onMount} from "svelte";
    import {fade} from 'svelte/transition';

    import Header from "$lib/Header.svelte";
    import GameDisplayContainer from "$lib/GameDisplayContainer.svelte";
    import Input from "$lib/Input.svelte";
    import Guess from "$lib/Guess.svelte";
    import Result from "$lib/Result.svelte";
    import {ALL_STATES, STATE} from "$stores/state";

    let modalTitle: string = "";
    let modalComponent = null;

    function openModalEvent(event: CustomEvent<{ title: string, component: any }>) {
        openModal(event.detail.title, event.detail.component);
    }

    function openModal(title: string, component: any) {
        modalTitle = title;
        modalComponent = component;
    }

    function closeModal() {
        modalComponent = null;
    }

    onMount(() => {
        if ($ALL_STATES.length === 1 && $STATE.guesses.length === 0 && !INDEV) {
            // First ever game, show help modal
            openModal("How to Play", ModalHelp);
        }
    })
</script>

<div class="flex flex-col w-full h-full items-center overflow-auto" in:fade={{duration: 100}}>
    <Header on:openmodal={openModalEvent}/>

    <main class="w-full max-w-screen-sm flex-grow flex flex-col mb-6">
        <div class="md:flex-grow flex flex-col items-center justify-center">
            <GameDisplayContainer/>
        </div>
        <div class="px-8 flex-grow flex flex-col items-center justify-between">
            {#if $STATE.finished}
                <Result/>
            {:else}
                <Input/>
                <div class="w-full">
                    {#each {length: 6} as _, i}
                        <Guess {i}/>
                    {/each}
                </div>
            {/if}
        </div>
    </main>
</div>
{#if modalComponent != null}
    <Modal title={modalTitle} inner={modalComponent} on:closemodal={closeModal}/>
{/if}