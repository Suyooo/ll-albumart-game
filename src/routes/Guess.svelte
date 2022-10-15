<script lang="ts">
    import "../app.css";

    export let guess: string | null | undefined;
    export let cleared: boolean;
    export let isEmpty: boolean;
    export let isCurrent: boolean;
</script>

<div class="w-full my-1 p-2 border-2 text-sm flex min-h-10"
     class:border-gray-700={isEmpty || (!isEmpty && guess === null)}
     class:border-gray-500={isCurrent && !cleared}
     class:border-green-500={isCurrent && cleared}
     class:border-red-500={!isEmpty && !isCurrent && guess !== null}>
    {#if !isEmpty}
        <div class="w-4 mr-3">
            {#if isCurrent && cleared}
                🟩
            {:else if guess !== null}
                🟥
            {:else}
                ⬜️
            {/if}
        </div>
        <div class="flex-grow" class:text-gray-500={guess === null}>
            {#if guess !== null}
                {guess}
            {:else}
                (skip)
            {/if}
        </div>
    {/if}
</div>