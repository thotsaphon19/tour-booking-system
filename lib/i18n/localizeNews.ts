import type { NewsPost } from "@/lib/types";

function isTranslatableLocale(locale: string): locale is "th" | "en" | "fr" | "de" | "ja" {
  return locale === "th" || locale === "en" || locale === "fr" || locale === "de" || locale === "ja" || locale === "es";
}

export function localizeNews(post: NewsPost, locale: string): NewsPost {
  if (!isTranslatableLocale(locale)) return post;
  const tr = post.translations?.[locale];
  if (!tr) return post;
  return {
    ...post,
    title: tr.title?.trim() ? tr.title : post.title,
    excerpt: tr.excerpt?.trim() ? tr.excerpt : post.excerpt,
    content: tr.content?.trim() ? tr.content : post.content,
  };
}

export function localizeNewsList(posts: NewsPost[], locale: string): NewsPost[] {
  return posts.map((p) => localizeNews(p, locale));
}
