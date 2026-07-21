import { query, queryOne } from "@/lib/db";

export interface PartnerEmbed {
  id: number;
  label: string;
  html: string;
  sort_order: number;
  created_at: string;
}

export async function listPartnerEmbeds(): Promise<PartnerEmbed[]> {
  const rows = await query<PartnerEmbed>("SELECT * FROM partner_embeds ORDER BY sort_order ASC, created_at ASC");
  return rows.map((r) => ({ ...r, sort_order: Number(r.sort_order) }));
}

export async function getPartnerEmbedById(id: number): Promise<PartnerEmbed | null> {
  const row = await queryOne<PartnerEmbed>("SELECT * FROM partner_embeds WHERE id = $1", [id]);
  return row ? { ...row, sort_order: Number(row.sort_order) } : null;
}

export async function createPartnerEmbed(input: { label: string; html: string; sort_order: number }): Promise<number> {
  const row = await queryOne<{ id: number }>(
    "INSERT INTO partner_embeds (label, html, sort_order) VALUES ($1, $2, $3) RETURNING id",
    [input.label, input.html, input.sort_order]
  );
  return row!.id;
}

export async function updatePartnerEmbed(id: number, input: { label: string; html: string; sort_order: number }): Promise<void> {
  await query("UPDATE partner_embeds SET label = $1, html = $2, sort_order = $3 WHERE id = $4", [input.label, input.html, input.sort_order, id]);
}

export async function deletePartnerEmbed(id: number): Promise<void> {
  await query("DELETE FROM partner_embeds WHERE id = $1", [id]);
}
