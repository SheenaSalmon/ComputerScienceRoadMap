import { useMemo, useState } from "react";
import roadmapData from "../data/roadmapData";
import { useTrackQuiz } from "./quizData";
import useQuizProgress from "./useQuizProgress";

// Everything the app needs to offer quizzes for the selected track: the loaded
// quiz file, which skills have questions, saved results, and the quiz currently
// open in the dialog. App stays free of quiz details by using only this hook.
//
// A "target" is { kind: "level" | "skill", key } where key is the level name or
// the skill id. Results are stored under "<level name>" or "skill:<skill id>".
export default function useQuizController(trackId) {
  const quiz = useTrackQuiz(trackId);
  const { getResult, recordResult } = useQuizProgress();
  const [target, setTarget] = useState(null);

  const skillIds = useMemo(
    () => new Set(quiz?.levels.flatMap((l) => l.questions.map((q) => q.skillId)) ?? []),
    [quiz],
  );

  // The quiz to show: a level's own question pool, or a pseudo-level built from
  // every question tagged with the chosen skill.
  const active = useMemo(() => {
    if (!quiz || !target) return null;
    if (target.kind === "level") {
      const level = quiz.levels.find((l) => l.level === target.key);
      return level ? { level, resultKey: target.key, title: undefined } : null;
    }
    const questions = quiz.levels.flatMap((l) => l.questions).filter((q) => q.skillId === target.key);
    if (questions.length === 0) return null;
    const skill = roadmapData[trackId]?.levels
      .flatMap((l) => l.skills)
      .find((s) => s.id === target.key);
    const name = skill?.name ?? target.key;
    return {
      level: { level: name, passMark: 0.7, questions },
      resultKey: `skill:${target.key}`,
      title: `${name} skill quiz`,
    };
  }, [quiz, target, trackId]);

  return {
    // Props for the roadmap's quiz buttons.
    roadmapQuiz: {
      skillIds,
      hasLevel: (levelName) => Boolean(quiz?.levels.some((l) => l.level === levelName)),
      getResult: (key) => getResult(trackId, key),
      start: (kind, key) => setTarget({ kind, key }),
    },
    // The open quiz (null when none) and its handlers, for <QuizDialog />.
    active,
    close: () => setTarget(null),
    record: (score) => active && recordResult(trackId, active.resultKey, score),
  };
}
