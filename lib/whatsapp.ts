import type { SiteSettings } from "@/lib/queries/settings";

const GRAPH_API_VERSION = "v21.0";

export function isWhatsAppApiConfigured(settings: SiteSettings): boolean {
  return Boolean(settings.whatsapp_api_phone_number_id && settings.whatsapp_api_access_token);
}

/**
 * Sends a freeform text message via the Meta WhatsApp Business Cloud API.
 *
 * Important real-world constraint (not a bug, this is how WhatsApp works):
 * Meta only allows a business to send a freeform message to a phone number
 * if that person messaged the business's WhatsApp number within the last
 * 24 hours ("customer service window"), or if the message uses a
 * pre-approved message template. Sending a cold freeform message to someone
 * who has never messaged in will be rejected by the API. This function does
 * not work around that — it's a policy Meta enforces server-side to prevent
 * spam, and no code change here can bypass it.
 */
export async function sendWhatsAppMessage(
  settings: SiteSettings,
  toPhone: string,
  body: string
): Promise<{ sent: boolean; waMessageId?: string; error?: string }> {
  if (!isWhatsAppApiConfigured(settings)) {
    console.log("[whatsapp:disabled] API not configured — skipping real send.", { toPhone, body });
    return { sent: false, error: "WhatsApp API not configured in Settings" };
  }

  const digits = toPhone.replace(/[^0-9]/g, "");
  const url = `https://graph.facebook.com/${GRAPH_API_VERSION}/${settings.whatsapp_api_phone_number_id}/messages`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${settings.whatsapp_api_access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: digits,
        type: "text",
        text: { body },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      const message = data?.error?.message || `HTTP ${res.status}`;
      console.error("[whatsapp:error] Send failed", data);
      return { sent: false, error: message };
    }
    return { sent: true, waMessageId: data?.messages?.[0]?.id };
  } catch (err) {
    console.error("[whatsapp:error] Network error sending message", err);
    return { sent: false, error: "Network error contacting WhatsApp API" };
  }
}
