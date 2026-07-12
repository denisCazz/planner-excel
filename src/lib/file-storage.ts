import { normalizeTable } from "@/lib/table-utils";
import type { TableData } from "@/types/table";
import { createEmptyTable } from "@/types/table";

const INDEX_KEY = "tabella-semplice-index";
const ACTIVE_KEY = "tabella-semplice-active";
const FILE_PREFIX = "tabella-semplice-file:";
const LEGACY_KEY = "tabella-semplice-data";

export interface SavedFileMeta {
  id: string;
  name: string;
  updatedAt: string;
}

function readIndex(): SavedFileMeta[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as SavedFileMeta[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeIndex(index: SavedFileMeta[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(INDEX_KEY, JSON.stringify(index));
}

function fileKey(id: string): string {
  return `${FILE_PREFIX}${id}`;
}

function newFileId(): string {
  return `f_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function migrateLegacyStorage(): void {
  if (typeof window === "undefined") return;
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (!legacy) return;

  try {
    const data = normalizeTable(JSON.parse(legacy) as TableData);
    const id = newFileId();
    localStorage.setItem(fileKey(id), JSON.stringify(data));
    writeIndex([
      {
        id,
        name: data.name,
        updatedAt: data.updatedAt,
      },
    ]);
    localStorage.setItem(ACTIVE_KEY, id);
    localStorage.removeItem(LEGACY_KEY);
  } catch {
    localStorage.removeItem(LEGACY_KEY);
  }
}

export function listSavedFiles(): SavedFileMeta[] {
  return readIndex().sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export function getActiveFileId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_KEY);
}

export function setActiveFileId(id: string): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(ACTIVE_KEY, id);
}

export function loadSavedFile(id: string): TableData | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem(fileKey(id));
  if (!raw) return null;
  try {
    return normalizeTable(JSON.parse(raw) as TableData);
  } catch {
    return null;
  }
}

export function saveFile(id: string, data: TableData): void {
  if (typeof window === "undefined") return;

  const payload: TableData = {
    ...data,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(fileKey(id), JSON.stringify(payload));

  const index = readIndex();
  const existing = index.find((f) => f.id === id);
  const meta: SavedFileMeta = {
    id,
    name: payload.name,
    updatedAt: payload.updatedAt,
  };

  if (existing) {
    writeIndex(index.map((f) => (f.id === id ? meta : f)));
  } else {
    writeIndex([meta, ...index]);
  }

  setActiveFileId(id);
}

export function createNewFile(name = "La mia tabella"): { id: string; data: TableData } {
  const id = newFileId();
  const data = createEmptyTable(5, 4, name);
  saveFile(id, data);
  return { id, data };
}

export function deleteSavedFile(id: string): void {
  if (typeof window === "undefined") return;

  localStorage.removeItem(fileKey(id));
  writeIndex(readIndex().filter((f) => f.id !== id));

  if (getActiveFileId() === id) {
    localStorage.removeItem(ACTIVE_KEY);
  }
}

export function loadInitialSession(): {
  kind: "ready";
  fileId: string;
  data: TableData;
} | {
  kind: "choose";
  files: SavedFileMeta[];
} | {
  kind: "empty";
  fileId: string;
  data: TableData;
} {
  migrateLegacyStorage();

  const files = listSavedFiles();
  const activeId = getActiveFileId();

  if (activeId) {
    const data = loadSavedFile(activeId);
    if (data) return { kind: "ready", fileId: activeId, data };
  }

  if (files.length > 0) {
    return { kind: "choose", files };
  }

  const created = createNewFile();
  return { kind: "empty", fileId: created.id, data: created.data };
}
