import type { SiteSettings } from "@/lib/queries/settings";
import { lighten, darken } from "@/lib/color";

/**
 * Builds a CSS string that overrides the site's design-token variables
 * (defined in app/globals.css) with the colors an admin picked in
 * Settings → Appearance. The variable *names* stay the same throughout the
 * codebase (--color-jade, --color-gold, etc.) — only what they resolve to
 * changes, so no component code needs to change when the palette does.
 */
export function buildThemeCss(settings: SiteSettings): string {
  const primary = settings.color_primary;
  const primaryDark = settings.color_primary_dark;
  const primaryLight = lighten(primary, 0.18);
  const accent = settings.color_accent;
  const accentLight = lighten(accent, 0.22);
  const clay = darken(accent, 0.15);

  return `:root {
  --color-sand: ${settings.color_bg};
  --color-surface: ${settings.color_surface};
  --color-ink: ${settings.color_ink};
  --color-ink-soft: ${lighten(settings.color_ink, 0.25)};
  --color-muted: ${lighten(settings.color_ink, 0.5)};
  --color-border: ${lighten(settings.color_ink, 0.85)};
  --color-jade: ${primary};
  --color-jade-light: ${primaryLight};
  --color-jade-dark: ${primaryDark};
  --color-gold: ${accent};
  --color-gold-light: ${accentLight};
  --color-clay: ${clay};
}`;
}

/**
 * The admin dashboard used to be themed with the same `buildThemeCss(settings)`
 * as the public website — so picking a new brand color in Settings instantly
 * re-colored the entire admin panel (sidebar, buttons, every page) around the
 * admin as they were editing it, which looked like "changing color broke
 * everything" rather than a scoped preview of the public site.
 *
 * The admin UI now always uses this fixed palette (the same values as the
 * site's own defaults in app/globals.css) regardless of what an admin sets
 * for the public-facing website. Every admin component still references the
 * same CSS variable names (--color-jade, --color-gold, etc.), so nothing
 * else needed to change — only what those variables resolve to inside the
 * admin section.
 */
export const ADMIN_THEME_CSS = `:root {
  --color-sand: #ffffff;
  --color-surface: #ffffff;
  --color-ink: #16324a;
  --color-ink-soft: #3f5a70;
  --color-muted: #7c93a3;
  --color-border: #e1eaf0;
  --color-jade: #1b4965;
  --color-jade-light: #3d729a;
  --color-jade-dark: #0d2b3f;
  --color-gold: #4fa8c9;
  --color-gold-light: #79c0dc;
  --color-clay: #357e9c;
}`;
