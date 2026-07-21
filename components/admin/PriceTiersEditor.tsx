"use client";

import { useState } from "react";
import { Plus, Trash2, Users, Coins } from "lucide-react";
import type { PriceTier } from "@/lib/types";

export default function PriceTiersEditor({ initialTiers }: { initialTiers: PriceTier[] }) {
  const [tiers, setTiers] = useState<PriceTier[]>(
    initialTiers.length > 0 ? initialTiers : [{ groupSize: 2, pricePerPerson: 0 }]
  );

  function update(index: number, patch: Partial<PriceTier>) {
    setTiers((prev) => prev.map((t, i) => (i === index ? { ...t, ...patch } : t)));
  }

  function addTier() {
    setTiers((prev) => [...prev, { groupSize: (prev.at(-1)?.groupSize || 0) + 2, pricePerPerson: 0 }]);
  }

  function removeTier(index: number) {
    setTiers((prev) => prev.filter((_, i) => i !== index));
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="price_tiers_json" value={JSON.stringify(tiers)} readOnly />
      {tiers.map((tier, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="flex-1">
            <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><Users size={13} /> ขนาดกลุ่ม (คน)</span>
            <input
              type="number"
              min={1}
              value={tier.groupSize}
              onChange={(e) => update(index, { groupSize: Number(e.target.value) || 1 })}
              className="mini-input"
            />
          </div>
          <div className="flex-1">
            <span className="mb-1 flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[var(--color-gold)]"><Coins size={13} /> ราคา/คน</span>
            <input
              type="number"
              min={0}
              value={tier.pricePerPerson}
              onChange={(e) => update(index, { pricePerPerson: Number(e.target.value) || 0 })}
              className="mini-input"
            />
          </div>
          <button type="button" onClick={() => removeTier(index)} className="mt-5 text-[var(--color-clay)]">
            <Trash2 size={16} />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addTier}
        className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-jade)]"
      >
        <Plus size={13} /> เพิ่มระดับราคา
      </button>

      <style jsx>{`
        .mini-input {
          width: 100%;
          border: 1px solid var(--color-border);
          border-radius: 0.6rem;
          padding: 0.5rem 0.7rem;
          font-size: 0.8125rem;
        }
        .mini-input:focus {
          outline: 2px solid var(--color-jade);
          outline-offset: 1px;
        }
      `}</style>
    </div>
  );
}
