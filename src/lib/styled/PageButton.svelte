<script lang="ts">
    let extra: string = "";

    export let label: string | undefined = undefined;
    export let disabled: boolean = false;
    // noinspection ReservedWordAsName
    export {extra as class};
</script>

<button aria-disabled={disabled} aria-label={label} title={label}
        class="h-8 flex items-center justify-center rounded p-1 uppercase tracking-widest select-none {extra}"
        class:active:bg-primary-100={!disabled}
        class:active:text-black={!disabled} class:bg-gray-700={disabled}
        class:bg-primary-500={!disabled} class:hover:bg-gray-700={disabled} class:hover:bg-primary-300={!disabled}
        on:click>
    <slot/>
</button>