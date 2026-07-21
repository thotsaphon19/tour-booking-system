/**
 * react-pdf resolves <Image src="..."> by guessing the format from the
 * URL's file extension. That fails silently (image just doesn't render,
 * with only a console warning) for any URL without a recognizable
 * extension — which includes every Unsplash URL used in this codebase's
 * seed data (they end in query params, not .jpg/.png) and every image
 * served from this app's own /api/uploads/{id} route.
 *
 * The reliable fix is to fetch the bytes ourselves and hand react-pdf a
 * `data:` URI with an explicit mime type instead of a bare URL.
 */

const FETCH_TIMEOUT_MS = 8000;
const MAX_IMAGE_BYTES = 15 * 1024 * 1024; // 15MB — generous, but bounded

export async function toDataUri(
  url: string | null | undefined,
  siteOrigin: string,
  cache: Map<string, string | undefined>
): Promise<string | undefined> {
  if (!url) return undefined;
  const absolute = /^https?:\/\//.test(url) ? url : `${siteOrigin}${url}`;

  if (cache.has(absolute)) return cache.get(absolute);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  try {
    const res = await fetch(absolute, { signal: controller.signal });
    if (!res.ok) {
      cache.set(absolute, undefined);
      return undefined;
    }

    // A dead/moved image link often 200s with an HTML error page instead of
    // failing outright. Handing that to react-pdf's <Image> as if it were
    // image bytes throws deep inside its decoder and takes the *entire*
    // PDF down — one bad photo on one day of one tour would break every
    // download. Refusing anything that isn't actually image/* up front
    // means a bad image is just silently omitted instead.
    const contentType = res.headers.get("content-type") || "";
    if (!contentType.startsWith("image/")) {
      cache.set(absolute, undefined);
      return undefined;
    }

    const contentLength = Number(res.headers.get("content-length") || 0);
    if (contentLength > MAX_IMAGE_BYTES) {
      cache.set(absolute, undefined);
      return undefined;
    }

    const arrayBuffer = await res.arrayBuffer();
    if (arrayBuffer.byteLength === 0 || arrayBuffer.byteLength > MAX_IMAGE_BYTES) {
      cache.set(absolute, undefined);
      return undefined;
    }

    const buffer = Buffer.from(arrayBuffer);
    const dataUri = `data:${contentType};base64,${buffer.toString("base64")}`;
    cache.set(absolute, dataUri);
    return dataUri;
  } catch {
    // Covers network errors, DNS failures, and the abort from the timeout
    // above — every case just means "no image", never a crash.
    cache.set(absolute, undefined);
    return undefined;
  } finally {
    clearTimeout(timeout);
  }
}
