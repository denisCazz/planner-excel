"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import CellFormatControls from "@/components/CellFormatControls";
import { cellStyleToCss } from "@/lib/cell-style-utils";
import { isRichHtml, sanitizeCellHtml, stripHtml } from "@/lib/rich-text-utils";
import type { CellStyle } from "@/types/table";

interface CellEditModalProps {
  open: boolean;
  row: number;
  col: number;
  colLabel: string;
  value: string;
  style: CellStyle;
  onSave: (value: string, style: CellStyle) => void;
  onClose: () => void;
}

export default function CellEditModal({
  open,
  row,
  col,
  colLabel,
  value,
  style,
  onSave,
  onClose,
}: CellEditModalProps) {
  const [draftStyle, setDraftStyle] = useState<CellStyle>(style);
  const editorRef = useRef<HTMLDivElement>(null);

  const syncEditorFromValue = useCallback((html: string) => {
    if (!editorRef.current) return;
    if (isRichHtml(html)) {
      editorRef.current.innerHTML = sanitizeCellHtml(html);
    } else {
      editorRef.current.textContent = html;
    }
  }, []);

  const getEditorHtml = useCallback(() => {
    if (!editorRef.current) return "";
    const raw = editorRef.current.innerHTML;
    const plain = stripHtml(raw);
    if (!plain && !raw.includes("<span")) return "";
    return sanitizeCellHtml(raw);
  }, []);

  useEffect(() => {
    if (open) {
      setDraftStyle({ ...style });
      requestAnimationFrame(() => syncEditorFromValue(value));
    }
  }, [open, value, style, row, col, syncEditorFromValue]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      editorRef.current?.focus();
    }, 50);

    return () => {
      document.body.style.overflow = prev;
      window.clearTimeout(timer);
    };
  }, [open, row, col]);

  const handleSave = useCallback(() => {
    onSave(getEditorHtml(), draftStyle);
  }, [draftStyle, getEditorHtml, onSave]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, handleSave, onClose]);

  if (!open) return null;

  const cellCss = cellStyleToCss(draftStyle);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="Chiudi editor"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="cell-edit-title"
        className="relative w-full sm:max-w-2xl bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3 shrink-0">
          <div>
            <h2 id="cell-edit-title" className="text-sm font-semibold text-gray-900">
              Cella {colLabel}
              {row + 1}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Seleziona testo per colorarlo · Ctrl+Invio = salva · Esc = annulla
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center shrink-0"
            aria-label="Chiudi"
          >
            ✕
          </button>
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          <CellFormatControls
            style={draftStyle}
            onChange={(updates) => setDraftStyle((prev) => ({ ...prev, ...updates }))}
            editorRef={editorRef}
            onEditorUpdate={() => {}}
          />

          <div>
            <p className="text-xs text-gray-500 mb-1.5">Testo</p>
            <div
              ref={editorRef}
              contentEditable
              suppressContentEditableWarning
              className="w-full min-h-[160px] px-4 py-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 whitespace-pre-wrap break-words"
              style={{
                ...cellCss,
                backgroundColor: draftStyle.backgroundColor,
              }}
              onInput={() => {}}
            />
          </div>
        </div>

        <div className="px-4 py-3 border-t border-gray-100 flex gap-2 justify-end safe-area-pb shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-11 px-4 rounded-xl border border-gray-200 text-gray-700 font-medium touch-manipulation active:bg-gray-50"
          >
            Annulla
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="h-11 px-5 rounded-xl bg-blue-600 text-white font-medium touch-manipulation active:bg-blue-700"
          >
            Applica
          </button>
        </div>
      </div>
    </div>
  );
}
