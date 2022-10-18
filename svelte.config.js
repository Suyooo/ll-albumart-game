import preprocess from "svelte-preprocess";
import postcss from './postcss.config.js';

export default {
    preprocess: [
        preprocess({postcss}),
    ],
}