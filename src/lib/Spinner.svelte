<div>&nbsp;</div>

<style lang="postcss">
	@keyframes spin {
		0% {
			@apply rotate-0;
		}
		100% {
			@apply rotate-[360deg];
		}
	}

	div {
		@apply box-border h-16 w-16 origin-center rounded-full border-[6px] border-b-0 border-l-0 border-accent;
		animation: spin 0.5s infinite linear;
	}
</style>
