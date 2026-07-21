import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { createUpload, UploadValidationError } from "@/lib/queries/uploads";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "ไม่ได้เข้าสู่ระบบ" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "ไม่พบไฟล์ที่อัปโหลด" }, { status: 400 });
  }

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const id = await createUpload({ filename: file.name, mimeType: file.type, buffer });
    return NextResponse.json({ url: `/api/uploads/${id}`, id });
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    console.error("[upload] failed", err);
    return NextResponse.json({ error: "อัปโหลดไม่สำเร็จ กรุณาลองใหม่อีกครั้ง" }, { status: 500 });
  }
}
