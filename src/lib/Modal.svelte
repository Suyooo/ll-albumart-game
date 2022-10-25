<script lang="ts">
    import Close from "$icon/Close.svelte";
    import {createEventDispatcher} from "svelte";
    import {fade} from "svelte/transition";
    import {focusTrap} from "$actions/focusTrap";

    export let inner: any;
    export let title: string;

    const dispatch = createEventDispatcher<{ closemodal: undefined }>();

    function closeModal() {
        dispatch("closemodal");
    }
</script>

<svelte:window on:keydown={e => { if (e.key === "Escape") closeModal() }}/>

<!--
    svelte-ignore a11y-click-events-have-key-events
    Accessibility is handled with the key event above ^, and there's also an accessible close button as the alternative
-->
<div class="absolute left-0 top-0 w-full h-full bg-gray-900 bg-opacity-80 flex items-center justify-center px-8 pt-8 pb-24"
     on:click={closeModal} transition:fade={{duration: 100}} use:focusTrap>
    <div class="w-full max-w-md bg-gray-700 rounded p-4 relative overflow-hidden" on:click|stopPropagation={() => null}>
        <h3 class="flex-grow h-8 p-2 uppercase tracking-widest font-bold text-gray-400">{title}</h3>
        <button class="absolute right-4 top-4 text-gray-400" on:click={closeModal}>
            <Close/>
        </button>
        <div class="overflow-y-auto p-2 mt-4 h-full max-h-[70vh]">
            <svelte:component this={inner} on:closemodal/>
        </div>
    </div>
</div>

<style lang="postcss">
    div.overflow-y-auto :global(a) {
        @apply underline text-primary-100;
    }

    div.overflow-y-auto :global(a):active {
        @apply text-primary-50;
    }
</style>