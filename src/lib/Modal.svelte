<script lang="ts">
	import focusTrap from "$actions/focusTrap";
	import Close from "$icon/Close.svelte";
	import HeaderButton from "$lib/styled/HeaderButton.svelte";
	import { type ComponentType, createEventDispatcher } from "svelte";
	import { fade } from "svelte-reduced-motion/transition";

	export let inner: ComponentType;
	export let title: string;

	const dispatch = createEventDispatcher<{ closemodal: undefined }>();

	function closeModal() {
		dispatch("closemodal");
	}

	function closeModalKeypress(e: KeyboardEvent) {
		if (e.key === "Escape") closeModal();
	}
</script>

<svelte:window on:keydown={closeModalKeypress} />

<!-- Accessibility is handled with the key event above ^, and there's also an accessible close button as the alternative -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div
	class="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-80 px-8 pb-24 pt-8"
	on:click={closeModal}
	role="presentation"
	transition:fade={{ duration: 100 }}
	use:focusTrap
>
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div
		class="relative w-full max-w-md overflow-hidden rounded bg-background p-4"
		on:click|stopPropagation={() => null}
		role="presentation"
	>
		<h3 class="h-8 flex-grow p-2 font-bold uppercase tracking-widest text-header-button-label">{title}</h3>
		<HeaderButton class="absolute right-4 top-4" label="Close" on:click={closeModal}>
			<Close />
		</HeaderButton>
		<div class="mt-4 h-full max-h-[70vh] overflow-y-auto p-2">
			<svelte:component this={inner} on:closemodal />
		</div>
	</div>
</div>
