import { Document, Page, View, Text, Image, StyleSheet, Font } from "@react-pdf/renderer";
import type { TourProposal } from "@/lib/types";
import type { SiteSettings } from "@/lib/queries/settings";
import { NOTO_SANS_THAI_REGULAR_BASE64, NOTO_SANS_THAI_BOLD_BASE64 } from "@/lib/pdf/fontData";
import { getProposalPdfText, pdfDateLocaleTag, type PdfLocale } from "@/lib/pdf/pdfTranslations";
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

// "Times-Roman" is a react-pdf built-in standard font (no Font.register
// needed), used when the admin picks the "serif" PDF font style. It only
// covers Latin glyphs, so Thai and Japanese proposals always keep
// NotoSansThai regardless of this setting.
function resolveBodyFont(locale: PdfLocale, fontStyle: string | undefined): string {
  if (fontStyle === "serif" && locale !== "th" && locale !== "ja") return "Times-Roman";
  return "NotoSansThai";
}

const styles = StyleSheet.create({
  page: { fontFamily: "NotoSansThai", fontSize: 10, color: "#2b2b2b" },
  body: { padding: "0 36 50 36" },

  // Banner-style cover (not full-bleed photo) — deliberately different from
  // a hero-image cover.
  banner: { paddingHorizontal: 36, paddingVertical: 30 },
  bannerRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  bannerBrand: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1, maxWidth: "65%" },
  bannerLogo: { width: 26, height: 26, borderRadius: 13, flexShrink: 0 },
  bannerBrandText: { color: "#fff", fontSize: 12, fontWeight: "bold", flexShrink: 1 },
  kicker: { color: "#fff", fontSize: 9, fontWeight: "bold", letterSpacing: 1.5, textTransform: "uppercase", opacity: 0.85 },
  clientName: { color: "#fff", fontSize: 22, fontWeight: "bold", marginTop: 10 },
  dateLine: { color: "#fff", fontSize: 10, marginTop: 4, opacity: 0.9 },

  coverCard: { margin: 36, marginTop: -26, borderRadius: 10, overflow: "hidden", border: "1 solid #e4ddce" },
  coverImage: { width: "100%", height: 190, objectFit: "cover" },
  coverTitleBlock: { padding: 18 },
  coverTitle: { fontSize: 17, fontWeight: "bold" },
  coverSummary: { fontSize: 9.5, color: "#5c5c5c", marginTop: 6, lineHeight: 1.6 },

  statsRow: { flexDirection: "row", gap: 10, marginTop: 14 },
  statChip: { flex: 1, borderRadius: 8, padding: 10, backgroundColor: "#F6F3EA" },
  statLabel: { fontSize: 8, color: "#8a8374" },
  statValue: { fontSize: 12, fontWeight: "bold", marginTop: 2 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16, borderBottom: "1 solid #e4ddce", paddingBottom: 8, paddingTop: 24, paddingHorizontal: 36 },
  headerBrand: { fontSize: 9, fontWeight: "bold", flexShrink: 1, maxWidth: "55%" },
  headerRight: { fontSize: 8, color: "#8a8374", flexShrink: 0, maxWidth: "40%", textAlign: "right" },

  sectionKicker: { fontSize: 9, fontWeight: "bold", letterSpacing: 1, textTransform: "uppercase", marginBottom: 10 },

  // Timeline itinerary — a vertical line with numbered nodes, distinctly
  // different from a repeated photo-block layout.
  timelineRow: { flexDirection: "row", marginBottom: 4 },
  timelineRail: { width: 24, alignItems: "center" },
  timelineNode: { width: 20, height: 20, borderRadius: 10, alignItems: "center", justifyContent: "center", marginTop: 2 },
  timelineNodeText: { color: "#fff", fontSize: 9, fontWeight: "bold" },
  timelineLine: { width: 1, flex: 1, backgroundColor: "#dcd6c6", marginTop: 2 },
  timelineContent: { flex: 1, paddingLeft: 12, paddingBottom: 18 },
  dayHeaderRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  dayTitle: { fontSize: 11.5, fontWeight: "bold" },
  dayDate: { fontSize: 8.5, color: "#8a8374" },
  dayDesc: { fontSize: 9.5, lineHeight: 1.55, color: "#3d3d3d", marginTop: 4, marginBottom: 6 },
  dayThumb: { width: 74, height: 54, borderRadius: 6, objectFit: "cover", marginBottom: 6 },
  dayMetaRow: { flexDirection: "row", gap: 14, marginTop: 2 },
  dayMetaLabel: { fontSize: 8, color: "#8a8374" },
  dayMetaValue: { fontSize: 8.5, fontWeight: "bold" },

  hotelGrid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  hotelCard: { width: 150, marginBottom: 14 },
  hotelImg: { width: 150, height: 90, borderRadius: 8, objectFit: "cover", marginBottom: 6 },
  hotelDays: { fontSize: 8, color: "#8a8374", marginBottom: 2 },
  hotelCity: { fontSize: 8.5, color: "#8a8374" },
  hotelName: { fontSize: 10, fontWeight: "bold" },

  priceBox: { borderRadius: 10, padding: 18, marginBottom: 18 },
  priceLabel: { fontSize: 9, color: "#e8e2d2" },
  priceValue: { fontSize: 24, fontWeight: "bold", color: "#fff", marginTop: 4 },
  priceNote: { fontSize: 8.5, color: "#e8e2d2", marginTop: 4 },

  twoCol: { flexDirection: "row", gap: 20, marginBottom: 20 },
  col: { flex: 1 },
  listItem: { flexDirection: "row", fontSize: 9.5, marginBottom: 5, lineHeight: 1.4 },
  listBullet: { width: 12 },

  policyBlock: { marginBottom: 14 },
  policyTitle: { fontSize: 10.5, fontWeight: "bold", marginBottom: 3 },
  policyText: { fontSize: 9, lineHeight: 1.55, color: "#4a4a4a" },

  contactCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 10, padding: 16, marginTop: 6, backgroundColor: "#F6F3EA" },
  agentImg: { width: 50, height: 50, borderRadius: 25, objectFit: "cover" },
  agentName: { fontSize: 12, fontWeight: "bold" },
  agentRole: { fontSize: 9, color: "#8a8374" },

  footer: { position: "absolute", bottom: 20, left: 36, right: 36, flexDirection: "row", justifyContent: "space-between", fontSize: 8, color: "#a39c8c" },
});

function formatLocalizedDate(d: string | null | undefined, localeTag: string) {
  if (!d) return "";
  try {
    return new Date(d).toLocaleDateString(localeTag, { year: "numeric", month: "long", day: "numeric" });
  } catch {
    return d;
  }
}

export default function ProposalPdfDocument({
  proposal,
  settings,
  locale = "th",
}: {
  proposal: TourProposal;
  settings: SiteSettings;
  locale?: PdfLocale;
}) {
  const primary = settings.color_primary || "#0F4C42";
  const primaryDark = settings.color_primary_dark || "#0B332C";
  const accent = settings.color_accent || "#C9A227";
  const t = getProposalPdfText(locale);
  const bodyFont = resolveBodyFont(locale, settings.pdf_font_style);
  const pageStyle = [styles.page, { fontFamily: bodyFont }];
  const dateLocaleTag = pdfDateLocaleTag(locale);
  const today = formatLocalizedDate(new Date().toISOString(), dateLocaleTag);

  const mealLabel = (day: TourProposal["itinerary"][number]) => {
    const items: string[] = [];
    if (day.breakfast) items.push(t.breakfast);
    if (day.lunch) items.push(t.lunch);
    if (day.dinner) items.push(t.dinner);
    return items.join(" • ");
  };

  const PageFooter = () => (
    <View style={styles.footer} fixed>
      <Text>{settings.company_name}</Text>
      <Text render={({ pageNumber, totalPages }) => `${t.page} ${pageNumber}/${totalPages}`} />
    </View>
  );

  const PageHeader = () => (
    <View style={styles.header} fixed>
      <Text style={[styles.headerBrand, { color: primaryDark }]}>{settings.company_name}</Text>
      <Text style={styles.headerRight}>
        {proposal.proposal_code ? `${proposal.proposal_code} · ` : ""}
        {proposal.client_name}
      </Text>
    </View>
  );

  return (
    <Document title={`${t.kicker} - ${proposal.client_name}`} author={settings.company_name}>
      {/* Cover — banner header + inset card, not a full-bleed hero photo */}
      <Page size="A4" style={pageStyle}>
        <View style={[styles.banner, { backgroundColor: primaryDark }]}>
          <View style={styles.bannerRow}>
            <View style={styles.bannerBrand}>
              {settings.logo_url && <Image src={settings.logo_url} style={styles.bannerLogo} />}
              <Text style={styles.bannerBrandText}>{settings.company_name}</Text>
            </View>
            {proposal.proposal_code && <Text style={[styles.kicker, { opacity: 1 }]}>{proposal.proposal_code}</Text>}
          </View>
          <Text style={styles.kicker}>{t.kicker}</Text>
          <Text style={styles.clientName}>{t.preparedFor} {proposal.client_name}</Text>
          {(proposal.travel_start_date || proposal.travel_end_date) && (
            <Text style={styles.dateLine}>
              {t.travelDates}: {formatLocalizedDate(proposal.travel_start_date, dateLocaleTag)}
              {proposal.travel_end_date ? `  →  ${formatLocalizedDate(proposal.travel_end_date, dateLocaleTag)}` : ""}
            </Text>
          )}
        </View>

        <View style={styles.coverCard}>
          {proposal.cover_image_url && <Image src={proposal.cover_image_url} style={styles.coverImage} />}
          <View style={styles.coverTitleBlock}>
            <Text style={[styles.coverTitle, { color: primaryDark }]}>{proposal.title}</Text>
            {proposal.summary && <Text style={styles.coverSummary}>{proposal.summary}</Text>}

            <View style={styles.statsRow}>
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>ระยะเวลา</Text>
                <Text style={[styles.statValue, { color: primaryDark }]}>{proposal.duration_days} วัน</Text>
              </View>
              {proposal.group_size && (
                <View style={styles.statChip}>
                  <Text style={styles.statLabel}>{t.groupSize}</Text>
                  <Text style={[styles.statValue, { color: primaryDark }]}>{proposal.group_size}</Text>
                </View>
              )}
              <View style={styles.statChip}>
                <Text style={styles.statLabel}>{t.price}</Text>
                <Text style={[styles.statValue, { color: accent }]}>
                  {proposal.price_amount.toLocaleString(dateLocaleTag)} {proposal.currency}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <PageFooter />
      </Page>

      {/* Itinerary — vertical timeline */}
      <Page size="A4" style={pageStyle}>
        <PageHeader />
        <View style={styles.body}>
          <Text style={[styles.sectionKicker, { color: accent }]}>{t.itinerary}</Text>

          {proposal.itinerary.map((day, i) => {
            const isLast = i === proposal.itinerary.length - 1;
            const thumb = day.photos?.[0];
            return (
              <View key={i} style={styles.timelineRow} wrap={false}>
                <View style={styles.timelineRail}>
                  <View style={[styles.timelineNode, { backgroundColor: primary }]}>
                    <Text style={styles.timelineNodeText}>{day.day}</Text>
                  </View>
                  {!isLast && <View style={styles.timelineLine} />}
                </View>
                <View style={styles.timelineContent}>
                  <View style={styles.dayHeaderRow}>
                    <Text style={styles.dayTitle}>{day.title || `${t.day} ${day.day}`}</Text>
                    {day.date && <Text style={styles.dayDate}>{formatLocalizedDate(day.date, dateLocaleTag)}</Text>}
                  </View>
                  {thumb && <Image src={thumb} style={styles.dayThumb} />}
                  {day.description && <Text style={styles.dayDesc}>{day.description}</Text>}
                  <View style={styles.dayMetaRow}>
                    {mealLabel(day) && (
                      <View>
                        <Text style={styles.dayMetaLabel}>{t.meals}</Text>
                        <Text style={styles.dayMetaValue}>{mealLabel(day)}</Text>
                      </View>
                    )}
                    {day.accommodation && (
                      <View>
                        <Text style={styles.dayMetaLabel}>{t.stay}</Text>
                        <Text style={styles.dayMetaValue}>{day.accommodation}</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })}
        </View>
        <PageFooter />
      </Page>

      {/* Hotels */}
      {proposal.hotel_list.length > 0 && (
        <Page size="A4" style={pageStyle}>
          <PageHeader />
          <View style={styles.body}>
            <Text style={[styles.sectionKicker, { color: accent }]}>{t.hotels}</Text>
            <View style={styles.hotelGrid}>
              {proposal.hotel_list.map((h, i) => (
                <View key={i} style={styles.hotelCard} wrap={false}>
                  {h.image && <Image src={h.image} style={styles.hotelImg} />}
                  <Text style={styles.hotelDays}>{t.day} {h.days}</Text>
                  <Text style={styles.hotelCity}>{h.city}</Text>
                  <Text style={styles.hotelName}>
                    {h.name} {"★".repeat(Math.max(0, Math.min(5, Math.round(h.stars || 0))))}
                  </Text>
                </View>
              ))}
            </View>
          </View>
          <PageFooter />
        </Page>
      )}

      {/* Price + includes/excludes + policies + contact */}
      <Page size="A4" style={pageStyle}>
        <PageHeader />
        <View style={styles.body}>
          <View style={[styles.priceBox, { backgroundColor: primaryDark }]}>
            <Text style={styles.priceLabel}>{t.price} ({t.perProgram})</Text>
            <Text style={styles.priceValue}>
              {proposal.price_amount.toLocaleString(dateLocaleTag)} {proposal.currency}
            </Text>
            {proposal.group_size && <Text style={styles.priceNote}>{t.groupSize}: {proposal.group_size}</Text>}
          </View>

          <View style={styles.twoCol}>
            <View style={styles.col}>
              <Text style={styles.sectionKicker}>{t.included}</Text>
              {proposal.includes.map((i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.listBullet}>✓</Text>
                  <Text style={{ flex: 1 }}>{i}</Text>
                </View>
              ))}
            </View>
            <View style={styles.col}>
              <Text style={styles.sectionKicker}>{t.notIncluded}</Text>
              {proposal.excludes.map((i) => (
                <View key={i} style={styles.listItem}>
                  <Text style={styles.listBullet}>✕</Text>
                  <Text style={{ flex: 1 }}>{i}</Text>
                </View>
              ))}
            </View>
          </View>

          <Text style={[styles.sectionKicker, { color: accent }]}>{t.policies}</Text>
          {proposal.booking_policy && (
            <View style={styles.policyBlock}>
              <Text style={[styles.policyTitle, { color: primaryDark }]}>{t.bookingPolicy}</Text>
              <Text style={styles.policyText}>{proposal.booking_policy}</Text>
            </View>
          )}
          {proposal.payment_policy && (
            <View style={styles.policyBlock}>
              <Text style={[styles.policyTitle, { color: primaryDark }]}>{t.paymentPolicy}</Text>
              <Text style={styles.policyText}>{proposal.payment_policy}</Text>
            </View>
          )}
          {proposal.cancellation_policy && (
            <View style={styles.policyBlock}>
              <Text style={[styles.policyTitle, { color: primaryDark }]}>{t.cancellationPolicy}</Text>
              <Text style={styles.policyText}>{proposal.cancellation_policy}</Text>
            </View>
          )}
          {proposal.insurance_policy && (
            <View style={styles.policyBlock}>
              <Text style={[styles.policyTitle, { color: primaryDark }]}>{t.insurancePolicy}</Text>
              <Text style={styles.policyText}>{proposal.insurance_policy}</Text>
            </View>
          )}
          {proposal.visa_policy && (
            <View style={styles.policyBlock}>
              <Text style={[styles.policyTitle, { color: primaryDark }]}>{t.visaPolicy}</Text>
              <Text style={styles.policyText}>{proposal.visa_policy}</Text>
            </View>
          )}

          {(proposal.agent_name || proposal.agent_role) && (
            <>
              <Text style={[styles.sectionKicker, { color: accent, marginTop: 8 }]}>{t.contact}</Text>
              <View style={styles.contactCard}>
                {proposal.agent_photo_url && <Image src={proposal.agent_photo_url} style={styles.agentImg} />}
                <View>
                  {proposal.agent_name && <Text style={[styles.agentName, { color: primaryDark }]}>{proposal.agent_name}</Text>}
                  {proposal.agent_role && <Text style={styles.agentRole}>{proposal.agent_role}</Text>}
                </View>
              </View>
            </>
          )}

          <Text style={{ marginTop: 18, fontSize: 8, color: "#a39c8c" }}>
            {t.preparedOn} {today} · {settings.company_name}
            {proposal.status === "draft" ? ` · ${t.draft}` : ""}
          </Text>
        </View>
        <PageFooter />
      </Page>
    </Document>
  );
}
