"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { MessageCircle, Mail, X, Phone, MessagesSquare } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import WhatsAppChatWidget from "@/components/WhatsAppChatWidget";

function buildWhatsappLink(number: string, message?: string): string {
  const digits = number.replace(/[^0-9]/g, "");
  const text = message ? `?text=${encodeURIComponent(message)}` : "";
  return `https://wa.me/${digits}${text}`;
}

export default function FloatingContact({
  whatsappNumber,
  email,
  phone,
  consultantName,
  consultantRole,
  consultantPhotoUrl,
  consultantGreeting,
}: {
  whatsappNumber: string;
  email: string;
  phone: string;
  consultantName?: string;
  consultantRole?: string;
  consultantPhotoUrl?: string;
  consultantGreeting?: string;
}) {
  const t = useTranslations("floatingContact");
  const [open, setOpen] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [panel, setPanel] = useState<"links" | "chat">("links");

  // Show the consultant greeting bubble every time someone lands on a page,
  // a few seconds after load — like a proactive "need help?" popup. It still
  // goes away for that view if the visitor closes it or opens the panel.
  useEffect(() => {
    if (!consultantPhotoUrl) return;
    const timer = setTimeout(() => setShowGreeting(true), 3500);
    return () => clearTimeout(timer);
  }, [consultantPhotoUrl]);

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: 12, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 12, scale: 0.95 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="rounded-2xl border border-[var(--color-border)] bg-white p-4 shadow-xl"
        >
          {panel === "chat" ? (
            <WhatsAppChatWidget onBack={() => setPanel("links")} />
          ) : (
            <div className="w-56">
              <p className="mb-3 text-sm font-semibold text-[var(--color-jade-dark)]">{t("title")}</p>
              <div className="space-y-2">
                <button
                  onClick={() => setPanel("chat")}
                  className="flex w-full items-center gap-2 rounded-xl bg-[#25D366]/10 px-3 py-2.5 text-sm font-medium text-[#128C4A] transition hover:bg-[#25D366]/20"
                >
                  <MessagesSquare size={16} /> {t("chatNowButton")}
                </button>
                <a
                  href={buildWhatsappLink(whatsappNumber, t("whatsappGreeting"))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 rounded-xl bg-[#25D366]/10 px-3 py-2.5 text-sm font-medium text-[#128C4A] transition hover:bg-[#25D366]/20"
                >
                  <MessageCircle size={16} /> {t("whatsapp")}
                </a>
                <a
                  href={`mailto:${email}`}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-jade)]/10 px-3 py-2.5 text-sm font-medium text-[var(--color-jade)] transition hover:bg-[var(--color-jade)]/20"
                >
                  <Mail size={16} /> {email}
                </a>
                <a
                  href={`tel:${phone.replace(/[^0-9+]/g, "")}`}
                  className="flex items-center gap-2 rounded-xl bg-[var(--color-gold)]/10 px-3 py-2.5 text-sm font-medium text-[var(--color-gold)] transition hover:bg-[var(--color-gold)]/20"
                >
                  <Phone size={16} /> {phone}
                </a>
              </div>
            </div>
          )}
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
      {!open && showGreeting && consultantPhotoUrl && (
        <motion.div
          initial={{ opacity: 0, y: 16, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 16, scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="relative w-64 rounded-2xl border border-[var(--color-border)] bg-white p-4 pr-8 shadow-xl"
        >
          <button
            onClick={() => setShowGreeting(false)}
            aria-label="Close"
            className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-[var(--color-muted)] hover:bg-[var(--color-sand)]"
          >
            <X size={14} />
          </button>
          <button onClick={() => setOpen(true)} className="flex items-start gap-3 text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={consultantPhotoUrl} alt={consultantName || "Consultant"} className="h-11 w-11 flex-shrink-0 rounded-full object-cover" />
            <div>
              {consultantName && <p className="text-sm font-semibold text-[var(--color-jade-dark)]">{consultantName}</p>}
              {consultantRole && <p className="text-xs text-[var(--color-muted)]">{consultantRole}</p>}
              {consultantGreeting && <p className="mt-1.5 text-xs text-[var(--color-ink-soft)]">{consultantGreeting}</p>}
            </div>
          </button>
        </motion.div>
      )}
      </AnimatePresence>

      <div className="relative">
        {!open && (
          <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[var(--color-clay)]/40" style={{ animationDuration: "2.5s" }} />
        )}
        <button
          onClick={() => {
            setOpen((v) => !v);
            setShowGreeting(false);
          }}
          aria-label="Contact us"
          className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full bg-[var(--color-clay)] text-white shadow-lg transition hover:scale-105"
        >
          {open ? (
            <X size={22} />
          ) : consultantPhotoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={consultantPhotoUrl} alt={consultantName || "Contact"} className="h-full w-full object-cover" />
          ) : (
            <MessageCircle size={22} />
          )}
        </button>
      </div>
    </div>
  );
}
