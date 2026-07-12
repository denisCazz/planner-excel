"use client";

import { isEmptyCellValue, isRichHtml, sanitizeCellHtml } from "@/lib/rich-text-utils";
import type { CSSProperties } from "react";

interface CellContentProps {
  value: string;
  style?: CSSProperties;
  placeholder?: string;
}

export default function CellContent({ value, style, placeholder = "tocca per scrivere" }: CellContentProps) {
  if (isEmptyCellValue(value)) {
    return <span className="text-gray-300 text-sm">{placeholder}</span>;
  }

  if (isRichHtml(value)) {
    return (
      <div
        className="whitespace-pre-wrap break-words"
        style={style}
        dangerouslySetInnerHTML={{ __html: sanitizeCellHtml(value) }}
      />
    );
  }

  return (
    <div className="whitespace-pre-wrap break-words" style={style}>
      {value}
    </div>
  );
}
