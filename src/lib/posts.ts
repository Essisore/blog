import { getCollection } from "astro:content";
import type { CollectionEntry } from "astro:content";

export function isPublishedPost(post: CollectionEntry<"posts">) {
  return !post.data.draft;
}

export async function getPublishedPosts() {
  const posts = await getCollection("posts");

  return posts
    .filter(isPublishedPost)
    .sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export async function getTagCounts() {
  const posts = await getPublishedPosts();

  return posts
    .flatMap((post) => post.data.tags || [])
    .reduce(
      (acc, tag) => {
        acc[tag] = (acc[tag] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );
}
