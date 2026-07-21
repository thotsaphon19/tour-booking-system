"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import { startWebsiteChat, type StartChatState } from "@/lib/actions/whatsappChat";

const STORAGE_KEY = "tbs_whatsapp_conversation";

interface StoredChat {
  conversationId: number;
  name: string;
  phone: string;
}

interface ChatMessage {
  id: number;
  direction: "inbound" | "outbound";
  body: string;
  created_at: string;
}

const initialState: StartChatState = { ok: false };

export default function WhatsAppChatWidget({ onBack }: { onBack: () => void }) {
  const t = useTranslations("whatsappChat");
  const [stored, setStored] = useState<StoredChat | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pendingReply, setPendingReply] = useState("");
  const [state, formAction, pending] = useActionState(startWebsiteChat, initialState);

  // Restore an existing conversation from a previous visit.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setStored(JSON.parse(raw));
    } catch {
      // ignore malformed storage
    }
  }, []);

  // When the widget successfully starts a chat, save it and open WhatsApp so
  // the visitor actually sends the first message from their own account —
  // required by WhatsApp's anti-spam policy (see lib/whatsapp.ts).
  useEffect(() => {
    if (state.ok && state.conversationId) {
      const name = (document.getElementById("wa-chat-name") as HTMLInputElement)?.value || "";
      const phone = (document.getElementById("wa-chat-phone") as HTMLInputElement)?.value || "";
      const record: StoredChat = { conversationId: state.conversationId, name, phone };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
      setStored(record);
      if (state.waLink) window.open(state.waLink, "_blank", "noopener,noreferrer");
    }
  }, [state]);

  // Poll for new messages (inbound replies arrive via the webhook after the
  // business — or the visitor, from their own WhatsApp — sends something).
  useEffect(() => {
    if (!stored) return;
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`/api/whatsapp/messages?conversationId=${stored!.conversationId}`, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled) setMessages(data.messages || []);
      } catch {
        // silent — will retry on the next tick
      }
    }
    poll();
    const id = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [stored]);

  if (stored) {
    return (
      <div className="flex h-96 w-64 flex-col">
        <div className="mb-2 flex items-center gap-2">
          <button onClick={onBack} aria-label={t("back")} className="text-[var(--color-muted)] hover:text-[var(--color-jade)]">
            <ArrowLeft size={16} />
          </button>
          <p className="text-sm font-semibold text-[var(--color-jade-dark)]">{t("chatTitle")}</p>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3">
          {messages.length === 0 && (
            <p className="text-xs text-[var(--color-muted)]">{t("waitingMessage")}</p>
          )}
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.direction === "outbound" ? "justify-start" : "justify-end"}`}>
              <div
                className={`max-w-[85%] rounded-xl px-3 py-1.5 text-xs ${
                  m.direction === "outbound"
                    ? "border border-[var(--color-border)] bg-white text-[var(--color-ink-soft)]"
                    : "bg-[#25D366]/15 text-[var(--color-ink-soft)]"
                }`}
              >
                {m.body}
              </div>
            </div>
          ))}
        </div>
        <form
          className="mt-2 flex gap-1.5"
          onSubmit={(e) => {
            e.preventDefault();
            if (!pendingReply.trim()) return;
            const digits = stored.phone.replace(/[^0-9]/g, "");
            window.open(`https://wa.me/${digits}?text=${encodeURIComponent(pendingReply)}`, "_blank", "noopener,noreferrer");
            setPendingReply("");
          }}
        >
          <input
            value={pendingReply}
            onChange={(e) => setPendingReply(e.target.value)}
            placeholder={t("replyPlaceholder")}
            className="flex-1 rounded-lg border border-[var(--color-border)] px-2.5 py-2 text-xs"
          />
          <button
            type="submit"
            aria-label="Send"
            className="flex items-center justify-center rounded-lg bg-[#25D366] px-2.5 text-white transition hover:opacity-90"
          >
            <Send size={14} />
          </button>
        </form>
        <p className="mt-1.5 text-center text-[10px] text-[var(--color-muted)]">{t("replyNote")}</p>
      </div>
    );
  }

  return (
    <div className="w-64">
      <div className="mb-3 flex items-center gap-2">
        <button onClick={onBack} aria-label={t("back")} className="text-[var(--color-muted)] hover:text-[var(--color-jade)]">
          <ArrowLeft size={16} />
        </button>
        <p className="text-sm font-semibold text-[var(--color-jade-dark)]">{t("startTitle")}</p>
      </div>
      <form action={formAction} className="space-y-2">
        <input
          id="wa-chat-name"
          name="name"
          placeholder={t("namePlaceholder")}
          required
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
        />
        {state.fieldErrors?.name && <p className="text-xs text-[var(--color-clay)]">{state.fieldErrors.name}</p>}
        <input
          id="wa-chat-phone"
          name="phone"
          placeholder={t("phonePlaceholder")}
          required
          className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
        />
        {state.fieldErrors?.phone && <p className="text-xs text-[var(--color-clay)]">{state.fieldErrors.phone}</p>}
        <textarea
          name="message"
          rows={3}
          placeholder={t("messagePlaceholder")}
          required
          className="w-full resize-none rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
        />
        {state.fieldErrors?.message && <p className="text-xs text-[var(--color-clay)]">{state.fieldErrors.message}</p>}
        <button
          type="submit"
          disabled={pending}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-3 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
        >
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />}
          {t("startButton")}
        </button>
        <p className="text-[10px] text-[var(--color-muted)]">{t("startNote")}</p>
      </form>
    </div>
  );
}
