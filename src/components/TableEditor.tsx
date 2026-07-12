"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Toolbar from "@/components/Toolbar";
import {
  addColumn,
  addRow,
  applyStyleToSelection,
  downloadJson,
  exportToExcel,
  importFromExcel,
  loadFromLocalStorage,
  parseJsonFile,
  removeColumn,
  removeRow,
  saveToLocalStorage,
  updateCell,
} from "@/lib/table-utils";
import type { CellStyle, TableData } from "@/types/table";
import { createEmptyTable, DEFAULT_CELL_STYLE } from "@/types/table";

export default function TableEditor() {
  const [table, setTable] = useState<TableData>(() => createEmptyTable());
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [editingCell, setEditingCell] = useState<{ row: number; col: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const excelInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const editInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved) setTable(saved);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveToLocalStorage(table);
  }, [table, loaded]);

  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingCell]);

  const showMessage = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const activeStyle: CellStyle = selectedCell
    ? table.cells[selectedCell.row][selectedCell.col].style
    : DEFAULT_CELL_STYLE;

  const handleStyleChange = (style: Partial<CellStyle>) => {
    if (!selectedCell) {
      showMessage("Seleziona prima una cella");
      return;
    }
    const key = `${selectedCell.row}-${selectedCell.col}`;
    setTable((prev) => applyStyleToSelection(prev, new Set([key]), style));
  };

  const handleCellClick = (row: number, col: number) => {
    setSelectedCell({ row, col });
  };

  const handleCellDoubleClick = (row: number, col: number) => {
    setEditingCell({ row, col });
    setSelectedCell({ row, col });
  };

  const handleCellBlur = (row: number, col: number, value: string) => {
    setTable((prev) => updateCell(prev, row, col, { value }));
    setEditingCell(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      handleCellBlur(row, col, input.value);
      if (row < table.rows - 1) {
        setSelectedCell({ row: row + 1, col });
      }
    }
    if (e.key === "Tab") {
      e.preventDefault();
      const input = e.target as HTMLInputElement;
      handleCellBlur(row, col, input.value);
      const nextCol = e.shiftKey ? col - 1 : col + 1;
      if (nextCol >= 0 && nextCol < table.cols) {
        setSelectedCell({ row, col: nextCol });
        setEditingCell({ row, col: nextCol });
      }
    }
    if (e.key === "Escape") {
      setEditingCell(null);
    }
  };

  const handleImportExcel = () => excelInputRef.current?.click();
  const handleImportJson = () => jsonInputRef.current?.click();

  const onExcelFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importFromExcel(file);
      setTable(data);
      setSelectedCell(null);
      showMessage("Excel importato con successo!");
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Errore importazione");
    }
    e.target.value = "";
  };

  const onJsonFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await parseJsonFile(file);
      setTable(data);
      setSelectedCell(null);
      showMessage("JSON caricato con successo!");
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Errore importazione");
    }
    e.target.value = "";
  };

  const handleNewTable = () => {
    if (confirm("Vuoi creare una nuova tabella? I dati attuali verranno sostituiti.")) {
      setTable(createEmptyTable());
      setSelectedCell(null);
      showMessage("Nuova tabella creata");
    }
  };

  const colLabel = (index: number) => String.fromCharCode(65 + (index % 26));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-xl shadow">
                📋
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Tabella Semplice</h1>
                <p className="text-sm text-gray-500">Crea tabelle facili come Excel</p>
              </div>
            </div>
            <div className="sm:ml-auto flex-1 sm:max-w-xs">
              <label className="text-xs text-gray-500 font-medium block mb-1">Nome tabella</label>
              <input
                type="text"
                value={table.name}
                onChange={(e) => setTable((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full px-4 py-2.5 text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                placeholder="Dai un nome alla tabella"
              />
            </div>
          </div>
        </div>
      </header>

      {/* Toast message */}
      {message && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-2xl shadow-lg text-sm font-medium animate-fade-in">
          {message}
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 py-4 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
          {/* Tabella */}
          <div className="order-2 lg:order-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Come usare:</span> Tocca una cella per selezionarla, tocca due volte per scrivere.
                  Usa i pulsanti a destra per formattare.
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse min-w-max">
                  <thead>
                    <tr>
                      <th className="w-10 bg-gray-100 border border-gray-200 text-xs text-gray-400 font-normal sticky left-0 z-10" />
                      {Array.from({ length: table.cols }, (_, c) => (
                        <th
                          key={c}
                          className="min-w-[100px] bg-gray-100 border border-gray-200 text-sm font-semibold text-gray-600 py-2 px-2"
                        >
                          {colLabel(c)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.cells.map((row, r) => (
                      <tr key={r}>
                        <td className="bg-gray-100 border border-gray-200 text-center text-xs text-gray-400 font-medium sticky left-0 z-10">
                          {r + 1}
                        </td>
                        {row.map((cell, c) => {
                          const isSelected = selectedCell?.row === r && selectedCell?.col === c;
                          const isEditing = editingCell?.row === r && editingCell?.col === c;
                          return (
                            <td
                              key={c}
                              className={`border border-gray-200 p-0 relative transition-shadow ${
                                isSelected ? "ring-2 ring-blue-500 ring-inset z-[1]" : ""
                              }`}
                              style={{ backgroundColor: cell.style.backgroundColor }}
                              onClick={() => handleCellClick(r, c)}
                              onDoubleClick={() => handleCellDoubleClick(r, c)}
                            >
                              {isEditing ? (
                                <input
                                  ref={editInputRef}
                                  type="text"
                                  defaultValue={cell.value}
                                  className="w-full h-full min-h-[44px] px-3 py-2 text-base bg-transparent outline-none"
                                  style={{
                                    textAlign: cell.style.align,
                                    fontWeight: cell.style.bold ? "bold" : "normal",
                                    fontStyle: cell.style.italic ? "italic" : "normal",
                                    color: cell.style.textColor,
                                  }}
                                  onBlur={(e) => handleCellBlur(r, c, e.target.value)}
                                  onKeyDown={(e) => handleKeyDown(e, r, c)}
                                />
                              ) : (
                                <div
                                  className="min-h-[44px] px-3 py-2 text-base flex items-center cursor-pointer touch-manipulation"
                                  style={{
                                    textAlign: cell.style.align,
                                    fontWeight: cell.style.bold ? "bold" : "normal",
                                    fontStyle: cell.style.italic ? "italic" : "normal",
                                    color: cell.style.textColor,
                                    justifyContent:
                                      cell.style.align === "center"
                                        ? "center"
                                        : cell.style.align === "right"
                                          ? "flex-end"
                                          : "flex-start",
                                  }}
                                >
                                  {cell.value || (
                                    <span className="text-gray-300 text-sm">tocca per scrivere</span>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
                {table.rows} righe × {table.cols} colonne · Salvato automaticamente
              </div>
            </div>
          </div>

          {/* Toolbar */}
          <div className="order-1 lg:order-2">
            <div className="lg:sticky lg:top-24">
              <Toolbar
                activeStyle={activeStyle}
                onStyleChange={handleStyleChange}
                onAddRow={() => setTable((prev) => addRow(prev))}
                onAddColumn={() => setTable((prev) => addColumn(prev))}
                onRemoveRow={() => {
                  if (selectedCell) {
                    setTable((prev) => removeRow(prev, selectedCell.row));
                    setSelectedCell(null);
                  } else {
                    setTable((prev) => removeRow(prev, prev.rows - 1));
                  }
                }}
                onRemoveColumn={() => {
                  if (selectedCell) {
                    setTable((prev) => removeColumn(prev, selectedCell.col));
                    setSelectedCell(null);
                  } else {
                    setTable((prev) => removeColumn(prev, prev.cols - 1));
                  }
                }}
                onImportExcel={handleImportExcel}
                onImportJson={handleImportJson}
                onExportExcel={() => {
                  exportToExcel(table);
                  showMessage("Excel scaricato!");
                }}
                onExportJson={() => {
                  downloadJson(table);
                  showMessage("JSON scaricato!");
                }}
                onNewTable={handleNewTable}
                hasSelection={selectedCell !== null}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Hidden file inputs */}
      <input ref={excelInputRef} type="file" accept=".xlsx,.xls" className="hidden" onChange={onExcelFile} />
      <input ref={jsonInputRef} type="file" accept=".json" className="hidden" onChange={onJsonFile} />
    </div>
  );
}
