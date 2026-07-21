"use client";

import { useState, useEffect } from "react";

export default function DualRangeSlider({
  min,
  max,
  step = 1,
  value,
  histogram,
  formatLabel,
  onChangeCommitted,
}: {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  histogram: number[];
  formatLabel: (v: number) => string;
  onChangeCommitted: (value: [number, number]) => void;
}) {
  const [local, setLocal] = useState<[number, number]>(value);

  // Keep in sync if the URL/filters change from elsewhere (e.g. "clear all").
  useEffect(() => setLocal(value), [value[0], value[1]]);

  const range = Math.max(max - min, 1);
  const maxCount = Math.max(...histogram, 1);
  const lowPct = ((local[0] - min) / range) * 100;
  const highPct = ((local[1] - min) / range) * 100;

  function commit(next: [number, number]) {
    setLocal(next);
    onChangeCommitted(next);
  }

  return (
    <div>
      <div className="relative h-16">
        {/* Histogram bars */}
        <div className="absolute inset-x-0 bottom-5 flex h-10 items-end gap-[2px]">
          {histogram.map((count, i) => {
            const barStart = (i / histogram.length) * 100;
            const inRange = barStart >= lowPct - 100 / histogram.length && barStart <= highPct;
            return (
              <div
                key={i}
                className={`flex-1 rounded-t-sm transition-colors ${inRange ? "bg-[var(--color-jade)]" : "bg-[var(--color-border)]"}`}
                style={{ height: `${Math.max((count / maxCount) * 100, 4)}%` }}
              />
            );
          })}
        </div>

        {/* Track */}
        <div className="absolute inset-x-0 bottom-2 h-1 rounded-full bg-[var(--color-border)]">
          <div className="absolute h-1 rounded-full bg-[var(--color-jade)]" style={{ left: `${lowPct}%`, right: `${100 - highPct}%` }} />
        </div>

        {/* Two overlapping range inputs make a dual-handle slider */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={local[0]}
          onChange={(e) => setLocal([Math.min(Number(e.target.value), local[1]), local[1]])}
          onMouseUp={() => commit(local)}
          onTouchEnd={() => commit(local)}
          className="range-thumb pointer-events-none absolute inset-x-0 bottom-2 h-1 w-full appearance-none bg-transparent"
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={local[1]}
          onChange={(e) => setLocal([local[0], Math.max(Number(e.target.value), local[0])])}
          onMouseUp={() => commit(local)}
          onTouchEnd={() => commit(local)}
          className="range-thumb pointer-events-none absolute inset-x-0 bottom-2 h-1 w-full appearance-none bg-transparent"
        />
      </div>
      <div className="flex items-center justify-between text-xs text-[var(--color-ink-soft)]">
        <span>{formatLabel(local[0])}</span>
        <span>{formatLabel(local[1])}</span>
      </div>

      <style jsx>{`
        .range-thumb::-webkit-slider-thumb {
          pointer-events: auto;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: white;
          border: 2px solid var(--color-jade);
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        .range-thumb::-moz-range-thumb {
          pointer-events: auto;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: white;
          border: 2px solid var(--color-jade);
          cursor: pointer;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
        }
        .range-thumb::-webkit-slider-runnable-track {
          background: transparent;
        }
      `}</style>
    </div>
  );
}
