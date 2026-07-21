import { NextRequest, NextResponse } from "next/server";
import { getUploadFile } from "@/lib/queries/uploads";

export const runtime = "nodejs";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const upload = await getUploadFile(Number(id));
  if (!upload) {
    return new NextResponse("Not found", { status: 404 });
  }

  return new NextResponse(new Uint8Array(upload.data), {
    headers: {
      "Content-Type": upload.mime_type,
      "Cache-Control": "public, max-age=31536000, immutable",
    },
  });
}
