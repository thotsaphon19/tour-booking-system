import { extractYoutubeId } from "@/lib/youtube";

export default function YoutubeEmbed({ url, title }: { url: string; title: string }) {
  const videoId = extractYoutubeId(url);

  // Fall back to a plain external link if the URL isn't a recognizable
  // YouTube link, so admins can still paste other video links safely.
  if (!videoId) {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-jade)] hover:bg-[var(--color-jade)]/5"
      >
        {title}
      </a>
    );
  }

  return (
    <div className="aspect-video w-full overflow-hidden rounded-2xl border border-[var(--color-border)]">
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={title}
        className="h-full w-full"
        style={{ border: 0 }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        loading="lazy"
      />
    </div>
  );
}
