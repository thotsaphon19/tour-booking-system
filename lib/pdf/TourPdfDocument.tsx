import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import type { Tour } from "@/lib/types";
import type { SiteSettings } from "@/lib/queries/settings";
import { NOTO_SANS_THAI_REGULAR_BASE64, NOTO_SANS_THAI_BOLD_BASE64 } from "@/lib/pdf/fontData";
import { getTourPdfText, pdfDateLocaleTag, type PdfLocale } from "@/lib/pdf/pdfTranslations";
import { thaiSafeHyphenation } from "@/lib/pdf/thaiHyphenation";

Font.register({
  family: "NotoSansThai",
  fonts: [
    { src: `data:font/woff;base64,${NOTO_SANS_THAI_REGULAR_BASE64}`, fontWeight: "normal" },
    { src: `data:font/woff;base64,${NOTO_SANS_THAI_BOLD_BASE64}`, fontWeight: "bold" },
  ],
});
// Wraps Thai text safely — see lib/pdf/thaiHyphenation.ts for why this is
// needed (Thai has no spaces, and react-pdf's default fallback line-break
// can split a tone/vowel mark away from its base character otherwise).
Font.registerHyphenationCallback(thaiSafeHyphenation);

// "Times-Roman" below is one of react-pdf's built-in standard fonts (no
// Font.register needed) — used when the admin picks the "serif" PDF font
// style. It only has Latin glyphs, so it's only applied for Latin-script
// languages; Thai and Japanese always render with NotoSansThai regardless
// of this setting, since that's the only font with those glyphs embedded.
function resolveBodyFont(locale: PdfLocale, fontStyle: string | undefined): string {
  if (fontStyle === "serif" && locale !== "th" && locale !== "ja") return "Times-Roman";
  return "NotoSansThai";
}

/** Appends an alpha suffix to a hex color for a tinted background — but
 *  falls back to a safe default if the color isn't actually a 6-digit hex
 *  (the admin settings color fields are free-text, so a stray manual edit
 *  like "gold" instead of "#C9A227" shouldn't break PDF rendering). */
function tint(hex: string, alphaHex: string): string {
  return /^#[0-9a-fA-F]{6}$/.test(hex) ? `${hex}${alphaHex}` : `#C9A22722`;
}

const styles = StyleSheet.create({
  page: { fontFamily: "NotoSansThai", fontSize: 10, color: "#2b2b2b" },
  coverImage: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" },
  coverOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "#0b2a24", opacity: 0.45 },
  coverContent: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 36 },
  coverBadgeRow: { flexDirection: "row", gap: 6, marginBottom: 10 },
  coverBadge: { backgroundColor: "rgba(255,255,255,0.22)", color: "#fff", fontSize: 9, paddingVertical: 4, paddingHorizontal: 9, borderRadius: 99 },
  coverTitle: { color: "#ffffff", fontSize: 26, fontWeight: "bold", lineHeight: 1.3 },
  coverSub: { color: "#f2ead9", fontSize: 11, marginTop: 6 },
  logoRow: { position: "absolute", top: 28, left: 36, flexDirection: "row", alignItems: "center", gap: 8 },
  logoImg: { width: 30, height: 30, borderRadius: 15 },
  logoText: { color: "#fff", fontSize: 13, fontWeight: "bold" },

  body: { padding: "34 36 50 36" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18, borderBottom: "1 solid #e4ddce", paddingBottom: 10, paddingHorizontal: 36 },
  headerBrand: { fontSize: 10, fontWeight: "bold", flexShrink: 1, maxWidth: "50%" },
  headerTour: { fontSize: 9, color: "#8a8374", flexShrink: 1, maxWidth: "45%", textAlign: "right" },

  kicker: { fontSize: 9, fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 4 },
  h1: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  h2: { fontSize: 13, fontWeight: "bold", marginBottom: 8 },
  paragraph: { fontSize: 10, lineHeight: 1.6, color: "#3d3d3d", marginBottom: 10 },

  chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginBottom: 6 },
  chip: { fontSize: 9, borderRadius: 99, paddingVertical: 4, paddingHorizontal: 9 },

  dayCard: { flexDirection: "row", gap: 14, marginBottom: 18 },
  dayBadge: { width: 26, height: 26, borderRadius: 13, alignItems: "center", justifyContent: "center", marginRight: 2 },
  dayBadgeText: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  dayImage: { width: 130, height: 90, borderRadius: 8, objectFit: "cover" },
  dayTitle: { fontSize: 12, fontWeight: "bold", marginBottom: 4 },
  dayDesc: { fontSize: 9.5, lineHeight: 1.55, color: "#3d3d3d", marginBottom: 6 },
  mealRow: { flexDirection: "row", gap: 10 },
  mealText: { fontSize: 8.5, color: "#6b6b6b" },

  hotelGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  hotelCard: { width: 150, marginBottom: 14 },
  hotelImg: { width: 150, height: 90, borderRadius: 8, objectFit: "cover", marginBottom: 6 },
  hotelDays: { fontSize: 8, color: "#8a8374", marginBottom: 2 },
  hotelCity: { fontSize: 8.5, color: "#8a8374" },
  hotelName: { fontSize: 10, fontWeight: "bold" },

  table: { borderRadius: 8, overflow: "hidden", marginBottom: 20 },
  tableHeadRow: { flexDirection: "row" },
  tableHeadCell: { flex: 1, padding: 8, color: "#fff", fontSize: 9, fontWeight: "bold" },
  tableRow: { flexDirection: "row", borderBottom: "1 solid #ece6d8" },
  tableCell: { flex: 1, padding: 8, fontSize: 9.5 },

  twoCol: { flexDirection: "row", gap: 20 },
  col: { flex: 1 },
  listItem: { flexDirection: "row", fontSize: 9.5, marginBottom: 5, lineHeight: 1.4 },
  listBullet: { width: 12 },

  footer: { position: "absolute", bottom: 20, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#a39c8c" },

  contactCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 10, padding: 16, marginTop: 6 },
  agentImg: { width: 52, height: 52, borderRadius: 26, objectFit: "cover" },
  agentName: { fontSize: 12, fontWeight: "bold", color: "#fff" },
  agentRole: { fontSize: 9, color: "#e8e2d2" },
  contactLine: { fontSize: 10, color: "#3d3d3d", marginBottom: 4 },
});

export default function TourPdfDocument({
  tour,
  settings,
  locale = "th",
}: {
  tour: Tour;
  settings: SiteSettings;
  locale?: PdfLocale;
}) {
  const primary = settings.color_primary || "#0F4C42";
  const primaryDark = settings.color_primary_dark || "#0B332C";
  const accent = settings.color_accent || "#C9A227";
  const t = getTourPdfText(locale);
  const bodyFont = resolveBodyFont(locale, settings.pdf_font_style);
  const pageStyle = [styles.page, { fontFamily: bodyFont }];

  const cover = tour.cover_image_url || undefined;
  const logo = settings.logo_url || undefined;
  const today = new Date().toLocaleDateString(pdfDateLocaleTag(locale), { year: "numeric", month: "long", day: "numeric" });

  const mealLabel = (day: Tour["itinerary"][number]) => {
    const items: string[] = [];
    if (day.breakfast) items.push(t.breakfast);
    if (day.lunch) items.push(t.lunch);
    if (day.dinner) items.push(t.dinner);
    return items.length ? items.join(" • ") : "";
  };

  const PageFooter = () => (
    <View style={styles.footer} fixed>
      <Text>{settings.company_name}</Text>
      <Text render={({ pageNumber, totalPages }) => `${t.page} ${pageNumber}/${totalPages}`} />
    </View>
  );

  const PageHeader = () => (
    <View style={styles.header} fixed>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1, maxWidth: "50%" }}>
        {logo && <Image src={logo} style={{ width: 18, height: 18, borderRadius: 9, flexShrink: 0 }} />}
        <Text style={[styles.headerBrand, { color: primaryDark, maxWidth: "100%" }]}>{settings.company_name}</Text>
      </View>
      <Text style={styles.headerTour}>
        {tour.title} {tour.tour_code ? `· ${t.tourCode} ${tour.tour_code}` : ""}
      </Text>
    </View>
  );

  return (
    <Document title={tour.title} author={settings.company_name}>
      {/* Cover page */}
      <Page size="A4" style={pageStyle}>
        {cover && <Image src={cover} style={styles.coverImage} />}
        <View style={styles.coverOverlay} />
        <View style={styles.logoRow}>
          {logo && <Image src={logo} style={styles.logoImg} />}
          <Text style={styles.logoText}>{settings.company_name}</Text>
        </View>
        <View style={styles.coverContent}>
          <View style={styles.coverBadgeRow}>
            {tour.tour_code && <Text style={styles.coverBadge}>{tour.tour_code}</Text>}
            <Text style={styles.coverBadge}>{tour.province}</Text>
            <Text style={styles.coverBadge}>{t.daysNights(tour.duration_days)}</Text>
          </View>
          <Text style={styles.coverTitle}>{tour.title}</Text>
          <Text style={styles.coverSub}>{tour.summary}</Text>
        </View>
      </Page>

      {/* Overview page */}
      <Page size="A4" style={pageStyle}>
        <PageHeader />
        <View style={styles.body}>
          <Text style={[styles.kicker, { color: accent }]}>{t.overview}</Text>
          <Text style={[styles.h1, { color: primaryDark }]}>{tour.title}</Text>
          <Text style={styles.paragraph}>{tour.description}</Text>

          {tour.highlights.length > 0 && (
            <View style={{ marginTop: 6, marginBottom: 16 }}>
              <Text style={styles.h2}>{t.highlights}</Text>
              <View style={styles.chipsRow}>
                {tour.highlights.map((h) => (
                  <Text key={h} style={[styles.chip, { backgroundColor: tint(accent, "22"), color: primaryDark }]}>
                    ✦ {h}
                  </Text>
                ))}
              </View>
            </View>
          )}

          {tour.gallery.length > 0 && (
            <View style={{ flexDirection: "row", gap: 8, marginTop: 10 }}>
              {tour.gallery.slice(0, 3).map((src) => {
                const url = src;
                return url ? <Image key={src} src={url} style={{ flex: 1, height: 110, borderRadius: 8, objectFit: "cover" }} /> : null;
              })}
            </View>
          )}
        </View>
        <PageFooter />
      </Page>

      {/* Itinerary pages */}
      <Page size="A4" style={pageStyle}>
        <PageHeader />
        <View style={styles.body}>
          <Text style={[styles.kicker, { color: accent }]}>{t.itinerary}</Text>
          <Text style={[styles.h1, { color: primaryDark, marginBottom: 16 }]}>{t.daysNights(tour.duration_days)}</Text>

          {tour.itinerary.map((day) => {
            const photo = day.photos?.[0];
            return (
              <View key={day.day} style={styles.dayCard} wrap={false}>
                {photo && <Image src={photo} style={styles.dayImage} />}
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 }}>
                    <View style={[styles.dayBadge, { backgroundColor: primary }]}>
                      <Text style={styles.dayBadgeText}>{day.day}</Text>
                    </View>
                    <Text style={styles.dayTitle}>
                      {t.day} {day.day} — {day.title}
                    </Text>
                  </View>
                  <Text style={styles.dayDesc}>{day.description}</Text>
                  <View style={styles.mealRow}>
                    {mealLabel(day) && <Text style={styles.mealText}>{mealLabel(day)}</Text>}
                    {day.accommodation && (
                      <Text style={styles.mealText}>
                        {t.accommodation}: {day.accommodation}
                      </Text>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        <PageFooter />
      </Page>

      {/* Hotels page */}
      {tour.hotel_list.length > 0 && (
        <Page size="A4" style={pageStyle}>
          <PageHeader />
          <View style={styles.body}>
            <Text style={[styles.kicker, { color: accent }]}>{t.hotels}</Text>
            <Text style={[styles.h1, { color: primaryDark, marginBottom: 16 }]}>{t.hotels}</Text>
            {tour.hotel_description && <Text style={styles.paragraph}>{tour.hotel_description}</Text>}
            <View style={styles.hotelGrid}>
              {tour.hotel_list.map((h, i) => {
                const img = h.image;
                return (
                  <View key={i} style={styles.hotelCard} wrap={false}>
                    {img && <Image src={img} style={styles.hotelImg} />}
                    <Text style={styles.hotelDays}>
                      {t.day} {h.days}
                    </Text>
                    <Text style={styles.hotelCity}>{h.city}</Text>
                    <Text style={styles.hotelName}>
                      {h.name} {"★".repeat(Math.max(0, Math.min(5, Math.round(h.stars || 0))))}
                    </Text>
                  </View>
                );
              })}
            </View>
          </View>
          <PageFooter />
        </Page>
      )}

      {/* Pricing + includes/excludes + contact page */}
      <Page size="A4" style={pageStyle}>
        <PageHeader />
        <View style={styles.body}>
          <Text style={[styles.kicker, { color: accent }]}>{t.pricing}</Text>
          <Text style={[styles.h1, { color: primaryDark, marginBottom: 14 }]}>{t.pricing}</Text>

          {tour.price_tiers.length > 0 && (
            <View style={styles.table}>
              <View style={[styles.tableHeadRow, { backgroundColor: primaryDark }]}>
                <Text style={styles.tableHeadCell}>{t.groupSize}</Text>
                <Text style={styles.tableHeadCell}>{t.pricePerPerson}</Text>
              </View>
              {tour.price_tiers.map((tier, i) => (
                <View key={i} style={styles.tableRow}>
                  <Text style={styles.tableCell}>
                    {tier.groupSize} {t.people}
                  </Text>
                  <Text style={[styles.tableCell, { fontWeight: "bold" }]}>
                    {tier.pricePerPerson.toLocaleString("th-TH")} {tour.currency}
                  </Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Text style={styles.h2}>{t.included}</Text>
              {tour.includes.map((i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.listBullet}>✓</Text>
                  <Text style={{ flex: 1 }}>{i}</Text>
                </View>
              ))}
            </View>
            <View style={styles.col}>
              <Text style={styles.h2}>{t.notIncluded}</Text>
              {tour.excludes.map((i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.listBullet}>✕</Text>
                  <Text style={{ flex: 1 }}>{i}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={[styles.h2, { marginTop: 22 }]}>{t.contactTitle}</Text>
          <View style={[styles.contactCard, { backgroundColor: primaryDark }]}>
            {tour.agent_photo_url && <Image src={tour.agent_photo_url} style={styles.agentImg} />}
            <View>
              {tour.agent_name && <Text style={styles.agentName}>{tour.agent_name}</Text>}
              {tour.agent_role && <Text style={styles.agentRole}>{tour.agent_role}</Text>}
            </View>
          </View>
          <View style={{ marginTop: 12 }}>
            {settings.contact_phone && <Text style={styles.contactLine}>โทร: {settings.contact_phone}</Text>}
            {settings.contact_email && <Text style={styles.contactLine}>อีเมล: {settings.contact_email}</Text>}
            {settings.whatsapp_number && <Text style={styles.contactLine}>WhatsApp: {settings.whatsapp_number}</Text>}
          </View>

          <Text style={{ marginTop: 20, fontSize: 8, color: "#a39c8c" }}>
            {t.generatedOn} {today} · {t.preparedBy} {settings.company_name}
          </Text>
        </View>
        <PageFooter />
      </Page>
    </Document>
  );
}
