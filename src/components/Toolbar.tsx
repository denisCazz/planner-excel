"use client";

import type { CellStyle, TextAlign } from "@/types/table";

interface ToolbarProps {
  activeStyle: CellStyle;
  onStyleChange: (style: Partial<CellStyle>) => void;
  onAddRow: () => void;
  onAddColumn: () => void;
  onRemoveRow: () => void;
  onRemoveColumn: () => void;
  onImportExcel: () => void;
  onImportJson: () => void;
  onExportExcel: () => void;
  onExportJson: () => void;
  onNewTable: () => void;
  hasSelection: boolean;
}

const ALIGN_OPTIONS: { value: TextAlign; label: string; icon: string }[] = [
  { value: "left", label: "Sinistra", icon: "⬅" },
  { value: "center", label: "Centro", icon: "↔" },
  { value: "right", label: "Destra", icon: "➡" },
];

const COLOR_PRESETS = [
  "#1a1a1a",
  "#ffffff",
  "#dc2626",
  "#2563eb",
  "#16a34a",
  "#ca8a04",
  "#9333ea",
  "#f3f4f6",
  "#fef3c7",
  "#dbeafe",
  "#dcfce7",
  "#fce7f3",
];

function ToolButton({
  onClick,
  active,
  label,
  children,
  variant = "default",
}: {
  onClick: () => void;
  active?: boolean;
  label: string;
  children: React.ReactNode;
  variant?: "default" | "danger" | "primary";
}) {
  const base =
    "flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[52px] px-2 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 touch-manipulation select-none";
  const variants = {
    default: active
      ? "bg-blue-600 text-white shadow-md"
      : "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm",
    danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
    primary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-md",
  };
  return (
    <button type="button" onClick={onClick} className={`${base} ${variants[variant]}`} title={label} aria-label={label}>
      <span className="text-lg leading-none">{children}</span>
      <span className="text-[10px] leading-tight text-center">{label}</span>
    </button>
  );
}

export default function Toolbar({
  activeStyle,
  onStyleChange,
  onAddRow,
  onAddColumn,
  onRemoveRow,
  onRemoveColumn,
  onImportExcel,
  onImportJson,
  onExportExcel,
  onExportJson,
  onNewTable,
  hasSelection,
}: ToolbarProps) {
  return (
    <div className="space-y-3">
      {/* Stile testo */}
      <section className="bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
          Stile testo
        </h3>
        <div className="flex flex-wrap gap-2">
          <ToolButton
            label="Grassetto"
            active={activeStyle.bold}
            onClick={() => onStyleChange({ bold: !activeStyle.bold })}
          >
            <strong>B</strong>
          </ToolButton>
          <ToolButton
            label="Corsivo"
            active={activeStyle.italic}
            onClick={() => onStyleChange({ italic: !activeStyle.italic })}
          >
            <em>I</em>
          </ToolButton>
          {ALIGN_OPTIONS.map((opt) => (
            <ToolButton
              key={opt.value}
              label={opt.label}
              active={activeStyle.align === opt.value}
              onClick={() => onStyleChange({ align: opt.value })}
            >
              {opt.icon}
            </ToolButton>
          ))}
        </div>
      </section>

      {/* Colori */}
      <section className="bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
          Colori
        </h3>
        <div className="space-y-2">
          <div>
            <p className="text-xs text-gray-500 mb-1.5 px-1">Colore testo</p>
            <div className="flex flex-wrap gap-2 items-center">
              {COLOR_PRESETS.slice(0, 7).map((color) => (
                <button
                  key={`text-${color}`}
                  type="button"
                  onClick={() => onStyleChange({ textColor: color })}
                  className={`w-9 h-9 rounded-lg border-2 transition-transform active:scale-90 touch-manipulation ${
                    activeStyle.textColor === color ? "border-blue-500 scale-110" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Testo ${color}`}
                  aria-label={`Colore testo ${color}`}
                />
              ))}
              <label className="w-9 h-9 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 touch-manipulation">
                <span className="text-xs text-gray-400">+</span>
                <input
                  type="color"
                  value={activeStyle.textColor}
                  onChange={(e) => onStyleChange({ textColor: e.target.value })}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1.5 px-1">Sfondo cella</p>
            <div className="flex flex-wrap gap-2 items-center">
              {COLOR_PRESETS.map((color) => (
                <button
                  key={`bg-${color}`}
                  type="button"
                  onClick={() => onStyleChange({ backgroundColor: color })}
                  className={`w-9 h-9 rounded-lg border-2 transition-transform active:scale-90 touch-manipulation ${
                    activeStyle.backgroundColor === color ? "border-blue-500 scale-110" : "border-gray-200"
                  }`}
                  style={{ backgroundColor: color }}
                  title={`Sfondo ${color}`}
                  aria-label={`Colore sfondo ${color}`}
                />
              ))}
              <label className="w-9 h-9 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-blue-400 touch-manipulation">
                <span className="text-xs text-gray-400">+</span>
                <input
                  type="color"
                  value={activeStyle.backgroundColor}
                  onChange={(e) => onStyleChange({ backgroundColor: e.target.value })}
                  className="sr-only"
                />
              </label>
            </div>
          </div>
        </div>
        {!hasSelection && (
          <p className="text-xs text-amber-600 mt-2 px-1">
            Seleziona una cella per applicare lo stile
          </p>
        )}
      </section>

      {/* Righe e colonne */}
      <section className="bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
          Righe e colonne
        </h3>
        <div className="flex flex-wrap gap-2">
          <ToolButton label="Aggiungi riga" onClick={onAddRow} variant="primary">
            ➕
          </ToolButton>
          <ToolButton label="Aggiungi colonna" onClick={onAddColumn} variant="primary">
            ➕
          </ToolButton>
          <ToolButton label="Elimina riga" onClick={onRemoveRow} variant="danger">
            ➖
          </ToolButton>
          <ToolButton label="Elimina colonna" onClick={onRemoveColumn} variant="danger">
            ➖
          </ToolButton>
        </div>
      </section>

      {/* File */}
      <section className="bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
        <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
          Salva e carica
        </h3>
        <div className="flex flex-wrap gap-2">
          <ToolButton label="Nuova tabella" onClick={onNewTable}>
            📄
          </ToolButton>
          <ToolButton label="Importa Excel" onClick={onImportExcel}>
            📥
          </ToolButton>
          <ToolButton label="Importa JSON" onClick={onImportJson}>
            📂
          </ToolButton>
          <ToolButton label="Scarica Excel" onClick={onExportExcel} variant="primary">
            📊
          </ToolButton>
          <ToolButton label="Scarica JSON" onClick={onExportJson}>
            💾
          </ToolButton>
        </div>
      </section>
    </div>
  );
}
