<script lang="ts">
    import Tutorial1 from "$icon/Tutorial1.svelte";
    import Tutorial2 from "$icon/Tutorial2.svelte";
    import Tutorial3 from "$icon/Tutorial3.svelte";
    import PageButton from "$lib/styled/PageButton.svelte";
    import { createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher<{ closemodal: undefined }>();

    function closeModal() {
        dispatch("closemodal");
    }
</script>

<div class="flex flex-col space-y-4 items-center">
    <div class="flex items-center space-x-4">
        <div class="text-accent">
            <Tutorial1 />
        </div>
        <div>
            You will see a concealed image of an LL! album's cover art.
            <span class="inline-block">Which one is it?</span>
        </div>
    </div>
    <div class="flex items-center space-x-4">
        <div class="text-accent">
            <Tutorial2 />
        </div>
        <div>
            If you skip a turn or guess wrong, more parts or details of the picture
            <span class="inline-block">are revealed!</span>
        </div>
    </div>
    <div class="flex items-center space-x-4">
        <div class="text-accent">
            <Tutorial3 />
        </div>
        <div>
            Find the correct answer in six turns, and share your result with
            <span class="inline-block">your friends!</span>
        </div>
    </div>
    <PageButton class="px-3" on:click={closeModal}>Start!</PageButton>
</div>
