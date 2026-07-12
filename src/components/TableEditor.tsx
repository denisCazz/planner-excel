"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AlignBar from "@/components/AlignBar";
import CellContent from "@/components/CellContent";
import CellEditModal from "@/components/CellEditModal";
import MobileToolsBar from "@/components/MobileToolsBar";
import Toolbar from "@/components/Toolbar";
import type { ToolbarSection } from "@/components/Toolbar";
import { cellStyleToCss, ROW_HEADER_WIDTH } from "@/lib/cell-style-utils";
import { computeAutoDimensions } from "@/lib/measure-utils";
import {
  getSelectionKeys,
  getSelectionLabel,
  isCellInSelection,
  type TableSelection,
} from "@/lib/selection-utils";
import {
  addColumn,
  addRow,
  applyStyleToSelection,
  downloadJson,
  exportToExcel,
  importSpreadsheet,
  loadFromLocalStorage,
  parseJsonFile,
  removeColumn,
  removeRow,
  saveToLocalStorage,
  updateCell,
} from "@/lib/table-utils";
import type { CellStyle, TableData, TextAlign } from "@/types/table";
import { createEmptyTable, DEFAULT_CELL_STYLE } from "@/types/table";

export default function TableEditor() {
  const [table, setTable] = useState<TableData>(() => createEmptyTable());
  const [selection, setSelection] = useState<TableSelection | null>(null);
  const [editModal, setEditModal] = useState<{ row: number; col: number } | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const [mobilePanel, setMobilePanel] = useState<ToolbarSection | null>(null);
  const spreadsheetInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const el = tableContainerRef.current;
    if (!el) return;

    const updateWidth = () => setContainerWidth(el.clientWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const dimensions = useMemo(
    () => computeAutoDimensions(table, containerWidth || undefined),
    [table, containerWidth]
  );

  const selectionKeys = useMemo(
    () => getSelectionKeys(selection, table),
    [selection, table]
  );

  useEffect(() => {
    const saved = loadFromLocalStorage();
    if (saved) setTable(saved);
    setLoaded(true);
  }, []);

  useEffect(() => {
    if (loaded) saveToLocalStorage(table);
  }, [table, loaded]);

  const showMessage = useCallback((msg: string) => {
    setMessage(msg);
    setTimeout(() => setMessage(null), 3000);
  }, []);

  const activeStyle: CellStyle = useMemo(() => {
    if (!selection) return DEFAULT_CELL_STYLE;
    const firstKey = selectionKeys.values().next().value;
    if (!firstKey) return DEFAULT_CELL_STYLE;
    const [row, col] = firstKey.split("-").map(Number);
    return table.cells[row][col].style;
  }, [selection, selectionKeys, table]);

  const handleAlignChange = (align: TextAlign) => {
    if (selectionKeys.size === 0) {
      showMessage("Seleziona una cella, riga o colonna");
      return;
    }
    setTable((prev) => applyStyleToSelection(prev, selectionKeys, { align }));
  };

  const openCellEditor = (row: number, col: number) => {
    setSelection({ type: "cell", row, col });
    setEditModal({ row, col });
  };

  const handleCellClick = (row: number, col: number) => {
    openCellEditor(row, col);
  };

  const handleRowHeaderClick = (row: number) => {
    setSelection({ type: "row", row });
    setEditModal(null);
  };

  const handleColumnHeaderClick = (col: number) => {
    setSelection({ type: "column", col });
    setEditModal(null);
  };

  const saveCell = (row: number, col: number, value: string, style: CellStyle) => {
    setTable((prev) => updateCell(prev, row, col, { value, style }));
    setEditModal(null);
  };

  const handleImportSpreadsheet = () => spreadsheetInputRef.current?.click();
  const handleImportJson = () => jsonInputRef.current?.click();

  const onSpreadsheetFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isOds = /\.ods$/i.test(file.name);
    try {
      const data = await importSpreadsheet(file);
      setTable(data);
      setSelection(null);
      setEditModal(null);
      showMessage(isOds ? "ODS importato con successo!" : "Excel importato con successo!");
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
      setSelection(null);
      setEditModal(null);
      showMessage("JSON caricato con successo!");
    } catch (err) {
      showMessage(err instanceof Error ? err.message : "Errore importazione");
    }
    e.target.value = "";
  };

  const handleNewTable = () => {
    if (confirm("Vuoi creare una nuova tabella? I dati attuali verranno sostituiti.")) {
      setTable(createEmptyTable());
      setSelection(null);
      setEditModal(null);
      showMessage("Nuova tabella creata");
    }
  };

  const selectedRowIndex =
    selection?.type === "row"
      ? selection.row
      : selection?.type === "cell"
        ? selection.row
        : null;
  const selectedColIndex =
    selection?.type === "column"
      ? selection.col
      : selection?.type === "cell"
        ? selection.col
        : null;

  const toolbarProps = {
    onAddRow: () => {
      const afterIndex =
        selection?.type === "row"
          ? selection.row
          : selection?.type === "cell"
            ? selection.row
            : undefined;
      setTable((prev) => addRow(prev, afterIndex));
    },
    onAddColumn: () => setTable((prev) => addColumn(prev)),
    onRemoveRow: () => {
      if (selection?.type === "row") {
        setTable((prev) => removeRow(prev, selection.row));
        setSelection(null);
      } else if (selection?.type === "cell") {
        setTable((prev) => removeRow(prev, selection.row));
        setSelection(null);
      } else {
        setTable((prev) => removeRow(prev, prev.rows - 1));
      }
    },
    onRemoveColumn: () => {
      if (selection?.type === "column") {
        setTable((prev) => removeColumn(prev, selection.col));
        setSelection(null);
      } else if (selection?.type === "cell") {
        setTable((prev) => removeColumn(prev, selection.col));
        setSelection(null);
      } else {
        setTable((prev) => removeColumn(prev, prev.cols - 1));
      }
    },
    onImportExcel: handleImportSpreadsheet,
    onImportOds: handleImportSpreadsheet,
    onImportJson: handleImportJson,
    onExportExcel: () => {
      exportToExcel(table);
      showMessage("Excel scaricato!");
    },
    onExportJson: () => {
      downloadJson(table);
      showMessage("JSON scaricato!");
    },
    onNewTable: handleNewTable,
  };

  const colLabel = (index: number) => String.fromCharCode(65 + (index % 26));
  const selectionLabel = getSelectionLabel(selection);
  const modalCell = editModal ? table.cells[editModal.row][editModal.col] : null;

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-b from-slate-50 to-blue-50">
      <div className="sticky top-0 z-40 w-full bg-white shadow-sm">
        <header className="border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-3 sm:px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white text-lg sm:text-xl shadow shrink-0">
                📋
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-base sm:text-xl font-bold text-gray-900 truncate">Tabella Semplice</h1>
                <input
                  type="text"
                  value={table.name}
                  onChange={(e) => setTable((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full mt-0.5 px-2 py-1 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                  placeholder="Nome tabella"
                />
              </div>
            </div>
          </div>
        </header>

        <AlignBar
          activeAlign={activeStyle.align}
          onAlignChange={handleAlignChange}
          hasSelection={selection !== null}
          selectionLabel={selectionLabel}
        />
      </div>

      {message && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-2.5 rounded-2xl shadow-lg text-sm font-medium animate-fade-in max-w-[90vw] text-center">
          {message}
        </div>
      )}

      <main className="max-w-7xl mx-auto w-full px-3 sm:px-4 py-3 pb-28 lg:pb-6">
        <div className="hidden lg:block mb-3">
          <Toolbar {...toolbarProps} layout="horizontal" />
        </div>

        <div ref={tableContainerRef} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden w-full">
          <div className="px-3 sm:px-4 py-2 border-b border-gray-100 bg-gray-50">
            <p className="text-xs sm:text-sm text-gray-600">
              <span className="font-medium">Uso:</span> Tocca cella → popup per testo e colori.
              Allinea dalla barra sopra. Intestazione riga/colonna = seleziona per allineare o eliminare.
            </p>
          </div>
          <div className="w-full">
            <table className="w-full border-collapse table-fixed">
              <colgroup>
                <col style={{ width: ROW_HEADER_WIDTH }} />
                {Array.from({ length: table.cols }, (_, c) => (
                  <col key={c} />
                ))}
              </colgroup>
              <thead>
                <tr>
                  <th className="bg-gray-100 border border-gray-200 text-xs text-gray-400 font-normal sticky left-0 z-10" />
                  {Array.from({ length: table.cols }, (_, c) => (
                    <th
                      key={c}
                      onClick={() => handleColumnHeaderClick(c)}
                      className={`bg-gray-100 border border-gray-200 text-sm font-semibold py-2 px-2 cursor-pointer touch-manipulation transition-colors ${
                        selection?.type === "column" && selection.col === c
                          ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-inset"
                          : selectedColIndex === c
                            ? "text-blue-600"
                            : "text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {colLabel(c)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {table.cells.map((row, r) => (
                  <tr key={r} style={{ minHeight: dimensions.rowHeights[r] }}>
                    <td
                      onClick={() => handleRowHeaderClick(r)}
                      className={`border border-gray-200 text-center text-xs font-medium sticky left-0 z-10 align-top py-2 cursor-pointer touch-manipulation transition-colors ${
                        selection?.type === "row" && selection.row === r
                          ? "bg-blue-100 text-blue-700 ring-2 ring-blue-500 ring-inset"
                          : selectedRowIndex === r
                            ? "bg-blue-50 text-blue-600"
                            : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                      }`}
                    >
                      {r + 1}
                    </td>
                    {row.map((cell, c) => {
                      const inSelection = isCellInSelection(r, c, selection);
                      const isPrimaryCell =
                        selection?.type === "cell" &&
                        selection.row === r &&
                        selection.col === c;
                      const cellCss = cellStyleToCss(cell.style);
                      const rowMinHeight = dimensions.rowHeights[r];

                      return (
                        <td
                          key={c}
                          className={`border border-gray-200 p-0 relative transition-shadow align-top ${
                            isPrimaryCell
                              ? "ring-2 ring-blue-500 ring-inset z-[1]"
                              : inSelection
                                ? "bg-blue-50/80"
                                : ""
                          }`}
                          style={{
                            backgroundColor: inSelection && !isPrimaryCell
                              ? undefined
                              : cell.style.backgroundColor,
                            minHeight: rowMinHeight,
                            wordBreak: "break-word",
                            overflowWrap: "break-word",
                          }}
                          onClick={() => handleCellClick(r, c)}
                        >
                          <div
                            className="px-3 py-2 cursor-pointer touch-manipulation"
                            style={{ minHeight: rowMinHeight - 2 }}
                          >
                            <CellContent value={cell.value} style={cellCss} />
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-3 sm:px-4 py-2 border-t border-gray-100 bg-gray-50 text-xs text-gray-400">
            {table.rows} righe × {table.cols} colonne
            {selectionLabel ? ` · ${selectionLabel} selezionata` : ""} · Salvato automaticamente
          </div>
        </div>
      </main>

      {editModal && modalCell && (
        <CellEditModal
          open
          row={editModal.row}
          col={editModal.col}
          colLabel={colLabel(editModal.col)}
          value={modalCell.value}
          style={modalCell.style}
          onSave={(value, style) => saveCell(editModal.row, editModal.col, value, style)}
          onClose={() => setEditModal(null)}
        />
      )}

      <MobileToolsBar
        {...toolbarProps}
        openPanel={mobilePanel}
        onOpenPanel={setMobilePanel}
      />

      <input
        ref={spreadsheetInputRef}
        type="file"
        accept=".xlsx,.xls,.ods,application/vnd.oasis.opendocument.spreadsheet"
        className="hidden"
        onChange={onSpreadsheetFile}
      />
      <input ref={jsonInputRef} type="file" accept=".json" className="hidden" onChange={onJsonFile} />
    </div>
  );
}
