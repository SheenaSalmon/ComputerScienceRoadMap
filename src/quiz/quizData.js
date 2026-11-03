import { useEffect, useState } from "react";

// Quiz files are loaded lazily: Vite turns each file into its own chunk, so the
// questions for a track are only downloaded when that track is opened. Adding
// src/assets/quizzes/<trackId>.json is all that is needed to enable a track.
const loaders = import.meta.glob("../assets/quizzes/*.json");

const loaderById = Object.fromEntries(
  Object.entries(loaders).map(([path, load]) => [path.match(/([^/]+)\.json$/)[1], load]),
);

export const hasQuiz = (trackId) => trackId in loaderById;

export async function loadQuiz(trackId) {
  const module = await loaderById[trackId]?.();
  return module?.default ?? null;
}

// Returns the quiz for a track, or null while loading / when none exists. The
// result is tagged with its track id so a stale response from a previously
// selected track is never shown for the current one.
export function useTrackQuiz(trackId) {
  const [loaded, setLoaded] = useState({ trackId: null, quiz: null });

  useEffect(() => {
    if (!hasQuiz(trackId)) return undefined;
    let cancelled = false;
    loadQuiz(trackId)
      .then((quiz) => {
        if (!cancelled) setLoaded({ trackId, quiz });
      })
      .catch(() => {
        // A failed chunk load just means no quiz button is shown.
      });
    return () => {
      cancelled = true;
    };
  }, [trackId]);

  return loaded.trackId === trackId ? loaded.quiz : null;
}
