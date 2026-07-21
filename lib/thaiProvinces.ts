/**
 * All 77 provinces of Thailand. `th` is the canonical value stored on a
 * tour (and used for filtering/matching) — it never changes even if the
 * displayed translation does. `en` is the standard English/romanized name.
 *
 * French, German, and Japanese sites conventionally keep Thai place names
 * in their romanized (English) form rather than translating them, so those
 * locales fall back to `en` — this is standard practice for place names,
 * not a missing translation.
 */
export interface ThaiProvince {
  th: string;
  en: string;
}

export const THAI_PROVINCES: ThaiProvince[] = [
  { th: "กรุงเทพมหานคร", en: "Bangkok" },
  { th: "กระบี่", en: "Krabi" },
  { th: "กาญจนบุรี", en: "Kanchanaburi" },
  { th: "กาฬสินธุ์", en: "Kalasin" },
  { th: "กำแพงเพชร", en: "Kamphaeng Phet" },
  { th: "ขอนแก่น", en: "Khon Kaen" },
  { th: "จันทบุรี", en: "Chanthaburi" },
  { th: "ฉะเชิงเทรา", en: "Chachoengsao" },
  { th: "ชลบุรี", en: "Chonburi" },
  { th: "ชัยนาท", en: "Chai Nat" },
  { th: "ชัยภูมิ", en: "Chaiyaphum" },
  { th: "ชุมพร", en: "Chumphon" },
  { th: "เชียงราย", en: "Chiang Rai" },
  { th: "เชียงใหม่", en: "Chiang Mai" },
  { th: "ตรัง", en: "Trang" },
  { th: "ตราด", en: "Trat" },
  { th: "ตาก", en: "Tak" },
  { th: "นครนายก", en: "Nakhon Nayok" },
  { th: "นครปฐม", en: "Nakhon Pathom" },
  { th: "นครพนม", en: "Nakhon Phanom" },
  { th: "นครราชสีมา", en: "Nakhon Ratchasima" },
  { th: "นครศรีธรรมราช", en: "Nakhon Si Thammarat" },
  { th: "นครสวรรค์", en: "Nakhon Sawan" },
  { th: "นนทบุรี", en: "Nonthaburi" },
  { th: "นราธิวาส", en: "Narathiwat" },
  { th: "น่าน", en: "Nan" },
  { th: "บึงกาฬ", en: "Bueng Kan" },
  { th: "บุรีรัมย์", en: "Buriram" },
  { th: "ปทุมธานี", en: "Pathum Thani" },
  { th: "ประจวบคีรีขันธ์", en: "Prachuap Khiri Khan" },
  { th: "ปราจีนบุรี", en: "Prachinburi" },
  { th: "ปัตตานี", en: "Pattani" },
  { th: "พระนครศรีอยุธยา", en: "Ayutthaya" },
  { th: "พะเยา", en: "Phayao" },
  { th: "พังงา", en: "Phang Nga" },
  { th: "พัทลุง", en: "Phatthalung" },
  { th: "พิจิตร", en: "Phichit" },
  { th: "พิษณุโลก", en: "Phitsanulok" },
  { th: "เพชรบุรี", en: "Phetchaburi" },
  { th: "เพชรบูรณ์", en: "Phetchabun" },
  { th: "แพร่", en: "Phrae" },
  { th: "ภูเก็ต", en: "Phuket" },
  { th: "มหาสารคาม", en: "Maha Sarakham" },
  { th: "มุกดาหาร", en: "Mukdahan" },
  { th: "แม่ฮ่องสอน", en: "Mae Hong Son" },
  { th: "ยโสธร", en: "Yasothon" },
  { th: "ยะลา", en: "Yala" },
  { th: "ร้อยเอ็ด", en: "Roi Et" },
  { th: "ระนอง", en: "Ranong" },
  { th: "ระยอง", en: "Rayong" },
  { th: "ราชบุรี", en: "Ratchaburi" },
  { th: "ลพบุรี", en: "Lopburi" },
  { th: "ลำปาง", en: "Lampang" },
  { th: "ลำพูน", en: "Lamphun" },
  { th: "เลย", en: "Loei" },
  { th: "ศรีสะเกษ", en: "Sisaket" },
  { th: "สกลนคร", en: "Sakon Nakhon" },
  { th: "สงขลา", en: "Songkhla" },
  { th: "สตูล", en: "Satun" },
  { th: "สมุทรปราการ", en: "Samut Prakan" },
  { th: "สมุทรสงคราม", en: "Samut Songkhram" },
  { th: "สมุทรสาคร", en: "Samut Sakhon" },
  { th: "สระแก้ว", en: "Sa Kaeo" },
  { th: "สระบุรี", en: "Saraburi" },
  { th: "สิงห์บุรี", en: "Sing Buri" },
  { th: "สุโขทัย", en: "Sukhothai" },
  { th: "สุพรรณบุรี", en: "Suphan Buri" },
  { th: "สุราษฎร์ธานี", en: "Surat Thani" },
  { th: "สุรินทร์", en: "Surin" },
  { th: "หนองคาย", en: "Nong Khai" },
  { th: "หนองบัวลำภู", en: "Nong Bua Lamphu" },
  { th: "อ่างทอง", en: "Ang Thong" },
  { th: "อำนาจเจริญ", en: "Amnat Charoen" },
  { th: "อุดรธานี", en: "Udon Thani" },
  { th: "อุตรดิตถ์", en: "Uttaradit" },
  { th: "อุทัยธานี", en: "Uthai Thani" },
  { th: "อุบลราชธานี", en: "Ubon Ratchathani" },
];

const LOOKUP: Record<string, string> = Object.fromEntries(THAI_PROVINCES.map((p) => [p.th, p.en]));

/** Returns the display name for a province in the given locale. Thai stays
 *  as-is; every other supported locale uses the standard English/romanized
 *  name. Falls back to the raw stored value if it isn't a recognized Thai
 *  province (e.g. legacy data entered before this list existed). */
export function localizeProvinceName(thName: string, locale: string): string {
  if (locale === "th") return thName;
  return LOOKUP[thName] || thName;
}
