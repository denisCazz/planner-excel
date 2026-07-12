import type { TableData } from "@/types/table";

export type TableSelection =
  | { type: "cell"; row: number; col: number }
  | { type: "row"; row: number }
  | { type: "column"; col: number };

export function getSelectionKeys(
  selection: TableSelection | null,
  table: TableData
): Set<string> {
  if (!selection) return new Set();

  if (selection.type === "cell") {
    return new Set([`${selection.row}-${selection.col}`]);
  }

  if (selection.type === "row") {
    return new Set(
      Array.from({ length: table.cols }, (_, c) => `${selection.row}-${c}`)
    );
  }

  return new Set(
    Array.from({ length: table.rows }, (_, r) => `${r}-${selection.col}`)
  );
}

export function isCellInSelection(
  row: number,
  col: number,
  selection: TableSelection | null
): boolean {
  if (!selection) return false;
  if (selection.type === "cell") {
    return selection.row === row && selection.col === col;
  }
  if (selection.type === "row") return selection.row === row;
  return selection.col === col;
}

export function getSelectionLabel(selection: TableSelection | null): string | null {
  if (!selection) return null;
  if (selection.type === "cell") {
    return `Cella ${selection.row + 1}, ${String.fromCharCode(65 + selection.col)}`;
  }
  if (selection.type === "row") return `Riga ${selection.row + 1}`;
  return `Colonna ${String.fromCharCode(65 + selection.col)}`;
}
