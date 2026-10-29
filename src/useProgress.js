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

  return { completed, toggle, reset };
}
