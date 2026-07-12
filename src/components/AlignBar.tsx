"use client";

import type { CellStyle, TextAlign } from "@/types/table";

const ALIGN_OPTIONS: { value: TextAlign; label: string; icon: string }[] = [
  { value: "left", label: "Sinistra", icon: "⬅" },
  { value: "center", label: "Centro", icon: "↔" },
  { value: "right", label: "Destra", icon: "➡" },
];

interface AlignBarProps {
  activeAlign: TextAlign;
  onAlignChange: (align: TextAlign) => void;
  hasSelection: boolean;
  selectionLabel?: string | null;
}

export default function AlignBar({
  activeAlign,
  onAlignChange,
  hasSelection,
  selectionLabel,
}: AlignBarProps) {
  return (
    <div className="w-full bg-gray-50 border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide mr-1">
          Allinea
        </span>
        {ALIGN_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            disabled={!hasSelection}
            onClick={() => onAlignChange(opt.value)}
            className={`flex items-center justify-center min-w-[40px] h-10 px-2.5 rounded-lg text-sm font-medium touch-manipulation disabled:opacity-40 ${
              activeAlign === opt.value && hasSelection
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
            title={opt.label}
            aria-label={opt.label}
          >
            {opt.icon}
          </button>
        ))}
        {!hasSelection && (
          <span className="text-xs text-amber-600 ml-2">Seleziona cella, riga o colonna</span>
        )}
        {hasSelection && selectionLabel && (
          <span className="text-xs text-blue-600 ml-2 font-medium">{selectionLabel}</span>
        )}
      </div>
    </div>
  );
}
