import * as XLSX from "xlsx";
import type { Cell, CellStyle, TableData } from "@/types/table";
import { createEmptyCell, createEmptyTable, DEFAULT_CELL_STYLE } from "@/types/table";
import { stripHtml } from "@/lib/rich-text-utils";

const LEGACY_STORAGE_KEY = "tabella-semplice-data";

/** @deprecated Use file-storage saveFile */
export function saveToLocalStorage(data: TableData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(LEGACY_STORAGE_KEY, JSON.stringify(data));
}

/** @deprecated Use file-storage loadSavedFile */
export function loadFromLocalStorage(): TableData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(LEGACY_STORAGE_KEY);
  if (!raw) return null;
  try {
    return normalizeTable(JSON.parse(raw) as TableData);
  } catch {
    return null;
  }
}

export function downloadJson(data: TableData): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${sanitizeFilename(data.name)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function parseJsonFile(file: File): Promise<TableData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as TableData;
        resolve(normalizeTable(data));
      } catch {
        reject(new Error("File JSON non valido"));
      }
    };
    reader.onerror = () => reject(new Error("Errore nella lettura del file"));
    reader.readAsText(file);
  });
}

export function exportToExcel(data: TableData): void {
  const wsData: (string | number)[][] = data.cells.map((row) =>
    row.map((cell) => stripHtml(cell.value))
  );
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  data.cells.forEach((row, r) => {
    row.forEach((cell, c) => {
      const ref = XLSX.utils.encode_cell({ r, c });
      if (!ws[ref]) ws[ref] = { t: "s", v: cell.value };
      const s = cell.style;
      const style: Record<string, unknown> = {};
      if (s.bold) style.font = { ...(style.font as object), bold: true };
      if (s.italic) style.font = { ...(style.font as object), italic: true };
      const fontSize = s.textVariant === "heading" ? Math.max(s.fontSize, 18) : s.fontSize;
      if (fontSize !== DEFAULT_CELL_STYLE.fontSize || s.textVariant === "heading") {
        style.font = { ...(style.font as object), sz: fontSize };
      }
      if (s.textVariant === "heading") {
        style.font = { ...(style.font as object), bold: true };
      }
      if (s.align !== "left") {
        style.alignment = { horizontal: s.align };
      }
      if (s.textColor !== DEFAULT_CELL_STYLE.textColor) {
        style.font = { ...(style.font as object), color: { rgb: hexToRgb(s.textColor) } };
      }
      if (s.backgroundColor !== DEFAULT_CELL_STYLE.backgroundColor) {
        style.fill = { fgColor: { rgb: hexToRgb(s.backgroundColor) } };
      }
      if (Object.keys(style).length > 0) {
        ws[ref].s = style;
      }
    });
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, data.name.slice(0, 31) || "Tabella");
  XLSX.writeFile(wb, `${sanitizeFilename(data.name)}.xlsx`);
}

export function importSpreadsheet(file: File): Promise<TableData> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const wb = XLSX.read(data, { type: "array", cellStyles: true });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<(string | number)[]>(ws, {
          header: 1,
          defval: "",
          raw: false,
        });

        const rows = Math.max(jsonData.length, 1);
        const cols = Math.max(...jsonData.map((r) => r.length), 1);

        const cells: Cell[][] = Array.from({ length: rows }, (_, r) =>
          Array.from({ length: cols }, (_, c) => {
            const cell = createEmptyCell();
            const val = jsonData[r]?.[c];
            cell.value = val != null ? String(val) : "";
            const xlsxCell = ws[XLSX.utils.encode_cell({ r, c })];
            if (xlsxCell?.s) {
              applyXlsxStyle(cell.style, xlsxCell.s);
            }
            return cell;
          })
        );

        const name = file.name.replace(/\.(xlsx|xls|ods)$/i, "") || "Tabella importata";
        resolve({
          name,
          rows,
          cols,
          cells,
          updatedAt: new Date().toISOString(),
        });
      } catch {
        reject(new Error("File non valido (supportati: Excel e ODS)"));
      }
    };
    reader.onerror = () => reject(new Error("Errore nella lettura del file"));
    reader.readAsArrayBuffer(file);
  });
}

/** @deprecated Use importSpreadsheet */
export const importFromExcel = importSpreadsheet;

function applyXlsxStyle(style: CellStyle, s: Record<string, unknown>): void {
  const font = s.font as Record<string, unknown> | undefined;
  if (font?.bold) style.bold = true;
  if (font?.italic) style.italic = true;
  const sz = font?.sz as number | undefined;
  if (sz) {
    style.fontSize = sz;
    if (sz >= 18) style.textVariant = "heading";
  }
  const align = (s.alignment as Record<string, string> | undefined)?.horizontal;
  if (align === "center" || align === "right" || align === "left") {
    style.align = align;
  }
  const color = (font?.color as Record<string, string> | undefined)?.rgb;
  if (color) style.textColor = rgbToHex(color);
  const fill = (s.fill as Record<string, unknown> | undefined)?.fgColor as
    | Record<string, string>
    | undefined;
  if (fill?.rgb) style.backgroundColor = rgbToHex(fill.rgb);
}

function hexToRgb(hex: string): string {
  return hex.replace("#", "").padStart(6, "0").toUpperCase();
}

function rgbToHex(rgb: string): string {
  const clean = rgb.replace(/[^0-9A-Fa-f]/g, "").slice(-6).padStart(6, "0");
  return `#${clean}`;
}

function sanitizeFilename(name: string): string {
  return name.replace(/[^a-zA-Z0-9àèéìòùÀÈÉÌÒÙ\s_-]/g, "").trim() || "tabella";
}

export function normalizeTable(data: TableData): TableData {
  if (!data.cells || !Array.isArray(data.cells)) {
    return createEmptyTable();
  }
  const rows = data.rows || data.cells.length;
  const cols = data.cols || data.cells[0]?.length || 4;
  const cells: Cell[][] = Array.from({ length: rows }, (_, r) =>
    Array.from({ length: cols }, (_, c) => {
      const existing = data.cells[r]?.[c];
      if (existing) {
        return {
          value: existing.value ?? "",
          style: { ...DEFAULT_CELL_STYLE, ...existing.style },
        };
      }
      return createEmptyCell();
    })
  );
  return {
    name: data.name || "La mia tabella",
    rows,
    cols,
    cells,
    updatedAt: new Date().toISOString(),
  };
}

export function addRow(data: TableData, afterIndex?: number): TableData {
  const newRow = Array.from({ length: data.cols }, () => createEmptyCell());
  const insertAt =
    afterIndex !== undefined
      ? Math.min(Math.max(afterIndex + 1, 0), data.rows)
      : data.rows;
  const cells = [
    ...data.cells.slice(0, insertAt),
    newRow,
    ...data.cells.slice(insertAt),
  ];
  return {
    ...data,
    rows: data.rows + 1,
    cells,
    updatedAt: new Date().toISOString(),
  };
}

export function addColumn(data: TableData): TableData {
  return {
    ...data,
    cols: data.cols + 1,
    cells: data.cells.map((row) => [...row, createEmptyCell()]),
    updatedAt: new Date().toISOString(),
  };
}

export function removeRow(data: TableData, index: number): TableData {
  if (data.rows <= 1) return data;
  return {
    ...data,
    rows: data.rows - 1,
    cells: data.cells.filter((_, i) => i !== index),
    updatedAt: new Date().toISOString(),
  };
}

export function removeColumn(data: TableData, index: number): TableData {
  if (data.cols <= 1) return data;
  return {
    ...data,
    cols: data.cols - 1,
    cells: data.cells.map((row) => row.filter((_, i) => i !== index)),
    updatedAt: new Date().toISOString(),
  };
}

export function updateCell(
  data: TableData,
  row: number,
  col: number,
  updates: Partial<Cell>
): TableData {
  const newCells = data.cells.map((r, ri) =>
    r.map((c, ci) => {
      if (ri === row && ci === col) {
        return {
          value: updates.value !== undefined ? updates.value : c.value,
          style: updates.style ? { ...c.style, ...updates.style } : c.style,
        };
      }
      return c;
    })
  );
  return { ...data, cells: newCells, updatedAt: new Date().toISOString() };
}

export function applyStyleToSelection(
  data: TableData,
  selectedCells: Set<string>,
  styleUpdates: Partial<CellStyle>
): TableData {
  const newCells = data.cells.map((row, r) =>
    row.map((cell, c) => {
      if (selectedCells.has(`${r}-${c}`)) {
        return { ...cell, style: { ...cell.style, ...styleUpdates } };
      }
      return cell;
    })
  );
  return { ...data, cells: newCells, updatedAt: new Date().toISOString() };
}
