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
        @apply w-16 h-16 border-primary-500 border-[6px] border-b-0 border-l-0 rounded-full box-border origin-center;
        animation: spin 0.5s infinite linear;
    }
</style>
