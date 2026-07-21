export type TourStatus = "active" | "draft";
export type BookingStatus = "pending" | "confirmed" | "cancelled";
export type RequestType = "booking" | "quote";

export interface RouteLeg {
  from?: string;
  to?: string;
  distanceKm?: number;
  duration?: string;
  transport?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  description: string;
  breakfast?: boolean;
  lunch?: boolean;
  dinner?: boolean;
  accommodation?: string;
  photos?: string[];
  /** One or more legs of travel within the day, shown as a route timeline
   *  (e.g. Bangkok → Bang Pa-In → Ayutthaya → Bangkok). */
  route?: RouteLeg[];
}

export interface PriceTier {
  groupSize: number;
  pricePerPerson: number;
}

export interface HotelListItem {
  days: string;
  city: string;
  name: string;
  stars: number;
  image: string;
}

export const TOUR_TAGS = ["สำหรับครอบครัว", "สำหรับคู่รัก", "กลุ่มเพื่อน", "รักธรรมชาติ"] as const;

/** Locales that a tour's content can be translated into, besides the Thai base fields. */
export const TRANSLATABLE_LOCALES = ["th", "en", "fr", "de", "ja", "es"] as const;
export type TranslatableLocale = (typeof TRANSLATABLE_LOCALES)[number];

export interface ItineraryDayTranslation {
  day: number;
  title?: string;
  description?: string;
  accommodation?: string;
}

export interface HotelListItemTranslation {
  city?: string;
  name?: string;
}

/** All fields on a Tour that an admin can optionally translate. Any field left
 *  blank falls back to the Thai base value at render time — nothing is ever
 *  shown empty because a translation is missing. */
export interface TourTranslation {
  title?: string;
  category?: string;
  province?: string;
  difficulty?: string;
  summary?: string;
  description?: string;
  highlights?: string[];
  includes?: string[];
  excludes?: string[];
  hotel_name?: string;
  hotel_description?: string;
  agent_name?: string;
  agent_role?: string;
  itinerary?: ItineraryDayTranslation[];
  hotel_list?: HotelListItemTranslation[];
}

export type TourTranslations = Partial<Record<TranslatableLocale, TourTranslation>>;

export interface Tour {
  id: number;
  slug: string;
  title: string;
  category: string;
  province: string;
  duration_days: number;
  price: number;
  currency: string;
  max_group_size: number;
  difficulty: string;
  cover_image_url: string | null;
  gallery: string[];
  summary: string;
  description: string;
  itinerary: ItineraryDay[];
  includes: string[];
  excludes: string[];
  highlights: string[];
  status: TourStatus;
  price_tiers: PriceTier[];
  difficulty_rating: number;
  comfort_rating: number;
  rating_score: number | null;
  rating_count: number | null;
  rating_source: string | null;
  hotel_name: string | null;
  hotel_description: string | null;
  hotel_images: string[];
  hotel_list: HotelListItem[];
  agent_name: string | null;
  agent_role: string | null;
  agent_photo_url: string | null;
  tags: string[];
  video_url: string | null;
  tour_code: string | null;
  map_embed_url: string | null;
  translations: TourTranslations;
  departure_dates: string[];
  created_at: string;
  updated_at: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  created_at: string;
}

export interface Booking {
  id: number;
  tour_id: number;
  customer_id: number;
  travel_date: string;
  num_travelers: number;
  total_price: number;
  status: BookingStatus;
  request_type: RequestType;
  notes: string | null;
  created_at: string;
  // joined fields (optional, populated by query helpers)
  tour_title?: string;
  customer_name?: string;
  customer_email?: string;
  customer_phone?: string | null;
}

export interface NewsTranslation {
  title?: string;
  excerpt?: string;
  content?: string;
}
export type NewsTranslations = Partial<Record<TranslatableLocale, NewsTranslation>>;

export interface NewsPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  cover_image_url: string | null;
  published: boolean;
  translations: NewsTranslations;
  created_at: string;
}

export interface ReviewTranslation {
  customer_name?: string;
  customer_country?: string;
  title?: string;
  quote?: string;
}
export type ReviewTranslations = Partial<Record<TranslatableLocale, ReviewTranslation>>;

export interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string | null;
  message: string;
  created_at: string;
}

export type AdminRole = "super_admin" | "admin";

export interface DeletionRequest {
  id: number;
  entity_type: string;
  entity_id: number;
  entity_label: string;
  requested_by: number;
  requested_by_name: string;
  status: "pending" | "approved" | "rejected";
  resolved_by: number | null;
  created_at: string;
  resolved_at: string | null;
}

export interface ProposalItineraryDay {
  day: number;
  date?: string;
  title: string;
  description: string;
  breakfast?: boolean;
  lunch?: boolean;
  dinner?: boolean;
  accommodation?: string;
  photos?: string[];
}

export interface TourProposal {
  id: number;
  based_on_tour_id: number | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  travel_start_date: string | null;
  travel_end_date: string | null;
  title: string;
  cover_image_url: string | null;
  summary: string;
  duration_days: number;
  itinerary: ProposalItineraryDay[];
  hotel_list: HotelListItem[];
  includes: string[];
  excludes: string[];
  highlights: string[];
  price_amount: number;
  currency: string;
  group_size: string;
  booking_policy: string;
  payment_policy: string;
  cancellation_policy: string;
  insurance_policy: string;
  visa_policy: string;
  agent_name: string | null;
  agent_role: string | null;
  agent_photo_url: string | null;
  proposal_code: string | null;
  status: "draft" | "sent";
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface AdminUser {
  id: number;
  email: string;
  password_hash: string;
  name: string;
  role: AdminRole;
  permissions: string[];
  created_at: string;
}
