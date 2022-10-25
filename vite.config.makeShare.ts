import * as path from "path";
import {defineConfig} from "vite";

export default defineConfig({
    publicDir: false,

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
        outDir: "dist/scripts",
        emptyOutDir: false,
        lib: {
            entry: "scripts/makeShare.ts",
            name: "makeShare",
            fileName: "makeShare"
        },
        rollupOptions: { external: ["fs","canvas"] }
    },
    define: {
        DEBUG: false
    }
})
