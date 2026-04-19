<script lang="ts">
	let extra: string = "";

	export let label: string | undefined = undefined;
	// noinspection ReservedWordAsName
	export { extra as class };
</script>

<button
	aria-label={label}
	title={label}
	class="flex h-10 w-10 items-center justify-center rounded text-header-button-label hover:text-header-button-hover-label
active:bg-header-button-active active:text-header-button-active-label {extra}"
	on:click
>
	<slot />
</button>
