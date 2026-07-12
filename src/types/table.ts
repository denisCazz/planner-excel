export type TextAlign = "left" | "center" | "right";
export type TextVariant = "paragraph" | "heading";

export interface CellStyle {
  bold: boolean;
  italic: boolean;
  align: TextAlign;
  textColor: string;
  backgroundColor: string;
  fontSize: number;
  textVariant: TextVariant;
}

export interface Cell {
  value: string;
  style: CellStyle;
}

export interface TableData {
  name: string;
  rows: number;
  cols: number;
  cells: Cell[][];
  updatedAt: string;
}

export const DEFAULT_CELL_STYLE: CellStyle = {
  bold: false,
  italic: false,
  align: "left",
  textColor: "#1a1a1a",
  backgroundColor: "#ffffff",
  fontSize: 14,
  textVariant: "paragraph",
};

export const FONT_SIZE_OPTIONS = [12, 14, 16, 18, 20, 24] as const;

export function createEmptyCell(): Cell {
  return { value: "", style: { ...DEFAULT_CELL_STYLE } };
}

export function createEmptyTable(rows = 5, cols = 4, name = "La mia tabella"): TableData {
  const cells: Cell[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => createEmptyCell())
  );
  return {
    name,
    rows,
    cols,
    cells,
    updatedAt: new Date().toISOString(),
  };
}
