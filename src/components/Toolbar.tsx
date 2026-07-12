"use client";

export type ToolbarSection = "rows" | "file" | "all";

interface ToolbarProps {
  onAddRow: () => void;
  onAddColumn: () => void;
  onRemoveRow: () => void;
  onRemoveColumn: () => void;
  onImportExcel: () => void;
  onImportOds: () => void;
  onImportJson: () => void;
  onExportExcel: () => void;
  onExportJson: () => void;
  onNewTable: () => void;
  section?: ToolbarSection;
  layout?: "vertical" | "horizontal";
}

function ToolButton({
  onClick,
  label,
  children,
  variant = "default",
  compact,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
  variant?: "default" | "danger" | "primary";
  compact?: boolean;
}) {
  if (compact) {
    const variants = {
      default: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
      danger: "bg-red-50 text-red-600 border border-red-200 hover:bg-red-100",
      primary: "bg-emerald-600 text-white hover:bg-emerald-700",
    };
    return (
      <button
        type="button"
        onClick={onClick}
        className={`inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium touch-manipulation active:scale-95 whitespace-nowrap ${variants[variant]}`}
        title={label}
      >
        <span>{children}</span>
        <span>{label}</span>
      </button>
    );
  }

  const base =
    "flex flex-col items-center justify-center gap-0.5 min-w-[52px] min-h-[52px] px-2 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 touch-manipulation select-none";
  const variants = {
    default: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 shadow-sm",
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
  onAddRow,
  onAddColumn,
  onRemoveRow,
  onRemoveColumn,
  onImportExcel,
  onImportOds,
  onImportJson,
  onExportExcel,
  onExportJson,
  onNewTable,
  section = "all",
  layout = "vertical",
}: ToolbarProps) {
  const show = (s: ToolbarSection) => section === "all" || section === s;
  const compact = layout === "horizontal";
  const wrapClass = compact ? "flex flex-wrap gap-2" : "flex flex-wrap gap-2";

  if (compact && section === "all") {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <ToolButton compact label="Aggiungi riga" onClick={onAddRow} variant="primary">➕</ToolButton>
          <ToolButton compact label="Aggiungi colonna" onClick={onAddColumn} variant="primary">➕</ToolButton>
          <ToolButton compact label="Elimina riga" onClick={onRemoveRow} variant="danger">➖</ToolButton>
          <ToolButton compact label="Elimina colonna" onClick={onRemoveColumn} variant="danger">➖</ToolButton>
          <div className="w-px h-9 bg-gray-200 mx-1 hidden sm:block" />
          <ToolButton compact label="Nuova tabella" onClick={onNewTable}>📄</ToolButton>
          <ToolButton compact label="Importa Excel" onClick={onImportExcel}>📥</ToolButton>
          <ToolButton compact label="Importa ODS" onClick={onImportOds}>📑</ToolButton>
          <ToolButton compact label="Importa JSON" onClick={onImportJson}>📂</ToolButton>
          <ToolButton compact label="Scarica Excel" onClick={onExportExcel} variant="primary">📊</ToolButton>
          <ToolButton compact label="Scarica JSON" onClick={onExportJson}>💾</ToolButton>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {show("rows") && (
        <section className="bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
          {section === "all" && !compact && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
              Righe e colonne
            </h3>
          )}
          <div className={wrapClass}>
            <ToolButton compact={compact} label="Aggiungi riga" onClick={onAddRow} variant="primary">➕</ToolButton>
            <ToolButton compact={compact} label="Aggiungi colonna" onClick={onAddColumn} variant="primary">➕</ToolButton>
            <ToolButton compact={compact} label="Elimina riga" onClick={onRemoveRow} variant="danger">➖</ToolButton>
            <ToolButton compact={compact} label="Elimina colonna" onClick={onRemoveColumn} variant="danger">➖</ToolButton>
          </div>
        </section>
      )}

      {show("file") && (
        <section className="bg-white rounded-2xl border border-gray-200 p-3 shadow-sm">
          {section === "all" && !compact && (
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 px-1">
              Salva e carica
            </h3>
          )}
          <div className={wrapClass}>
            <ToolButton compact={compact} label="Nuova tabella" onClick={onNewTable}>📄</ToolButton>
            <ToolButton compact={compact} label="Importa Excel" onClick={onImportExcel}>📥</ToolButton>
            <ToolButton compact={compact} label="Importa ODS" onClick={onImportOds}>📑</ToolButton>
            <ToolButton compact={compact} label="Importa JSON" onClick={onImportJson}>📂</ToolButton>
            <ToolButton compact={compact} label="Scarica Excel" onClick={onExportExcel} variant="primary">📊</ToolButton>
            <ToolButton compact={compact} label="Scarica JSON" onClick={onExportJson}>💾</ToolButton>
          </div>
        </section>
      )}
    </div>
  );
}
