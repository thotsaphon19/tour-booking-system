"use server";

import { getSession } from "@/lib/auth";
import { translateText } from "@/lib/translate";

/**
 * Translates an arbitrary set of Thai text fields into one target locale.
 * Used by admin forms to draft a starting translation the admin then
 * reviews and edits — never written to the database directly by this action.
 */
export async function suggestTranslations(payload: {
  targetLocale: string;
  fields: Record<string, string>;
}): Promise<Record<string, string>> {
  const session = await getSession();
  if (!session) return {};

  const entries = Object.entries(payload.fields).filter(([, text]) => text && text.trim());
  const results: Record<string, string> = {};

  // Sequential, not parallel: MyMemory's free tier is rate-limited per IP,
  // and firing dozens of requests at once from one tour form is likely to
  // trip that limit and fail more of them than doing it one at a time.
  for (const [key, text] of entries) {
    results[key] = await translateText(text, payload.targetLocale);
  }
  return results;
}
