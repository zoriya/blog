import { fileURLToPath } from "node:url";
import mdx from "@astrojs/mdx";
import catppuccinLatte from "@shikijs/themes/catppuccin-latte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import icon from "astro-icon";
import remarkToc from "remark-toc";

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
				light: {
					...catppuccinLatte,
					name: "catppuccin-latte-custom",
					colors: {
						...catppuccinLatte.colors,
						"editor.background": "#e6e9ef",
					},
				},
				dark: "catppuccin-frappe",
			},
		},
	},
});
