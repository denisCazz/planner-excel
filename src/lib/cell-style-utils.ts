import type { CSSProperties } from "react";
import type { CellStyle } from "@/types/table";
import { DEFAULT_CELL_STYLE } from "@/types/table";

export const ROW_HEADER_WIDTH = 44;
export const CELL_PADDING_X = 24;
export const CELL_PADDING_Y = 16;
export const MIN_COL_WIDTH = 72;
export const MAX_COL_WIDTH = 220;
export const MIN_ROW_HEIGHT = 44;
export const LINE_HEIGHT_RATIO = 1.4;

export function getEffectiveFontSize(style: CellStyle): number {
  if (style.textVariant === "heading") {
    return style.fontSize >= 16 ? style.fontSize : 18;
  }
  return style.fontSize || DEFAULT_CELL_STYLE.fontSize;
}

export function getEffectiveFontWeight(style: CellStyle): "normal" | "bold" {
  if (style.textVariant === "heading") return "bold";
  return style.bold ? "bold" : "normal";
}

export function cellStyleToCss(style: CellStyle): CSSProperties {
  const fontSize = getEffectiveFontSize(style);
  return {
    textAlign: style.align,
    fontWeight: getEffectiveFontWeight(style),
    fontStyle: style.italic ? "italic" : "normal",
    color: style.textColor,
    fontSize: `${fontSize}px`,
    lineHeight: LINE_HEIGHT_RATIO,
    whiteSpace: "pre-wrap",
  };
}
