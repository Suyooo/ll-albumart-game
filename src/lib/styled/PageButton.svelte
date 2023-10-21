<script lang="ts">
    let extra: string = "";

    export let label: string | undefined = undefined;
    export let disabled: boolean = false;
    // noinspection ReservedWordAsName
    export { extra as class };
</script>

<button
    aria-disabled={disabled}
    aria-label={label}
    title={label}
    class="h-8 flex items-center justify-center rounded p-1 uppercase tracking-widest select-none {extra}"
    class:active:bg-button-active={!disabled}
    class:active:text-button-active-label={!disabled}
    class:bg-button-disabled={disabled}
    class:bg-button-fill={!disabled}
    class:hover:bg-button-disabled={disabled}
    class:hover:bg-button-hover={!disabled}
    on:click
>
    <slot />
</button>
