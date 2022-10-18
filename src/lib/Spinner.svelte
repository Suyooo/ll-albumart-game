<script lang="ts">
</script>

<div>&nbsp;</div>

<style lang="postcss">
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    div {
        border-radius: 100%;
        border: 5px solid theme(colors.primary.500);
        border-left-style: none;
        border-bottom-style: none;
        box-sizing: border-box;
        width: 4rem;
        height: 4rem;

        transform-origin: center;
        animation: spin .5s infinite linear;
    }
</style>
