import { getCollection } from "astro:content";
import rss from "@astrojs/rss";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
	const allBlogs = await getCollection("blogs", ({ data }) => !data.draft);
	const allPosts = await getCollection("posts", ({ data }) => !data.draft);

	const items = [...allBlogs, ...allPosts]
		.sort((a, b) => b.data.date.getTime() - a.data.date.getTime())
		.map((entry) => ({
			title: entry.data.title,
			description: entry.data.description || "",
			pubDate: entry.data.date,
			link: `/${entry.collection}/${entry.id}/`,
		}));

	return rss({
		title: "Zoe's blog",
		description: "Zoe Roux's personal blog",
		site: context.site ?? "",
		items,
		customData: `<language>en</language>`,
	});
}
