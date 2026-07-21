import { getTranslations, getLocale } from "next-intl/server";
import { getSettings } from "@/lib/queries/settings";
import { Link } from "@/i18n/navigation";
import { listNews } from "@/lib/queries/news";
import { formatDate } from "@/lib/format";
import { RouteLine } from "@/components/RouteLine";
import { localizeNewsList } from "@/lib/i18n/localizeNews";

export async function generateMetadata() {
  const t = await getTranslations("newsPage");
  const settings = await getSettings();
  return { title: `${t("title")} | ${settings.company_name}` };
}

export default async function NewsListPage() {
  const t = await getTranslations("newsPage");
  const locale = await getLocale();
  const rawPosts = await listNews(true);
  const posts = localizeNewsList(rawPosts, locale);
  return (
    <div className="mx-auto max-w-5xl px-5 py-16">
      <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-gold)]">{t("kicker")}</p>
      <h1 className="font-display text-4xl font-semibold text-[var(--color-jade-dark)]">{t("title")}</h1>
      <RouteLine className="my-6 h-5 w-52" />
      <div className="grid gap-6 sm:grid-cols-2">
        {posts.map((p) => (
          <Link
            key={p.id}
            href={`/news/${p.slug}`}
            className="overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] transition hover:shadow-lg"
          >
            {p.cover_image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={p.cover_image_url} alt={p.title} className="h-44 w-full object-cover" />
            )}
            <div className="p-5">
              <p className="text-xs text-[var(--color-muted)]">{formatDate(p.created_at)}</p>
              <h2 className="mt-1 font-display text-lg font-semibold text-[var(--color-jade-dark)]">{p.title}</h2>
              <p className="mt-2 line-clamp-2 text-sm text-[var(--color-muted)]">{p.excerpt}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
