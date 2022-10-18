<script lang="ts">
</script>

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
        @apply w-16;
        @apply h-16;
        @apply border-primary-500;
        @apply border-[6px];
        @apply border-b-0;
        @apply border-l-0;
        @apply rounded-full;
        @apply box-border;
        @apply origin-center;
        animation: spin .5s infinite linear;
    }
</style>
