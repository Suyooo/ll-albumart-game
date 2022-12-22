import * as path from "path";
import {defineConfig} from "vite";
import {svelte} from "@sveltejs/vite-plugin-svelte";

export default defineConfig(({command}) => {
    const indev = command !== "build";
    return {
        plugins: [svelte()],
        resolve: {
            alias: {
                "$actions": path.resolve(__dirname, "./src/actions"),
                "$data": path.resolve(__dirname, "./src/data"),
                "$icon": path.resolve(__dirname, "./src/icon"),
                "$lib": path.resolve(__dirname, "./src/lib"),
                "$modules": path.resolve(__dirname, "./src/modules"),
                "$stores": path.resolve(__dirname, "./src/stores")
            },
        },
        build: {
            assetsDir: "bundles",
            rollupOptions: {
                manualChunks: {
                    "albumpool": [
                        "src/data/albumpool.json",
                        "src/data/albumpool.ts"
                    ],
                    "rerolls": [
                        "src/data/rerolls.ts"
                    ]
                },
            }
        },
        define: {
            INDEV: indev,
            BUILDTIME: Date.now(),
            BUILDDATE: JSON.stringify(new Date(Date.now()).toLocaleDateString())
        }
    };
});