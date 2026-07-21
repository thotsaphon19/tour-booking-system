import { query, queryOne } from "@/lib/db";
import type { DeletionRequest } from "@/lib/types";

export async function createDeletionRequest(input: {
  entityType: string;
  entityId: number;
  entityLabel: string;
  requestedBy: number;
  requestedByName: string;
}): Promise<number> {
  const row = await queryOne<{ id: number }>(
    `INSERT INTO deletion_requests (entity_type, entity_id, entity_label, requested_by, requested_by_name)
     VALUES ($1, $2, $3, $4, $5) RETURNING id`,
    [input.entityType, input.entityId, input.entityLabel, input.requestedBy, input.requestedByName]
  );
  return row!.id;
}

export async function listPendingDeletionRequests(): Promise<DeletionRequest[]> {
  return query<DeletionRequest>("SELECT * FROM deletion_requests WHERE status = 'pending' ORDER BY created_at ASC");
}

export async function listAllDeletionRequests(): Promise<DeletionRequest[]> {
  return query<DeletionRequest>("SELECT * FROM deletion_requests ORDER BY created_at DESC LIMIT 100");
}

export async function getDeletionRequestById(id: number): Promise<DeletionRequest | null> {
  return queryOne<DeletionRequest>("SELECT * FROM deletion_requests WHERE id = $1", [id]);
}

export async function resolveDeletionRequest(id: number, status: "approved" | "rejected", resolvedBy: number): Promise<void> {
  await query("UPDATE deletion_requests SET status = $1, resolved_by = $2, resolved_at = NOW() WHERE id = $3", [
    status,
    resolvedBy,
    id,
  ]);
}

export async function countPendingDeletionRequests(): Promise<number> {
  const row = await queryOne<{ c: string }>("SELECT COUNT(*) as c FROM deletion_requests WHERE status = 'pending'");
  return Number(row?.c || 0);
}
