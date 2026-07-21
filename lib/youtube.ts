/** Extracts the video ID from common YouTube URL formats, or null if not recognized. */
export function extractYoutubeId(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes("youtu.be")) {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.includes("youtube.com")) {
      if (parsed.pathname === "/watch") return parsed.searchParams.get("v");
      if (parsed.pathname.startsWith("/embed/")) return parsed.pathname.split("/embed/")[1] || null;
      if (parsed.pathname.startsWith("/shorts/")) return parsed.pathname.split("/shorts/")[1] || null;
    }
    return null;
  } catch {
    return null;
  }
}
