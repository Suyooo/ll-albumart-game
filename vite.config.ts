import { svelte } from "@sveltejs/vite-plugin-svelte";
import * as path from "path";
import { defineConfig } from "vite";
import svelteConfig from "./svelte.config.js";

const MANUAL_CHUNKS = new Map([
	// game: chunk for game mode utils to avoid circular dependencies between game modes and site
	["src/modules/rng.ts", "game"],
	["src/modules/canvasUtil.ts", "game"],
	["src/modules/gameHandler.ts", "game"],
	["src/data/gamepool.ts", "game"],
	["src/data/gamepool.json", "game"],
	// albumpool: chunk for album data, it's the biggest file on the site, keep it seperate in case of updates
	["src/data/albumpool.ts", "albumpool"],
	["src/data/albumpool.json", "albumpool"],
	// daily: chunk for rolling code, as rerolls might be updated almost daily - improve cache efficiency
	["src/modules/daily.ts", "daily"],
	["src/stores/state.ts", "daily"],
	["src/data/rerolls.ts", "daily"],
	// modmode: chunk for mod mode, so it's only loaded if mod mode is enabled
	["src/lib/ModMode.svelte", "modmode"],
	// Exceptions to avoid bundling these modules in special chunks defined above
	["src/stores/statistics.ts", "site"],
	["src/icon/Up.svelte", "site"],
	["src/icon/Down.svelte", "site"],
	["src/icon/Left.svelte", "site"],
	["src/icon/Right.svelte", "site"],
]);

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
				manualChunks: (id) => {
					// Seperate chunk for node_modules
					if (id.indexOf("node_modules") !== -1) {
						if (id.indexOf("node_modules/matter") !== -1) {
							// And another seperate chunk for matter.js - it's massive, only used by April Fools 2024
							return "vendor-matter";
						}
						return "vendor";
					}

					for (const [filename, chunkName] of MANUAL_CHUNKS) {
						if (id.endsWith(filename)) {
							return chunkName;
						}
					}

					// All code but App.svelte (and entry points) goes into a separate chunk called site
					if (id.indexOf("/src/lib") !== -1) {
						return "site";
					}
					return; // default vite chunking
				},
			},
		},
	},
	define: {
		VITE_DEFINE_BUILDTIME: Date.now(),
	},
}));
