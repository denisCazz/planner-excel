"use client";

import type { SavedFileMeta } from "@/lib/file-storage";

interface OpenFileModalProps {
  open: boolean;
  files: SavedFileMeta[];
  onOpen: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  onClose?: () => void;
  required?: boolean;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function OpenFileModal({
  open,
  files,
  onOpen,
  onNew,
  onDelete,
  onClose,
  required,
}: OpenFileModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {!required && onClose && (
        <button
          type="button"
          className="absolute inset-0 bg-black/45"
          aria-label="Chiudi"
          onClick={onClose}
        />
      )}
      {required && <div className="absolute inset-0 bg-black/45" />}

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="open-file-title"
        className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200 max-h-[85vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
          <div>
            <h2 id="open-file-title" className="text-base font-semibold text-gray-900">
              Apri tabella
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Scegli un file salvato o creane uno nuovo
            </p>
          </div>
          {!required && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-gray-100 text-gray-600 flex items-center justify-center"
              aria-label="Chiudi"
            >
              ✕
            </button>
          )}
        </div>

        <div className="p-4 overflow-y-auto flex-1 space-y-2">
          {files.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-6">Nessun file salvato</p>
          ) : (
            files.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-2 p-3 rounded-xl border border-gray-200 hover:border-blue-300 hover:bg-blue-50/50 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => onOpen(file.id)}
                  className="flex-1 text-left min-w-0 touch-manipulation"
                >
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">Salvato {formatDate(file.updatedAt)}</p>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Eliminare "${file.name}"?`)) onDelete(file.id);
                  }}
                  className="shrink-0 w-9 h-9 rounded-lg text-red-500 hover:bg-red-50 touch-manipulation"
                  aria-label={`Elimina ${file.name}`}
                  title="Elimina"
                >
                  🗑
                </button>
              </div>
            ))
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-100 safe-area-pb">
          <button
            type="button"
            onClick={onNew}
            className="w-full h-11 rounded-xl bg-blue-600 text-white font-medium touch-manipulation active:bg-blue-700"
          >
            Nuova tabella
          </button>
        </div>
      </div>
    </div>
  );
}
