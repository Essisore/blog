// @ts-check
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import rehypeKatex from "rehype-katex";
import rehypeMermaid from "rehype-mermaid";
import remarkMath from "remark-math";
import { SITE_URL } from "./src/consts";

// https://astro.build/config
export default defineConfig({
  site: SITE_URL,
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.includes("/draft/"),
    }),
    tailwind({
      applyBaseStyles: false,
    }),
  ],
  markdown: {
    remarkPlugins: [remarkMath],
    rehypePlugins: [
      rehypeKatex,
      [
        rehypeMermaid,
        {
          strategy: "img-svg",
          colorScheme: "light",
          mermaidConfig: {
            securityLevel: "strict",
            theme: "default",
          },
          dark: {
            securityLevel: "strict",
            theme: "dark",
          },
        },
      ],
    ],
    syntaxHighlight: {
      type: "shiki",
      excludeLangs: ["math", "mermaid"],
    },
    shikiConfig: {
      themes: {
        light: "catppuccin-latte",
        dark: "catppuccin-mocha",
      },
      wrap: true,
    },
  },
  prefetch: {
    prefetchAll: true,
    defaultStrategy: "viewport",
  },
  build: {
    inlineStylesheets: "auto",
  },
});
