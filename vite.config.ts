import * as path from "path";
import postcss from "./postcss.config.js";
import {defineConfig} from "vite";
import {svelte} from "@sveltejs/vite-plugin-svelte";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [svelte()],
    resolve:{
        alias:{
            '$js' : path.resolve(__dirname, './src/js'),
            '$lib' : path.resolve(__dirname, './src/lib')
        },
    },
    css: {
        postcss
    }
})
