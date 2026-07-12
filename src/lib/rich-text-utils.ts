const ALLOWED_TAGS = new Set(["SPAN", "BR", "B", "STRONG", "I", "EM"]);

export function isRichHtml(value: string): boolean {
  return /<[a-z][\s\S]*>/i.test(value);
}

export function stripHtml(value: string): string {
  if (!value) return "";
  if (typeof document === "undefined") {
    return value.replace(/<[^>]+>/g, "").replace(/&nbsp;/g, " ");
  }
  const div = document.createElement("div");
  div.innerHTML = value;
  return div.textContent ?? "";
}

export function sanitizeCellHtml(html: string): string {
  if (!html || typeof document === "undefined") return html;

  const container = document.createElement("div");
  container.innerHTML = html;

  const walk = (node: Node): void => {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as HTMLElement;
      if (!ALLOWED_TAGS.has(el.tagName)) {
        const parent = el.parentNode;
        while (el.firstChild) parent?.insertBefore(el.firstChild, el);
        parent?.removeChild(el);
        return;
      }
      const allowedStyle = el.style.color ? `color: ${el.style.color}` : "";
      el.removeAttribute("class");
      el.removeAttribute("id");
      [...el.attributes].forEach((attr) => {
        if (attr.name !== "style") el.removeAttribute(attr.name);
      });
      if (allowedStyle) {
        el.setAttribute("style", allowedStyle);
      } else {
        el.removeAttribute("style");
      }
    }
    [...node.childNodes].forEach(walk);
  };

  [...container.childNodes].forEach(walk);
  return container.innerHTML;
}

export function isEmptyCellValue(value: string): boolean {
  return stripHtml(value).trim() === "" && !/<img|video/i.test(value);
}

export function applyColorToDomSelection(color: string): boolean {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return false;

  const range = selection.getRangeAt(0);
  const span = document.createElement("span");
  span.style.color = color;

  try {
    range.surroundContents(span);
  } catch {
    const fragment = range.extractContents();
    span.appendChild(fragment);
    range.insertNode(span);
  }

  selection.removeAllRanges();
  return true;
}
