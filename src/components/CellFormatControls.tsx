"use client";

import { useRef, useState } from "react";
import { applyColorToDomSelection } from "@/lib/rich-text-utils";
import type { CellStyle, TextVariant } from "@/types/table";
import { FONT_SIZE_OPTIONS } from "@/types/table";

const VARIANT_OPTIONS: { value: TextVariant; label: string }[] = [
  { value: "paragraph", label: "Paragrafo" },
  { value: "heading", label: "Intestazione" },
];

const COLOR_PRESETS = [
  "#1a1a1a",
  "#ffffff",
  "#dc2626",
  "#2563eb",
  "#16a34a",
  "#ca8a04",
  "#9333ea",
];

const SELECTION_COLOR_PRESETS = [
  "#dc2626",
  "#2563eb",
  "#16a34a",
  "#ca8a04",
  "#9333ea",
  "#1a1a1a",
];

function FormatBtn({
  onClick,
  active,
  label,
  children,
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center justify-center min-w-[40px] h-10 px-2.5 rounded-lg text-sm font-medium transition-all active:scale-95 touch-manipulation ${
        active
          ? "bg-blue-600 text-white shadow-sm"
          : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50"
      }`}
      title={label}
      aria-label={label}
    >
      {children}
    </button>
  );
}

interface CellFormatControlsProps {
  style: CellStyle;
  onChange: (updates: Partial<CellStyle>) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  onEditorUpdate: () => void;
}

export default function CellFormatControls({
  style,
  onChange,
  editorRef,
  onEditorUpdate,
}: CellFormatControlsProps) {
  const [selectionColor, setSelectionColor] = useState("#dc2626");
  const selectionColorRef = useRef<HTMLInputElement>(null);

  const applySelectionColor = (color: string) => {
    editorRef.current?.focus();
    if (applyColorToDomSelection(color)) {
      onEditorUpdate();
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <FormatBtn label="Grassetto" active={style.bold} onClick={() => onChange({ bold: !style.bold })}>
          <strong>B</strong>
        </FormatBtn>
        <FormatBtn label="Corsivo" active={style.italic} onClick={() => onChange({ italic: !style.italic })}>
          <em>I</em>
        </FormatBtn>
        <div className="w-px h-8 bg-gray-200" />
        {VARIANT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() =>
              onChange({
                textVariant: opt.value,
                fontSize: opt.value === "heading" ? 18 : 14,
              })
            }
            className={`h-10 px-3 rounded-lg text-sm font-medium touch-manipulation ${
              style.textVariant === opt.value
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-700 border border-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <label className="flex items-center gap-2 h-10 px-3 rounded-lg border border-gray-200 bg-white text-sm">
          <span className="text-xs text-gray-500">Px</span>
          <select
            value={style.fontSize}
            onChange={(e) => onChange({ fontSize: Number(e.target.value) })}
            className="bg-transparent outline-none text-sm font-medium cursor-pointer"
          >
            {FONT_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1.5">Colore testo intera cella</p>
        <div className="flex flex-wrap gap-2 items-center">
          {COLOR_PRESETS.map((color) => (
            <button
              key={`text-${color}`}
              type="button"
              onClick={() => onChange({ textColor: color })}
              className={`w-9 h-9 rounded-lg border-2 transition-transform active:scale-90 touch-manipulation ${
                style.textColor === color ? "border-blue-500 scale-110" : "border-gray-200"
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Colore testo ${color}`}
            />
          ))}
          <label className="w-9 h-9 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer touch-manipulation">
            <span className="text-xs text-gray-400">+</span>
            <input
              type="color"
              value={style.textColor}
              onChange={(e) => onChange({ textColor: e.target.value })}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1.5">Colore testo selezionato</p>
        <p className="text-xs text-gray-400 mb-2">Seleziona parole nel testo, poi scegli colore</p>
        <div className="flex flex-wrap gap-2 items-center">
          {SELECTION_COLOR_PRESETS.map((color) => (
            <button
              key={`sel-${color}`}
              type="button"
              onClick={() => applySelectionColor(color)}
              className={`w-9 h-9 rounded-lg border-2 border-gray-200 transition-transform active:scale-90 touch-manipulation ${
                selectionColor === color ? "ring-2 ring-blue-500 ring-offset-1" : ""
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Colore selezione ${color}`}
            />
          ))}
          <label className="w-9 h-9 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer touch-manipulation">
            <span className="text-xs text-gray-400">+</span>
            <input
              ref={selectionColorRef}
              type="color"
              value={selectionColor}
              onChange={(e) => {
                setSelectionColor(e.target.value);
                applySelectionColor(e.target.value);
              }}
              className="sr-only"
            />
          </label>
        </div>
      </div>

      <div>
        <p className="text-xs text-gray-500 mb-1.5">Sfondo cella</p>
        <div className="flex flex-wrap gap-2 items-center">
          {["#ffffff", "#f3f4f6", "#fef3c7", "#dbeafe", "#dcfce7", "#fce7f3"].map((color) => (
            <button
              key={`bg-${color}`}
              type="button"
              onClick={() => onChange({ backgroundColor: color })}
              className={`w-9 h-9 rounded-lg border-2 transition-transform active:scale-90 touch-manipulation ${
                style.backgroundColor === color ? "border-blue-500 scale-110" : "border-gray-200"
              }`}
              style={{ backgroundColor: color }}
              aria-label={`Sfondo ${color}`}
            />
          ))}
          <label className="w-9 h-9 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer touch-manipulation">
            <span className="text-xs text-gray-400">+</span>
            <input
              type="color"
              value={style.backgroundColor}
              onChange={(e) => onChange({ backgroundColor: e.target.value })}
              className="sr-only"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
