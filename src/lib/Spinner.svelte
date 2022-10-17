<script lang="ts">
    import "../app.css";
</script>

<div>&nbsp;</div>

<style>
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
        border: 5px solid white;
        border-left-style: none;
        border-bottom-style: none;
        width: 4rem;
        height: 4rem;
        line-height: 4rem;
        display: block;

        transform-origin: center;
        animation: spin .5s infinite linear;
    }
</style>