import { NextRequest, NextResponse } from "next/server";
import { listMessages, getConversationById } from "@/lib/queries/whatsappChat";

export async function GET(req: NextRequest) {
  const idParam = req.nextUrl.searchParams.get("conversationId");
  const id = Number(idParam);
  if (!id || Number.isNaN(id)) {
    return NextResponse.json({ error: "conversationId is required" }, { status: 400 });
  }

  const conversation = await getConversationById(id);
  if (!conversation) {
    return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
  }

  const messages = await listMessages(id);
  return NextResponse.json({ conversation, messages });
}
