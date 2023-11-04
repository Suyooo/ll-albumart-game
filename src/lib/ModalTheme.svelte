<script lang="ts">
    import PageButton from "$lib/styled/PageButton.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ closemodal: undefined }>();

    function closeModal() {
        dispatch("closemodal");
    }
</script>

<div class="flex flex-col space-y-4 items-center">
    <div class="w-full">You can use this button to switch between Light and Dark Theme!</div>
    <div class="w-full flex justify-end"><PageButton class="px-3" on:click={closeModal}>OK</PageButton></div>
</div>
