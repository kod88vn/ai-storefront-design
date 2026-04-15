import type { StorefrontConfig } from "@ai-storefront/types";

const HISTORY_KEY = "studio:config-history";
const HISTORY_INDEX_KEY = "studio:config-history-index";

export const MAX_HISTORY =
  parseInt(process.env.NEXT_PUBLIC_UNDO_STEPS ?? "50", 10) || 50;

export function loadHistory(): StorefrontConfig[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? (JSON.parse(raw) as StorefrontConfig[]) : [];
  } catch {
    return [];
  }
}

export function saveHistory(history: StorefrontConfig[], index: number) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    localStorage.setItem(HISTORY_INDEX_KEY, String(index));
  } catch {
    // Ignore quota/storage errors silently.
  }
}

export function loadHistoryIndex(): number {
  if (typeof window === "undefined") return -1;
  try {
    const raw = localStorage.getItem(HISTORY_INDEX_KEY);
    return raw !== null ? parseInt(raw, 10) : -1;
  } catch {
    return -1;
  }
}
