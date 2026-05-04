import { defineCollection, z } from "astro:content";
import { glob } from "astro/loaders";

const getCol = (x: string) =>
	defineCollection({
		loader: glob({
			base: `./src/content/${x}`,
			pattern: "**/index.{md,mdx}",
			generateId: ({ entry }) => entry.replace(/\/index\.(md|mdx)$/, ""),
		}),
		schema: z.object({
			title: z.string(),
			description: z.string().optional().default(""),
			date: z.date(),
			draft: z.boolean().optional().default(false),
			tags: z.array(z.string()).optional().default([]),
		}),
	});

export const collections = {
	blogs: getCol("blogs"),
	posts: getCol("posts"),
};
