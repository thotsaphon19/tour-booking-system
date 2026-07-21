import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { getSession } from "@/lib/auth";
import { getTourProposalById } from "@/lib/queries/tourProposals";
import { getSettings } from "@/lib/queries/settings";
import { slugify, contentDispositionAttachment } from "@/lib/format";
import { toDataUri } from "@/lib/pdf/imageUtils";
import ProposalPdfDocument from "@/lib/pdf/ProposalPdfDocument";
import { isPdfLocale } from "@/lib/pdf/pdfTranslations";

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
    return NextResponse.json({ error: "รหัสใบเสนอราคาไม่ถูกต้อง" }, { status: 400 });
  }

  const langParam = req.nextUrl.searchParams.get("lang");
  const locale = isPdfLocale(langParam) ? langParam : "th";
  const fontParam = req.nextUrl.searchParams.get("font");
  const fontOverride = fontParam === "serif" || fontParam === "sans" ? fontParam : null;

  try {
    const proposal = await getTourProposalById(id);
    if (!proposal) {
      return NextResponse.json({ error: "ไม่พบใบเสนอราคานี้" }, { status: 404 });
    }

    const settings = await getSettings();
    const settingsForPdf = fontOverride ? { ...settings, pdf_font_style: fontOverride } : settings;
    const siteOrigin = `${req.nextUrl.protocol}//${req.headers.get("host")}`;

    const cache = new Map<string, string | undefined>();
    const [coverImage, logoImage, agentPhoto, itinerary, hotelList] = await Promise.all([
      toDataUri(proposal.cover_image_url, siteOrigin, cache),
      toDataUri(settings.logo_url, siteOrigin, cache),
      toDataUri(proposal.agent_photo_url, siteOrigin, cache),
      Promise.all(
        proposal.itinerary.map(async (day) => ({
          ...day,
          photos: day.photos?.[0] ? [(await toDataUri(day.photos[0], siteOrigin, cache)) || ""].filter(Boolean) : [],
        }))
      ),
      Promise.all(
        proposal.hotel_list.map(async (h) => ({
          ...h,
          image: (await toDataUri(h.image, siteOrigin, cache)) || "",
        }))
      ),
    ]);

    const resolvedProposal = {
      ...proposal,
      cover_image_url: coverImage || null,
      agent_photo_url: agentPhoto || null,
      itinerary,
      hotel_list: hotelList,
    };
    const resolvedSettings = { ...settingsForPdf, logo_url: logoImage || "" };

    const buffer = await renderToBuffer(
      <ProposalPdfDocument proposal={resolvedProposal} settings={resolvedSettings} locale={locale} />
    );
    const filename = `${slugify(proposal.client_name) || "proposal"}-${proposal.id}.pdf`;

    return new NextResponse(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": contentDispositionAttachment(filename),
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[proposal-pdf:error]", err);
    const detail = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: "สร้าง PDF ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง", detail }, { status: 500 });
  }
}
