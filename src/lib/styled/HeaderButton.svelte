<script lang="ts">
    let extra: string = "";

    export let label: string | undefined = undefined;
    // noinspection ReservedWordAsName
    export {extra as class};
</script>

<button aria-label={label} title={label}
        class="w-10 h-10 text-gray-400 hover:text-white flex items-center justify-center rounded
active:text-black active:bg-primary-100 {extra}" on:click>
    <slot/>
</button>