import { notFound } from "next/navigation";
import { getLocale } from "next-intl/server";
import { getNewsBySlug } from "@/lib/queries/news";
import { formatDate } from "@/lib/format";
import { localizeNews } from "@/lib/i18n/localizeNews";

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const rawPost = await getNewsBySlug(slug);
  if (!rawPost || !rawPost.published) notFound();
  const locale = await getLocale();
  const post = localizeNews(rawPost, locale);

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <p className="text-xs text-[var(--color-muted)]">{formatDate(post.created_at)}</p>
      <h1 className="mt-2 font-display text-4xl font-semibold text-[var(--color-jade-dark)]">{post.title}</h1>
      {post.cover_image_url && (
        <img src={post.cover_image_url} alt={post.title} className="mt-6 h-72 w-full rounded-2xl object-cover" />
      )}
      <div className="prose prose-neutral mt-8 max-w-none whitespace-pre-line text-[var(--color-ink-soft)]">
        {post.content}
      </div>
    </article>
  );
}
