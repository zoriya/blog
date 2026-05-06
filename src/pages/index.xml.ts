import type { APIContext } from "astro";
import { GET as rssGET } from "./rss.xml";

export async function GET(context: APIContext) {
	return rssGET(context);
}
