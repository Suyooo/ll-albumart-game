import preprocess from "svelte-preprocess";
import postcss from './postcss.config.cjs';

export default {
    preprocess: [
        preprocess({postcss}),
    ],
}