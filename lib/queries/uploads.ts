import { pool, queryOne, query } from "@/lib/db";

export interface UploadMeta {
  id: number;
  filename: string;
  mime_type: string;
  size_bytes: number;
  created_at: string;
}

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB per image
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export class UploadValidationError extends Error {}

export function assertValidImageUpload(mimeType: string, sizeBytes: number) {
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new UploadValidationError("รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP เท่านั้น");
  }
  if (sizeBytes > MAX_UPLOAD_BYTES) {
    throw new UploadValidationError("ไฟล์มีขนาดใหญ่เกินไป (สูงสุด 5MB ต่อไฟล์)");
  }
}

export async function createUpload(input: { filename: string; mimeType: string; buffer: Buffer }): Promise<number> {
  assertValidImageUpload(input.mimeType, input.buffer.length);
  const row = await queryOne<{ id: number }>(
    "INSERT INTO uploads (filename, mime_type, data, size_bytes) VALUES ($1, $2, $3, $4) RETURNING id",
    [input.filename, input.mimeType, input.buffer, input.buffer.length]
  );
  return row!.id;
}

export async function getUploadFile(id: number): Promise<{ mime_type: string; data: Buffer } | null> {
  const result = await pool.query<{ mime_type: string; data: Buffer }>(
    "SELECT mime_type, data FROM uploads WHERE id = $1",
    [id]
  );
  return result.rows[0] || null;
}

export async function listUploads(): Promise<UploadMeta[]> {
  return query<UploadMeta>("SELECT id, filename, mime_type, size_bytes, created_at FROM uploads ORDER BY created_at DESC");
}

export async function deleteUpload(id: number): Promise<void> {
  await query("DELETE FROM uploads WHERE id = $1", [id]);
}
