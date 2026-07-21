// -----------------------------------------------------------------------------
// PDF label translations
// -----------------------------------------------------------------------------
// The headings/labels printed on the Tour brochure PDF and the Proposal
// (quotation) PDF used to be hardcoded in Thai. This file adds every
// supported site language so the PDF can be printed/downloaded in the
// client's language via `?lang=` on the PDF routes.
//
// To add a new language later: add its code to PDF_LOCALES, give it a label
// in PDF_LOCALE_LABELS, and add matching entries to tourPdfText and
// proposalPdfText below.
// -----------------------------------------------------------------------------

export const PDF_LOCALES = ["th", "en", "fr", "de", "es", "ja"] as const;
export type PdfLocale = (typeof PDF_LOCALES)[number];

export const PDF_LOCALE_LABELS: Record<PdfLocale, string> = {
  th: "ไทย",
  en: "English",
  fr: "Français",
  de: "Deutsch",
  es: "Español",
  ja: "日本語",
};

export function isPdfLocale(value: string | null | undefined): value is PdfLocale {
  return !!value && (PDF_LOCALES as readonly string[]).includes(value);
}

/** BCP-47 tag used for date formatting / number formatting per PDF locale. */
export function pdfDateLocaleTag(locale: PdfLocale): string {
  switch (locale) {
    case "th":
      return "th-TH-u-ca-buddhist";
    case "en":
      return "en-US";
    case "fr":
      return "fr-FR";
    case "de":
      return "de-DE";
    case "es":
      return "es-ES";
    case "ja":
      return "ja-JP";
  }
}

interface TourPdfText {
  daysNights: (d: number) => string;
  overview: string;
  highlights: string;
  itinerary: string;
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  accommodation: string;
  hotels: string;
  pricing: string;
  groupSize: string;
  pricePerPerson: string;
  people: string;
  included: string;
  notIncluded: string;
  contactTitle: string;
  preparedBy: string;
  generatedOn: string;
  tourCode: string;
  page: string;
}

export const tourPdfText: Record<PdfLocale, TourPdfText> = {
  th: {
    daysNights: (d) => `${d} วัน ${Math.max(d - 1, 0)} คืน`,
    overview: "ภาพรวมทริป",
    highlights: "จุดเด่นของทริป",
    itinerary: "กำหนดการเดินทาง",
    day: "วันที่",
    breakfast: "เช้า",
    lunch: "กลางวัน",
    dinner: "เย็น",
    accommodation: "ที่พัก",
    hotels: "ที่พักตลอดทริป",
    pricing: "อัตราค่าบริการ",
    groupSize: "ขนาดกลุ่ม",
    pricePerPerson: "ราคา/ท่าน",
    people: "ท่าน",
    included: "ราคานี้รวม",
    notIncluded: "ราคานี้ไม่รวม",
    contactTitle: "สนใจทริปนี้ ติดต่อเราได้เลย",
    preparedBy: "จัดทำโดย",
    generatedOn: "จัดทำเอกสารเมื่อ",
    tourCode: "รหัสทัวร์",
    page: "หน้า",
  },
  en: {
    daysNights: (d) => `${d} Days ${Math.max(d - 1, 0)} Nights`,
    overview: "Trip Overview",
    highlights: "Trip Highlights",
    itinerary: "Itinerary",
    day: "Day",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    accommodation: "Accommodation",
    hotels: "Hotels Throughout the Trip",
    pricing: "Pricing",
    groupSize: "Group Size",
    pricePerPerson: "Price / Person",
    people: "people",
    included: "Included",
    notIncluded: "Not Included",
    contactTitle: "Interested in this trip? Get in touch",
    preparedBy: "Prepared by",
    generatedOn: "Generated on",
    tourCode: "Tour Code",
    page: "Page",
  },
  fr: {
    daysNights: (d) => `${d} jours ${Math.max(d - 1, 0)} nuits`,
    overview: "Aperçu du voyage",
    highlights: "Points forts du voyage",
    itinerary: "Itinéraire",
    day: "Jour",
    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner",
    dinner: "Dîner",
    accommodation: "Hébergement",
    hotels: "Hôtels pendant le voyage",
    pricing: "Tarifs",
    groupSize: "Taille du groupe",
    pricePerPerson: "Prix / personne",
    people: "personnes",
    included: "Inclus",
    notIncluded: "Non inclus",
    contactTitle: "Intéressé par ce voyage ? Contactez-nous",
    preparedBy: "Préparé par",
    generatedOn: "Généré le",
    tourCode: "Code du circuit",
    page: "Page",
  },
  de: {
    daysNights: (d) => `${d} Tage ${Math.max(d - 1, 0)} Nächte`,
    overview: "Reiseübersicht",
    highlights: "Reise-Highlights",
    itinerary: "Reiseverlauf",
    day: "Tag",
    breakfast: "Frühstück",
    lunch: "Mittagessen",
    dinner: "Abendessen",
    accommodation: "Unterkunft",
    hotels: "Hotels während der Reise",
    pricing: "Preise",
    groupSize: "Gruppengröße",
    pricePerPerson: "Preis / Person",
    people: "Personen",
    included: "Inklusive",
    notIncluded: "Nicht inklusive",
    contactTitle: "Interesse an dieser Reise? Kontaktieren Sie uns",
    preparedBy: "Erstellt von",
    generatedOn: "Erstellt am",
    tourCode: "Tour-Code",
    page: "Seite",
  },
  es: {
    daysNights: (d) => `${d} días ${Math.max(d - 1, 0)} noches`,
    overview: "Resumen del Viaje",
    highlights: "Puntos Destacados",
    itinerary: "Itinerario",
    day: "Día",
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
    accommodation: "Alojamiento",
    hotels: "Hoteles Durante el Viaje",
    pricing: "Precios",
    groupSize: "Tamaño del Grupo",
    pricePerPerson: "Precio / Persona",
    people: "personas",
    included: "Incluido",
    notIncluded: "No Incluido",
    contactTitle: "¿Interesado en este viaje? Contáctanos",
    preparedBy: "Preparado por",
    generatedOn: "Generado el",
    tourCode: "Código del Tour",
    page: "Página",
  },
  ja: {
    daysNights: (d) => `${d}日${Math.max(d - 1, 0)}泊`,
    overview: "旅行概要",
    highlights: "旅行のハイライト",
    itinerary: "旅程表",
    day: "日目",
    breakfast: "朝食",
    lunch: "昼食",
    dinner: "夕食",
    accommodation: "宿泊先",
    hotels: "旅行中の宿泊先",
    pricing: "料金",
    groupSize: "グループ人数",
    pricePerPerson: "1名あたりの料金",
    people: "名",
    included: "含まれるもの",
    notIncluded: "含まれないもの",
    contactTitle: "このツアーにご興味がありましたらお問い合わせください",
    preparedBy: "作成者",
    generatedOn: "作成日",
    tourCode: "ツアーコード",
    page: "ページ",
  },
};

interface ProposalPdfText {
  kicker: string;
  preparedFor: string;
  travelDates: string;
  program: string;
  itinerary: string;
  day: string;
  meals: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  stay: string;
  hotels: string;
  price: string;
  perProgram: string;
  groupSize: string;
  included: string;
  notIncluded: string;
  policies: string;
  bookingPolicy: string;
  paymentPolicy: string;
  cancellationPolicy: string;
  insurancePolicy: string;
  visaPolicy: string;
  contact: string;
  preparedOn: string;
  page: string;
  draft: string;
}

export const proposalPdfText: Record<PdfLocale, ProposalPdfText> = {
  th: {
    kicker: "ใบเสนอราคาทริปส่วนตัว",
    preparedFor: "จัดทำเสนอสำหรับ",
    travelDates: "วันเดินทาง",
    program: "โปรแกรมการเดินทาง",
    itinerary: "กำหนดการวันต่อวัน",
    day: "วันที่",
    meals: "มื้ออาหาร",
    breakfast: "เช้า",
    lunch: "กลางวัน",
    dinner: "เย็น",
    stay: "ที่พักคืนนี้",
    hotels: "ที่พักตลอดทริป",
    price: "ราคาโปรแกรม",
    perProgram: "ต่อโปรแกรม",
    groupSize: "จำนวนผู้เดินทาง",
    included: "ราคานี้รวม",
    notIncluded: "ราคานี้ไม่รวม",
    policies: "นโยบายและเงื่อนไข",
    bookingPolicy: "นโยบายการจอง",
    paymentPolicy: "นโยบายการชำระเงิน",
    cancellationPolicy: "นโยบายการยกเลิก",
    insurancePolicy: "เงื่อนไขประกันภัยและประกันชีวิต",
    visaPolicy: "นโยบายวีซ่า",
    contact: "ผู้ดูแลการเดินทางของคุณ",
    preparedOn: "จัดทำเอกสารเมื่อ",
    page: "หน้า",
    draft: "ฉบับร่าง",
  },
  en: {
    kicker: "Personalized Trip Proposal",
    preparedFor: "Prepared for",
    travelDates: "Travel Dates",
    program: "Trip Program",
    itinerary: "Day-by-Day Itinerary",
    day: "Day",
    meals: "Meals",
    breakfast: "Breakfast",
    lunch: "Lunch",
    dinner: "Dinner",
    stay: "Stay Tonight",
    hotels: "Hotels Throughout the Trip",
    price: "Program Price",
    perProgram: "per program",
    groupSize: "Number of Travelers",
    included: "Included",
    notIncluded: "Not Included",
    policies: "Policies & Terms",
    bookingPolicy: "Booking Policy",
    paymentPolicy: "Payment Policy",
    cancellationPolicy: "Cancellation Policy",
    insurancePolicy: "Insurance & Travel Insurance Terms",
    visaPolicy: "Visa Policy",
    contact: "Your Travel Consultant",
    preparedOn: "Prepared on",
    page: "Page",
    draft: "Draft",
  },
  fr: {
    kicker: "Proposition de voyage personnalisée",
    preparedFor: "Préparé pour",
    travelDates: "Dates de voyage",
    program: "Programme du voyage",
    itinerary: "Itinéraire jour par jour",
    day: "Jour",
    meals: "Repas",
    breakfast: "Petit-déjeuner",
    lunch: "Déjeuner",
    dinner: "Dîner",
    stay: "Hébergement ce soir",
    hotels: "Hôtels pendant le voyage",
    price: "Prix du programme",
    perProgram: "par programme",
    groupSize: "Nombre de voyageurs",
    included: "Inclus",
    notIncluded: "Non inclus",
    policies: "Politiques et conditions",
    bookingPolicy: "Politique de réservation",
    paymentPolicy: "Politique de paiement",
    cancellationPolicy: "Politique d'annulation",
    insurancePolicy: "Conditions d'assurance voyage",
    visaPolicy: "Politique de visa",
    contact: "Votre conseiller voyage",
    preparedOn: "Préparé le",
    page: "Page",
    draft: "Brouillon",
  },
  de: {
    kicker: "Individuelles Reiseangebot",
    preparedFor: "Erstellt für",
    travelDates: "Reisedaten",
    program: "Reiseprogramm",
    itinerary: "Tagesablauf",
    day: "Tag",
    meals: "Mahlzeiten",
    breakfast: "Frühstück",
    lunch: "Mittagessen",
    dinner: "Abendessen",
    stay: "Übernachtung heute",
    hotels: "Hotels während der Reise",
    price: "Programmpreis",
    perProgram: "pro Programm",
    groupSize: "Anzahl der Reisenden",
    included: "Inklusive",
    notIncluded: "Nicht inklusive",
    policies: "Bedingungen & Konditionen",
    bookingPolicy: "Buchungsbedingungen",
    paymentPolicy: "Zahlungsbedingungen",
    cancellationPolicy: "Stornierungsbedingungen",
    insurancePolicy: "Reiseversicherungsbedingungen",
    visaPolicy: "Visabestimmungen",
    contact: "Ihr Reiseberater",
    preparedOn: "Erstellt am",
    page: "Seite",
    draft: "Entwurf",
  },
  es: {
    kicker: "Propuesta de Viaje Personalizada",
    preparedFor: "Preparado para",
    travelDates: "Fechas de Viaje",
    program: "Programa del Viaje",
    itinerary: "Itinerario Día a Día",
    day: "Día",
    meals: "Comidas",
    breakfast: "Desayuno",
    lunch: "Almuerzo",
    dinner: "Cena",
    stay: "Alojamiento esta noche",
    hotels: "Hoteles Durante el Viaje",
    price: "Precio del Programa",
    perProgram: "por programa",
    groupSize: "Número de Viajeros",
    included: "Incluido",
    notIncluded: "No Incluido",
    policies: "Políticas y Condiciones",
    bookingPolicy: "Política de Reserva",
    paymentPolicy: "Política de Pago",
    cancellationPolicy: "Política de Cancelación",
    insurancePolicy: "Condiciones del Seguro de Viaje",
    visaPolicy: "Política de Visa",
    contact: "Tu Asesor de Viajes",
    preparedOn: "Preparado el",
    page: "Página",
    draft: "Borrador",
  },
  ja: {
    kicker: "個別旅行プロポーザル",
    preparedFor: "お客様",
    travelDates: "旅行日程",
    program: "旅行プログラム",
    itinerary: "日程表",
    day: "日目",
    meals: "食事",
    breakfast: "朝食",
    lunch: "昼食",
    dinner: "夕食",
    stay: "宿泊先",
    hotels: "旅行中の宿泊先",
    price: "プログラム料金",
    perProgram: "プログラムあたり",
    groupSize: "参加人数",
    included: "含まれるもの",
    notIncluded: "含まれないもの",
    policies: "規約とポリシー",
    bookingPolicy: "予約規約",
    paymentPolicy: "お支払い規約",
    cancellationPolicy: "キャンセル規約",
    insurancePolicy: "旅行保険に関する規約",
    visaPolicy: "ビザに関する規約",
    contact: "ご担当の旅行コンサルタント",
    preparedOn: "作成日",
    page: "ページ",
    draft: "下書き",
  },
};

export function getTourPdfText(locale: string | null | undefined): TourPdfText {
  return tourPdfText[isPdfLocale(locale) ? locale : "th"];
}

export function getProposalPdfText(locale: string | null | undefined): ProposalPdfText {
  return proposalPdfText[isPdfLocale(locale) ? locale : "th"];
}
