import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import remarkToc from "remark-toc";
import mdx from "@astrojs/mdx";
import icon from "astro-icon";

export default defineConfig({
	integrations: [icon(), mdx()],
	vite: {
		plugins: [tailwindcss()],
	},
	site: "https://zoriya.dev",
	prefetch: {
		prefetchAll: true,
	},
	markdown: {
		remarkPlugins: [[remarkToc, { heading: "contents", tight: true }]],
		shikiConfig: {
			themes: {
				light: "catppuccin-latte",
				dark: "catppuccin-frappe",
			},
		},
	},
});
