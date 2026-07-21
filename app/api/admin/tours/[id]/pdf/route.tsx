import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "@/lib/auth";
import { getTourById } from "@/lib/queries/tours";
import { getSettings } from "@/lib/queries/settings";
import { slugify, contentDispositionAttachment } from "@/lib/format";
import { toDataUri } from "@/lib/pdf/imageUtils";
import TourPdfDocument from "@/lib/pdf/TourPdfDocument";
import { isPdfLocale } from "@/lib/pdf/pdfTranslations";
import { localizeTour } from "@/lib/i18n/localizeTour";

// @react-pdf/renderer needs Node.js APIs (Buffer, etc.) that don't exist in
// the Edge runtime, and this response is always freshly generated from
// whatever is currently in the database — never statically cached.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "กรุณาเข้าสู่ระบบ" }, { status: 401 });
  }

  const { id: idParam } = await params;
  const id = Number(idParam);
  if (!Number.isInteger(id) || id <= 0) {
    return NextResponse.json({ error: "รหัสทัวร์ไม่ถูกต้อง" }, { status: 400 });
  }

  const langParam = req.nextUrl.searchParams.get("lang");
  const locale = isPdfLocale(langParam) ? langParam : "th";
  const fontParam = req.nextUrl.searchParams.get("font");
  const fontOverride = fontParam === "serif" || fontParam === "sans" ? fontParam : null;

  try {
    const tourRaw = await getTourById(id);
    if (!tourRaw) {
      return NextResponse.json({ error: "ไม่พบทัวร์นี้" }, { status: 404 });
    }
    // Swaps title/description/itinerary/hotel names/etc. for their `locale`
    // translation when the admin has entered one (same helper the public
    // website uses) — without this, only the PDF's section headings were
    // translated while the tour's own content stayed in whatever language
    // it was originally typed in.
    const tour = localizeTour(tourRaw, locale);

    const settings = await getSettings();
    const settingsForPdf = fontOverride ? { ...settings, pdf_font_style: fontOverride } : settings;

    // Cover/gallery/day-photo/hotel-image URLs may be relative paths from
    // the uploads API (e.g. "/api/uploads/12") — react-pdf runs
    // server-side with no browser origin to resolve them against, so build
    // one from the incoming request itself.
    const siteOrigin = `${req.nextUrl.protocol}//${req.headers.get("host")}`;

    const cache = new Map<string, string | undefined>();
    const [coverImage, logoImage, agentPhoto, gallery, itinerary, hotelList] = await Promise.all([
      toDataUri(tour.cover_image_url, siteOrigin, cache),
      toDataUri(settings.logo_url, siteOrigin, cache),
      toDataUri(tour.agent_photo_url, siteOrigin, cache),
      Promise.all(tour.gallery.map((src) => toDataUri(src, siteOrigin, cache))),
      Promise.all(
        tour.itinerary.map(async (day) => ({
          ...day,
          photos: day.photos?.[0] ? [(await toDataUri(day.photos[0], siteOrigin, cache)) || ""].filter(Boolean) : [],
        }))
      ),
      Promise.all(
        tour.hotel_list.map(async (h) => ({
          ...h,
          image: (await toDataUri(h.image, siteOrigin, cache)) || "",
        }))
      ),
    ]);

    const resolvedTour = {
      ...tour,
      cover_image_url: coverImage || null,
      agent_photo_url: agentPhoto || null,
      gallery: gallery.filter((g): g is string => Boolean(g)),
      itinerary,
      hotel_list: hotelList,
    };
    const resolvedSettings = { ...settingsForPdf, logo_url: logoImage || "" };

    const buffer = await renderToBuffer(<TourPdfDocument tour={resolvedTour} settings={resolvedSettings} locale={locale} />);
    const filename = `${slugify(tour.title) || "tour"}-${tour.id}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDispositionAttachment(filename),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[tour-pdf:error]", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "สร้าง PDF ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", detail }, { status: 500 });
  }
}
