import { svelte } from "@sveltejs/vite-plugin-svelte";
import * as path from "path";
import { defineConfig } from "vite";
import svelteConfig from "./svelte.config.js";

export default defineConfig(() => ({
    plugins: [svelte(svelteConfig)],
    resolve: {
        alias: {
            $actions: path.resolve(__dirname, "./src/actions"),
            $data: path.resolve(__dirname, "./src/data"),
            $icon: path.resolve(__dirname, "./src/icon"),
            $lib: path.resolve(__dirname, "./src/lib"),
            $modules: path.resolve(__dirname, "./src/modules"),
            $stores: path.resolve(__dirname, "./src/stores"),
        },
    },
    build: {
        assetsDir: "bundles",
        rollupOptions: {
            output: {
                manualChunks: {
                    albumpool: ["src/data/albumpool.json", "src/data/albumpool.ts"],
                    rerolls: ["src/data/rerolls.ts"],
                },
            },
        },
    },
    define: {
        BUILDTIME: Date.now(),
        BUILDDATE: JSON.stringify(new Date(Date.now()).toLocaleString()),
    },
}));
