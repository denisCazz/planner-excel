import {
  CELL_PADDING_X,
  CELL_PADDING_Y,
  getEffectiveFontSize,
  getEffectiveFontWeight,
  LINE_HEIGHT_RATIO,
  MIN_ROW_HEIGHT,
  ROW_HEADER_WIDTH,
} from "@/lib/cell-style-utils";
import type { TableData } from "@/types/table";
import { stripHtml } from "@/lib/rich-text-utils";

let canvas: HTMLCanvasElement | null = null;

function getMeasureContext(): CanvasRenderingContext2D | null {
  if (typeof document === "undefined") return null;
  if (!canvas) canvas = document.createElement("canvas");
  return canvas.getContext("2d");
}

function measureLineWidth(text: string, fontSize: number, bold: boolean): number {
  const ctx = getMeasureContext();
  if (!ctx) return text.length * fontSize * 0.6;
  ctx.font = `${bold ? "bold " : ""}${fontSize}px system-ui, -apple-system, sans-serif`;
  return ctx.measureText(text || " ").width;
}

function countWrappedLines(
  text: string,
  colWidth: number,
  fontSize: number,
  bold: boolean
): number {
  const available = colWidth - CELL_PADDING_X;
  if (available <= 0) return Math.max(1, text.split("\n").length);

  let total = 0;
  const paragraphs = text.split("\n");

  for (const paragraph of paragraphs) {
    if (paragraph === "") {
      total += 1;
      continue;
    }

    const words = paragraph.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      total += 1;
      continue;
    }

    let lines = 1;
    let lineWidth = 0;
    const spaceWidth = measureLineWidth(" ", fontSize, bold);

    for (const word of words) {
      const wordWidth = measureLineWidth(word, fontSize, bold);
      if (wordWidth > available) {
        if (lineWidth > 0) {
          lines++;
          lineWidth = 0;
        }
        let chunk = "";
        for (const char of word) {
          const next = chunk + char;
          if (measureLineWidth(next, fontSize, bold) > available && chunk) {
            lines++;
            chunk = char;
          } else {
            chunk = next;
          }
        }
        lineWidth = measureLineWidth(chunk, fontSize, bold);
        continue;
      }

      if (lineWidth === 0) {
        lineWidth = wordWidth;
      } else if (lineWidth + spaceWidth + wordWidth <= available) {
        lineWidth += spaceWidth + wordWidth;
      } else {
        lines++;
        lineWidth = wordWidth;
      }
    }

    total += lines;
  }

  return Math.max(1, total);
}

function measureCellHeight(
  value: string,
  style: TableData["cells"][0][0]["style"],
  colWidth: number
): number {
  const fontSize = getEffectiveFontSize(style);
  const bold = getEffectiveFontWeight(style) === "bold";
  const lineHeight = fontSize * LINE_HEIGHT_RATIO;
  const lineCount = countWrappedLines(stripHtml(value), colWidth, fontSize, bold);
  return Math.max(MIN_ROW_HEIGHT, Math.ceil(lineCount * lineHeight + CELL_PADDING_Y));
}

export function computeAutoDimensions(
  table: TableData,
  containerWidth?: number
): { rowHeights: number[] } {
  const effectiveWidth = containerWidth && containerWidth > 0 ? containerWidth : 900;
  const dataWidth = Math.max(0, effectiveWidth - ROW_HEADER_WIDTH);
  const colWidthPx = table.cols > 0 ? dataWidth / table.cols : dataWidth;

  const rowHeights = Array.from({ length: table.rows }, (_, r) => {
    let maxHeight = MIN_ROW_HEIGHT;
    for (let c = 0; c < table.cols; c++) {
      const cell = table.cells[r][c];
      maxHeight = Math.max(
        maxHeight,
        measureCellHeight(cell.value, cell.style, colWidthPx)
      );
    }
    return maxHeight;
  });

  return { rowHeights };
}
