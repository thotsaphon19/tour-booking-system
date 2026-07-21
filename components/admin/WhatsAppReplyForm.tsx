"use client";

import { useActionState, useRef, useEffect } from "react";
import { Loader2, Send } from "lucide-react";
import { sendAdminWhatsAppReply, type ReplyState } from "@/lib/actions/whatsappChat";

const initialState: ReplyState = { ok: false };

export default function WhatsAppReplyForm({ conversationId }: { conversationId: number }) {
  const [state, formAction, pending] = useActionState(sendAdminWhatsAppReply, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-2">
      <input type="hidden" name="conversation_id" value={conversationId} />
      <div className="flex gap-2">
        <textarea
          name="body"
          required
          rows={2}
          placeholder="พิมพ์ข้อความตอบกลับ..."
          className="flex-1 resize-none rounded-xl border border-[var(--color-border)] px-3 py-2.5 text-sm"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex items-center gap-1.5 self-end rounded-xl bg-[var(--color-jade)] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[var(--color-jade-light)] disabled:opacity-60"
        >
          {pending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          ส่ง
        </button>
      </div>
      {state.message && (
        <p className={`text-xs ${state.ok ? "text-[var(--color-jade)]" : "text-[var(--color-clay)]"}`}>{state.message}</p>
      )}
    </form>
  );
}
