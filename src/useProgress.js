import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "cs-roadmap-progress-v1";

const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return new Set(Array.isArray(saved) ? saved : []);
  } catch {
    return new Set();
  }
};

// Completed skill ids persisted in localStorage (kept in sync across browser tabs)
export default function useProgress() {
  const [completed, setCompleted] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...completed]));
    } catch {
      // Storage can be unavailable (private mode, quota); progress then lasts for the session only
    }
  }, [completed]);

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

  const exportData = useCallback(
    () => JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), completed: [...completed] }, null, 2),
    [completed],
  );

  // Merges imported ids into current progress; returns how many ids were read, or -1 if the file is invalid
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
