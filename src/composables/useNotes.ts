const LEGACY_KEY = "notes";
const STORAGE_KEY = "simplepad-content";

type SaveListener = (ok: boolean) => void;

const listeners = new Set<SaveListener>();

export function onSaveResult(listener: SaveListener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function notify(ok: boolean) {
  listeners.forEach((listener) => listener(ok));
}

export function loadNotes(): string {
  try {
    const current = localStorage.getItem(STORAGE_KEY);
    if (current !== null) {
      return current;
    }

    const legacy = localStorage.getItem(LEGACY_KEY);
    if (legacy !== null) {
      localStorage.setItem(STORAGE_KEY, legacy);
      return legacy;
    }
  } catch {
    // Private mode / blocked storage
  }

  return "";
}

export function saveNotes(html: string): boolean {
  try {
    localStorage.setItem(STORAGE_KEY, html);
    notify(true);
    return true;
  } catch {
    notify(false);
    return false;
  }
}

let saveTimer: ReturnType<typeof setTimeout> | null = null;
let pendingHtml: string | null = null;

/** Latest note HTML, including any unsaved debounce buffer. */
export function getLatestNotes(): string {
  return pendingHtml ?? loadNotes();
}

export function saveNotesDebounced(html: string, delay = 250) {
  pendingHtml = html;
  if (saveTimer) {
    clearTimeout(saveTimer);
  }
  saveTimer = setTimeout(() => {
    if (pendingHtml !== null) {
      saveNotes(pendingHtml);
      pendingHtml = null;
    }
    saveTimer = null;
  }, delay);
}

export function flushNotes() {
  if (saveTimer) {
    clearTimeout(saveTimer);
    saveTimer = null;
  }
  if (pendingHtml !== null) {
    saveNotes(pendingHtml);
    pendingHtml = null;
  }
}
