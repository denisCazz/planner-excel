"use client";

import { useEffect } from "react";
import Toolbar, { type ToolbarSection } from "@/components/Toolbar";

interface MobileToolsBarProps {
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
  openPanel: ToolbarSection | null;
  onOpenPanel: (panel: ToolbarSection | null) => void;
}

const PANELS: { id: ToolbarSection; label: string; icon: string }[] = [
  { id: "rows", label: "Righe", icon: "📐" },
  { id: "file", label: "File", icon: "📁" },
];

export default function MobileToolsBar({
  openPanel,
  onOpenPanel,
  ...toolbarProps
}: MobileToolsBarProps) {
  useEffect(() => {
    if (!openPanel) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [openPanel]);

  return (
    <>
      {openPanel && (
        <div className="lg:hidden fixed inset-0 z-40">
          <button
            type="button"
            className="absolute inset-0 bg-black/40"
            aria-label="Chiudi pannello"
            onClick={() => onOpenPanel(null)}
          />
          <div className="absolute bottom-16 left-0 right-0 max-h-[65vh] overflow-y-auto bg-white rounded-t-2xl shadow-2xl border-t border-gray-200 p-4 pb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">
                {PANELS.find((p) => p.id === openPanel)?.label}
              </h2>
              <button
                type="button"
                onClick={() => onOpenPanel(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"
                aria-label="Chiudi"
              >
                ✕
              </button>
            </div>
            <Toolbar {...toolbarProps} section={openPanel} />
          </div>
        </div>
      )}

      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] safe-area-pb">
        <div className="flex items-stretch justify-around px-2 pt-2 pb-2">
          {PANELS.map((panel) => (
            <button
              key={panel.id}
              type="button"
              onClick={() => onOpenPanel(openPanel === panel.id ? null : panel.id)}
              className={`flex flex-col items-center justify-center gap-0.5 min-w-[72px] py-2 px-3 rounded-xl touch-manipulation transition-colors ${
                openPanel === panel.id
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 active:bg-gray-100"
              }`}
            >
              <span className="text-xl leading-none">{panel.icon}</span>
              <span className="text-[11px] font-medium">{panel.label}</span>
            </button>
          ))}
        </div>
      </nav>
    </>
  );
}
