import { query } from "@/lib/db";

export interface TripRequest {
  id: number;
  title: string | null;
  name: string;
  email: string;
  whatsapp: string | null;
  nationality: string | null;
  special_requests: string | null;
  tour_slug: string | null;
  status: string;
  flight_ack: string | null;
  trip_length_days: number | null;
  arrival_date: string | null;
  departure_date: string | null;
  traveler_count: number | null;
  traveler_type: string | null;
  guide_preference: string | null;
  guide_language: string | null;
  hotel_level: string | null;
  currency: string | null;
  budget_per_person: string | null;
  places_of_interest: string | null;
  created_at: string;
}

export interface TripRequestInput {
  title?: string;
  name: string;
  email: string;
  whatsapp?: string;
  nationality?: string;
  special_requests?: string;
  tour_slug?: string;
  flight_ack?: string;
  trip_length_days?: number;
  arrival_date?: string;
  departure_date?: string;
  traveler_count?: number;
  traveler_type?: string;
  guide_preference?: string;
  guide_language?: string;
  hotel_level?: string;
  currency?: string;
  budget_per_person?: string;
  places_of_interest?: string;
}

export async function createTripRequest(input: TripRequestInput): Promise<number> {
  const rows = await query<{ id: number }>(
    `INSERT INTO trip_requests
      (title, name, email, whatsapp, nationality, special_requests, tour_slug,
       flight_ack, trip_length_days, arrival_date, departure_date, traveler_count,
       traveler_type, guide_preference, guide_language, hotel_level, currency,
       budget_per_person, places_of_interest)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
     RETURNING id`,
    [
      input.title || null,
      input.name,
      input.email,
      input.whatsapp || null,
      input.nationality || null,
      input.special_requests || null,
      input.tour_slug || null,
      input.flight_ack || null,
      input.trip_length_days ?? null,
      input.arrival_date || null,
      input.departure_date || null,
      input.traveler_count ?? null,
      input.traveler_type || null,
      input.guide_preference || null,
      input.guide_language || null,
      input.hotel_level || null,
      input.currency || null,
      input.budget_per_person || null,
      input.places_of_interest || null,
    ]
  );
  return rows[0].id;
}

export async function listTripRequests(): Promise<TripRequest[]> {
  const rows = await query<TripRequest>("SELECT * FROM trip_requests ORDER BY created_at DESC");
  return rows.map((r) => ({
    ...r,
    trip_length_days: r.trip_length_days === null ? null : Number(r.trip_length_days),
    traveler_count: r.traveler_count === null ? null : Number(r.traveler_count),
  }));
}

export async function getTripRequestById(id: number): Promise<TripRequest | null> {
  const rows = await query<TripRequest>("SELECT * FROM trip_requests WHERE id = $1", [id]);
  if (!rows[0]) return null;
  return {
    ...rows[0],
    trip_length_days: rows[0].trip_length_days === null ? null : Number(rows[0].trip_length_days),
    traveler_count: rows[0].traveler_count === null ? null : Number(rows[0].traveler_count),
  };
}

export async function updateTripRequest(id: number, input: TripRequestInput): Promise<void> {
  await query(
    `UPDATE trip_requests SET
      name = $1, email = $2, whatsapp = $3, nationality = $4, special_requests = $5, tour_slug = $6,
      flight_ack = $7, trip_length_days = $8, arrival_date = $9, departure_date = $10, traveler_count = $11,
      traveler_type = $12, guide_preference = $13, guide_language = $14, hotel_level = $15, currency = $16,
      budget_per_person = $17, places_of_interest = $18
     WHERE id = $19`,
    [
      input.name,
      input.email,
      input.whatsapp || null,
      input.nationality || null,
      input.special_requests || null,
      input.tour_slug || null,
      input.flight_ack || null,
      input.trip_length_days ?? null,
      input.arrival_date || null,
      input.departure_date || null,
      input.traveler_count ?? null,
      input.traveler_type || null,
      input.guide_preference || null,
      input.guide_language || null,
      input.hotel_level || null,
      input.currency || null,
      input.budget_per_person || null,
      input.places_of_interest || null,
      id,
    ]
  );
}

export async function deleteTripRequest(id: number): Promise<void> {
  await query("DELETE FROM trip_requests WHERE id = $1", [id]);
}

export async function updateTripRequestStatus(id: number, status: string): Promise<void> {
  await query("UPDATE trip_requests SET status = $1 WHERE id = $2", [status, id]);
}
