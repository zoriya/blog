import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import remarkToc from "remark-toc";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";
import { fileURLToPath } from "url";
import catppuccinLatteCustom from "./src/lib/catppuccin-latte-custom.ts";

export default defineConfig({
	integrations: [icon(), mdx()],
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				"@": fileURLToPath(new URL("./src", import.meta.url)),
			},
		},
	},
	site: "https://zoriya.dev",
	prefetch: {
		prefetchAll: true,
	},
	markdown: {
		remarkPlugins: [[remarkToc, { heading: "contents", tight: true }]],
		shikiConfig: {
			themes: {
				light: catppuccinLatteCustom,
				dark: "catppuccin-frappe",
			},
		},
	},
});
