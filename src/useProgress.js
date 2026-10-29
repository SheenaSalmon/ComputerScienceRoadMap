import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "cs-roadmap-progress-v1";

// Restore the browser-local set of completed skill ids. Invalid or unavailable
// storage starts with empty progress so the app remains usable for this session.
const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return new Set(Array.isArray(saved) ? saved : []);
  } catch {
    return new Set();
  }
};

// Owns progress persistence and portable backup behavior. The Set representation
// gives callers constant-time membership checks and avoids duplicate skill ids.
export default function useProgress() {
  const [completed, setCompleted] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
    } catch {
      // Storage may be unavailable or full; in-memory React state still works
      // until the page is closed.
    }
  }, [completed]);

  // The storage event fires in other tabs when browser storage changes, not in
  // the tab that made the write. Re-read this app's key to refresh this tab.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) setCompleted(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const toggle = useCallback((id) => {
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const reset = useCallback(() => setCompleted(new Set()), []);

  // Include a format version and timestamp so exported backups can evolve safely.
  const exportData = useCallback(
    () => JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), completed: [...completed] }, null, 2),
    [completed],
  );

  // Accept both the current object format and legacy arrays. Unknown ids are
  // discarded, valid ids merge into progress, and -1 signals malformed input.
  const importData = useCallback((text, validIds) => {
    try {
      const parsed = JSON.parse(text);
      const ids = Array.isArray(parsed) ? parsed : parsed?.completed;
      if (!Array.isArray(ids)) return -1;
      const known = ids.filter((id) => typeof id === "string" && validIds.has(id));
      setCompleted((current) => new Set([...current, ...known]));
      return known.length;
    } catch {
      return -1;
    }
  }, []);

  return { completed, toggle, reset, exportData, importData };
}
