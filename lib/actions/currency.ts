"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { updateSettings } from "@/lib/queries/settings";

export type RefreshRatesState = { ok: boolean; message?: string };

/**
 * Pulls fresh THB exchange rates from a free, keyless public API
 * (open.er-api.com) and stores them in Settings. Falls back with an error
 * message if the request fails — the site keeps using whatever rates were
 * saved before, so a failed refresh never breaks pricing.
 */
export async function refreshCurrencyRatesAction(): Promise<RefreshRatesState> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  try {
    const res = await fetch("https://open.er-api.com/v6/latest/THB", { cache: "no-store" });
    if (!res.ok) throw new Error(`API responded with ${res.status}`);
    const data = await res.json();
    const rates = data?.rates;
    if (!rates || typeof rates !== "object") throw new Error("Unexpected API response");

    await updateSettings({
      rate_usd: String(rates.USD ?? ""),
      rate_eur: String(rates.EUR ?? ""),
      rate_gbp: String(rates.GBP ?? ""),
      rate_jpy: String(rates.JPY ?? ""),
      rate_aud: String(rates.AUD ?? ""),
      rate_cad: String(rates.CAD ?? ""),
    });

    revalidatePath("/", "layout");
    return { ok: true, message: "อัปเดตอัตราแลกเปลี่ยนล่าสุดแล้ว" };
  } catch (err) {
    console.error("[currency] Failed to refresh rates", err);
    return { ok: false, message: "ไม่สามารถดึงอัตราแลกเปลี่ยนล่าสุดได้ในขณะนี้ กรุณาลองใหม่ภายหลัง หรือกรอกอัตราด้วยตนเอง" };
  }
}
