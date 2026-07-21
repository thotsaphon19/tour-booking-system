import { query, queryOne } from "@/lib/db";
import type { TourProposal, ProposalItineraryDay, HotelListItem } from "@/lib/types";

function rowToProposal(row: any): TourProposal {
  return {
    ...row,
    duration_days: Number(row.duration_days),
    price_amount: Number(row.price_amount),
    itinerary: JSON.parse(row.itinerary_json || "[]"),
    hotel_list: JSON.parse(row.hotel_list_json || "[]"),
    includes: JSON.parse(row.includes_json || "[]"),
    excludes: JSON.parse(row.excludes_json || "[]"),
    highlights: JSON.parse(row.highlights_json || "[]"),
  };
}

export interface TourProposalInput {
  based_on_tour_id?: number | null;
  client_name: string;
  client_email: string;
  client_phone: string;
  travel_start_date: string;
  travel_end_date: string;
  title: string;
  cover_image_url: string;
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
  agent_name: string;
  agent_role: string;
  agent_photo_url: string;
  proposal_code: string;
  status: string;
  created_by?: number;
}

const COLUMNS = [
  "based_on_tour_id",
  "client_name",
  "client_email",
  "client_phone",
  "travel_start_date",
  "travel_end_date",
  "title",
  "cover_image_url",
  "summary",
  "duration_days",
  "itinerary_json",
  "hotel_list_json",
  "includes_json",
  "excludes_json",
  "highlights_json",
  "price_amount",
  "currency",
  "group_size",
  "booking_policy",
  "payment_policy",
  "cancellation_policy",
  "insurance_policy",
  "visa_policy",
  "agent_name",
  "agent_role",
  "agent_photo_url",
  "proposal_code",
  "status",
  "created_by",
];

function toParams(input: TourProposalInput) {
  return [
    input.based_on_tour_id || null,
    input.client_name,
    input.client_email,
    input.client_phone,
    input.travel_start_date || null,
    input.travel_end_date || null,
    input.title,
    input.cover_image_url || null,
    input.summary,
    input.duration_days,
    JSON.stringify(input.itinerary || []),
    JSON.stringify(input.hotel_list || []),
    JSON.stringify(input.includes || []),
    JSON.stringify(input.excludes || []),
    JSON.stringify(input.highlights || []),
    input.price_amount,
    input.currency,
    input.group_size,
    input.booking_policy,
    input.payment_policy,
    input.cancellation_policy,
    input.insurance_policy,
    input.visa_policy,
    input.agent_name || null,
    input.agent_role || null,
    input.agent_photo_url || null,
    input.proposal_code || null,
    input.status,
    input.created_by || null,
  ];
}

export async function createTourProposal(input: TourProposalInput): Promise<number> {
  const placeholders = COLUMNS.map((_, i) => `$${i + 1}`).join(", ");
  const row = await queryOne<{ id: number }>(
    `INSERT INTO tour_proposals (${COLUMNS.join(", ")}) VALUES (${placeholders}) RETURNING id`,
    toParams(input)
  );
  return row!.id;
}

export async function updateTourProposal(id: number, input: TourProposalInput): Promise<void> {
  const setClause = COLUMNS.map((c, i) => `${c} = $${i + 1}`).join(", ");
  await query(`UPDATE tour_proposals SET ${setClause}, updated_at = NOW() WHERE id = $${COLUMNS.length + 1}`, [
    ...toParams(input),
    id,
  ]);
}

export async function deleteTourProposal(id: number): Promise<void> {
  await query("DELETE FROM tour_proposals WHERE id = $1", [id]);
}

export async function getTourProposalById(id: number): Promise<TourProposal | null> {
  const row = await queryOne("SELECT * FROM tour_proposals WHERE id = $1", [id]);
  return row ? rowToProposal(row) : null;
}

export async function listTourProposals(): Promise<TourProposal[]> {
  const rows = await query("SELECT * FROM tour_proposals ORDER BY created_at DESC");
  return rows.map(rowToProposal);
}
