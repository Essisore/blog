#!/usr/bin/env node

import { access, mkdir, writeFile } from "node:fs/promises";
import process from "node:process";
import { resolve } from "node:path";
import { createInterface } from "node:readline/promises";

const help = `快速创建博客文章

用法:
  npm run new
  npm run new -- "文章标题" --slug article-slug

选项:
  --title, -t        文章标题
  --slug, -s         文件名 slug（不含日期和扩展名）
  --description, -d  文章描述
  --tags             标签，使用英文逗号分隔
  --date             发布日期，格式为 YYYY-MM-DD（默认今天）
  --publish          创建为已发布文章（默认创建草稿）
  --mdx              创建 .mdx 文件（默认 .md）
  --help, -h         显示帮助
`;

function parseArgs(args) {
  const options = { draft: true, extension: "md" };
  const valueOptions = new Map([
    ["--title", "title"],
    ["-t", "title"],
    ["--slug", "slug"],
    ["-s", "slug"],
    ["--description", "description"],
    ["-d", "description"],
    ["--tags", "tags"],
    ["--date", "date"],
  ]);

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];

    if (argument === "--help" || argument === "-h") options.help = true;
    else if (argument === "--publish") options.draft = false;
    else if (argument === "--mdx") options.extension = "mdx";
    else if (valueOptions.has(argument)) {
      const value = args[index + 1];
      if (!value || value.startsWith("-")) {
        throw new Error(`${argument} 缺少参数值`);
      }
      options[valueOptions.get(argument)] = value;
      index += 1;
    } else if (argument.startsWith("-")) {
      throw new Error(`未知选项：${argument}`);
    } else if (!options.title) {
      options.title = argument;
    } else {
      throw new Error(`多余参数：${argument}`);
    }
  }

  return options;
}

function today() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function slugify(value) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function validateDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`日期格式无效：${value}，请使用 YYYY-MM-DD`);
  }

  const parsed = new Date(`${value}T00:00:00Z`);
  if (
    Number.isNaN(parsed.valueOf()) ||
    parsed.toISOString().slice(0, 10) !== value
  ) {
    throw new Error(`日期无效：${value}`);
  }
}

async function promptForMissing(options) {
  if (!process.stdin.isTTY) return options;

  const prompt = createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  try {
    options.title ||= (await prompt.question("标题: ")).trim();
    const suggestedSlug = slugify(options.title);
    if (!options.slug) {
      const label = suggestedSlug ? `Slug (${suggestedSlug}): ` : "Slug: ";
      options.slug = (await prompt.question(label)).trim() || suggestedSlug;
    }
    options.description ||=
      (await prompt.question(`描述 (${options.title}): `)).trim() ||
      options.title;
    if (options.tags === undefined) {
      options.tags = (
        await prompt.question("标签（英文逗号分隔，可留空）: ")
      ).trim();
    }
  } finally {
    prompt.close();
  }

  return options;
}

function yamlString(value) {
  return JSON.stringify(value);
}

async function exists(path) {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const parsedOptions = parseArgs(process.argv.slice(2));

  if (parsedOptions.help) {
    console.log(help);
    return;
  }

  const options = await promptForMissing(parsedOptions);

  if (!options.title?.trim()) throw new Error("文章标题不能为空");
  options.slug ||= slugify(options.title);
  if (!options.slug) throw new Error("无法从标题生成 slug，请使用 --slug 指定");
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(options.slug)) {
    throw new Error("slug 只能包含小写字母、数字和单个连字符");
  }

  options.date ||= today();
  options.description ||= options.title;
  validateDate(options.date);

  const tags = (options.tags ?? "")
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  const postsDirectory = resolve("src/content/posts");
  const filename = `${options.date}-${options.slug}.${options.extension}`;
  const outputPath = resolve(postsDirectory, filename);

  if (await exists(outputPath)) {
    throw new Error(`文件已存在：${outputPath}`);
  }

  const frontmatter = [
    "---",
    `title: ${yamlString(options.title.trim())}`,
    `description: ${yamlString(options.description.trim())}`,
    `date: ${yamlString(options.date)}`,
    `tags: [${tags.map(yamlString).join(", ")}]`,
    ...(options.draft ? ["draft: true"] : []),
    "---",
    "",
    "在这里开始写作。",
    "",
  ].join("\n");

  await mkdir(postsDirectory, { recursive: true });
  await writeFile(outputPath, frontmatter, { encoding: "utf8", flag: "wx" });
  console.log(`已创建：${outputPath}`);
}

main().catch((error) => {
  console.error(`创建失败：${error.message}`);
  process.exitCode = 1;
});
