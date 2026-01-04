import { defineCollection, z } from "astro:content";
import { AUTHOR } from "../consts";

const posts = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string().min(1, "标题不能为空"),
      description: z.string().min(1, "描述不能为空"),
      date: z.coerce.date(),
      image: image().optional(),
      tags: z.array(z.string()).default([]).optional(),
      draft: z.boolean().default(false).optional(),
      author: z.string().default(AUTHOR.name).optional(),
    }),
});

export const collections = { posts };
