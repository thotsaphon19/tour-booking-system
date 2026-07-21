// Next.js shows this INSTANTLY the moment navigation starts, before the
// destination page's data (settings, tours, etc. from the database) has
// even started loading — this is what was missing before. Without a
// loading.tsx here, clicking a language card (or any link into the site)
// left the browser showing the old page with zero feedback until the new
// page's server-side data fetching finished, which felt like the click
// "did nothing" for a beat. This file is what makes the transition feel
// instant instead.
//
// Keep this file simple and free of any data fetching — its only job is to
// render immediately with no dependencies, so it can't itself become slow.
export default function LocaleLoading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-[var(--color-sand)]">
      <div className="relative h-12 w-12">
        <span className="absolute inset-0 animate-ping rounded-full bg-[var(--color-jade)]/30" />
        <span className="absolute inset-1.5 rounded-full bg-[var(--color-jade)]" />
      </div>
      <p className="text-sm text-[var(--color-muted)]">กำลังโหลด...</p>
    </div>
  );
}
