import { NextRequest, NextResponse } from "next/server";
import { getSettings } from "@/lib/queries/settings";
import { findOrCreateConversation, addMessage } from "@/lib/queries/whatsappChat";

/**
 * Meta calls this with GET once, when you register the webhook URL in the
 * WhatsApp app's dashboard, to prove you control this endpoint. It must
 * echo back `hub.challenge` if `hub.verify_token` matches what's configured
 * in Settings — otherwise Meta refuses to activate the webhook.
 */
export async function GET(req: NextRequest) {
  const mode = req.nextUrl.searchParams.get("hub.mode");
  const token = req.nextUrl.searchParams.get("hub.verify_token");
  const challenge = req.nextUrl.searchParams.get("hub.challenge");

  const settings = await getSettings();
  if (mode === "subscribe" && token && token === settings.whatsapp_api_webhook_verify_token) {
    return new NextResponse(challenge || "", { status: 200 });
  }
  return new NextResponse("Verification failed", { status: 403 });
}

/**
 * Meta POSTs here whenever a customer sends a message to the business's
 * WhatsApp number, or when a message status changes (delivered/read/failed).
 * This is what makes replies show up in the on-site chat widget and in the
 * admin WhatsApp inbox — without this route wired up in Meta's dashboard,
 * nothing arrives here and the chat is one-way (visitor -> WhatsApp only).
 */
export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();
    const entries = payload?.entry || [];

    for (const entry of entries) {
      for (const change of entry?.changes || []) {
        const value = change?.value;
        if (!value) continue;

        const contactsByPhone = new Map<string, string>();
        for (const contact of value.contacts || []) {
          if (contact?.wa_id) contactsByPhone.set(contact.wa_id, contact?.profile?.name || "");
        }

        for (const msg of value.messages || []) {
          const fromPhone: string = msg.from;
          const name = contactsByPhone.get(fromPhone);
          const body: string =
            msg.text?.body || (msg.type ? `[${msg.type} message]` : "[unsupported message]");

          const conversation = await findOrCreateConversation(fromPhone, name);
          await addMessage(conversation.id, "inbound", body, msg.id);
        }

        // Delivery/read status updates for messages the business sent out.
        for (const status of value.statuses || []) {
          // Stored for future use (e.g. showing "delivered"/"read" ticks);
          // intentionally not failing the webhook if this table lookup
          // doesn't match anything yet.
          void status;
        }
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[whatsapp:webhook:error]", err);
    // Always 200 back to Meta even on our own parsing errors, otherwise
    // Meta will keep retrying the same payload and may eventually disable
    // the webhook for repeated failures.
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
