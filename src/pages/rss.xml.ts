import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { AUTHOR, SITE_DESCRIPTION, SITE_TITLE, SITE_URL } from "../consts";
import { getPublishedPosts } from "../lib/posts";

export async function GET(context: APIContext) {
  const posts = await getPublishedPosts();

  return rss({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    site: context.site ?? SITE_URL,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/posts/${post.slug}/`,
      author: post.data.author || AUTHOR.name,
      categories: post.data.tags || [],
    })),
    customData: `<language>zh-CN</language>`,
  });
}
