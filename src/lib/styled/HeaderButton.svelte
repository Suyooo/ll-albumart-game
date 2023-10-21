<script lang="ts">
    let extra: string = "";

    export let label: string | undefined = undefined;
    // noinspection ReservedWordAsName
    export { extra as class };
</script>

<button
    aria-label={label}
    title={label}
    class="w-10 h-10 text-header-button-label hover:text-header-button-hover-label flex items-center justify-center rounded
active:text-header-button-active-label active:bg-header-button-active {extra}"
    on:click
>
    <slot />
</button>
