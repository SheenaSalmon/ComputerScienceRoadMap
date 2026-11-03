import { useCallback, useEffect, useState } from "react";

// Quiz results live under their own versioned key, separate from skill progress,
// so a quiz change can never corrupt the completed-skills list.
const STORAGE_KEY = "cs-roadmap-quiz-v1";

// Shape: { levels: { "<trackId>::<level>": { best, attempts, passed, lastAt } } }
const load = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && typeof saved.levels === "object" && saved.levels ? saved.levels : {};
  } catch {
    return {};
  }
};

const keyFor = (trackId, level) => `${trackId}::${level}`;

// Persists the best score, attempt count and pass state for each quiz level.
export default function useQuizProgress() {
  const [levels, setLevels] = useState(load);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, levels }));
    } catch {
      // Storage unavailable or full: results still work for this session.
    }
  }, [levels]);

  // Refresh when another tab records a result.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === STORAGE_KEY) setLevels(load());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const getResult = useCallback((trackId, level) => levels[keyFor(trackId, level)] ?? null, [levels]);

  // Keep the highest percentage; once a level has been passed it stays passed.
  const recordResult = useCallback((trackId, level, { percent, passed }) => {
    setLevels((current) => {
      const key = keyFor(trackId, level);
      const previous = current[key];
      return {
        ...current,
        [key]: {
          best: Math.max(previous?.best ?? 0, percent),
          attempts: (previous?.attempts ?? 0) + 1,
          passed: Boolean(previous?.passed || passed),
          lastAt: new Date().toISOString(),
        },
      };
    });
  }, []);

  return { getResult, recordResult };
}
