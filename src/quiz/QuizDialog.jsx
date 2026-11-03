import { useEffect, useRef, useState } from "react";
import roadmapData from "../data/roadmapData";
import { buildRun, scoreRun } from "./quizEngine";

// Modal quiz for one level of one track. Uses the native <dialog> element, which
// provides focus trapping, Escape-to-close and an inert background for free.
//
// Phases: "intro" (choose mode) -> "question" -> "results".
//  - Practice mode shows the explanation right after each answer.
//  - Scored mode defers all feedback to the results screen.
// This project does not use a runtime prop-types dependency.
/* eslint-disable react/prop-types */

const skillName = (trackId, skillId) => {
  for (const level of roadmapData[trackId]?.levels ?? []) {
    const match = level.skills.find((skill) => skill.id === skillId);
    if (match) return match.name;
  }
  return skillId;
};

export default function QuizDialog({ trackId, level, title, onClose, onResult }) {
  const dialogRef = useRef(null);
  const [phase, setPhase] = useState("intro");
  const [mode, setMode] = useState("practice");
  // A new run (random subset + shuffled choices) is created per attempt.
  const [run, setRun] = useState(() => buildRun(level));
  const [index, setIndex] = useState(0);
  const [picks, setPicks] = useState([]);
  const [checked, setChecked] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) dialog.showModal();
  }, []);

  const question = run.questions[index];
  const pick = picks[index];
  const isLast = index === run.questions.length - 1;
  const showFeedback = mode === "practice" && checked;

  const start = () => {
    setPhase("question");
    setIndex(0);
    setPicks([]);
    setChecked(false);
  };

  const retry = () => {
    setRun(buildRun(level));
    setResult(null);
    setPhase("intro");
  };

  const choose = (choiceIndex) => {
    if (showFeedback) return;
    setPicks((current) => {
      const next = [...current];
      next[index] = choiceIndex;
      return next;
    });
  };

  // Primary button: in practice mode the first press checks, the second advances.
  const advance = () => {
    if (mode === "practice" && !checked) {
      setChecked(true);
      return;
    }
    if (!isLast) {
      setIndex(index + 1);
      setChecked(false);
      return;
    }
    const score = scoreRun(run, picks);
    setResult(score);
    setPhase("results");
    onResult({ percent: score.percent, passed: score.passed });
  };

  const buttonLabel =
    mode === "practice" && !checked ? "Check answer" : isLast ? "Finish quiz" : "Next question";

  return (
    <dialog
      ref={dialogRef}
      className="quiz-dialog"
      aria-labelledby="quiz-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === dialogRef.current) dialogRef.current.close();
      }}
    >
      <div className="quiz-body">
        <header className="quiz-header">
          <div>
            <p className="eyebrow mb-1">{roadmapData[trackId]?.title}</p>
            <h2 id="quiz-title" className="h4 mb-0">{title ?? `${level.level} quiz`}</h2>
          </div>
          <button type="button" className="quiz-close" onClick={() => dialogRef.current.close()}>
            Close
          </button>
        </header>

        {phase === "intro" && (
          <div>
            <p>
              {run.questions.length} questions. You need {Math.round(run.passMark * 100)}% to pass.
              Questions and answer order are shuffled each time.
            </p>
            <fieldset className="quiz-modes">
              <legend className="visually-hidden">Quiz mode</legend>
              {[
                ["practice", "Practice", "See the answer and explanation after each question."],
                ["scored", "Scored", "Answer everything first, then review at the end."],
              ].map(([id, label, hint]) => (
                <label key={id} className="quiz-choice">
                  <input type="radio" name="quiz-mode" checked={mode === id} onChange={() => setMode(id)} />
                  <span><strong>{label}</strong><br /><span className="muted small">{hint}</span></span>
                </label>
              ))}
            </fieldset>
            <button type="button" className="quiz-primary" onClick={start}>Start quiz</button>
          </div>
        )}

        {phase === "question" && question && (
          <form onSubmit={(event) => { event.preventDefault(); if (pick !== undefined) advance(); }}>
            <p className="muted small" aria-live="polite">
              Question {index + 1} of {run.questions.length}
            </p>
            <fieldset className="quiz-question">
              <legend className="quiz-prompt">{question.prompt}</legend>
              {question.code && <pre className="quiz-code"><code>{question.code}</code></pre>}
              {question.choices.map((text, choiceIndex) => {
                const state = showFeedback
                  ? choiceIndex === question.answer
                    ? " is-correct"
                    : choiceIndex === pick
                      ? " is-wrong"
                      : ""
                  : "";
                return (
                  <label key={text} className={`quiz-choice${state}`}>
                    <input
                      type="radio"
                      name={`quiz-q-${question.id}`}
                      checked={pick === choiceIndex}
                      disabled={showFeedback}
                      onChange={() => choose(choiceIndex)}
                    />
                    <span>{text}</span>
                  </label>
                );
              })}
            </fieldset>
            {showFeedback && (
              <p className="quiz-feedback" role="status">
                <strong>{pick === question.answer ? "Correct. " : "Not quite. "}</strong>
                {question.explanation}
              </p>
            )}
            <button type="submit" className="quiz-primary" disabled={pick === undefined}>
              {buttonLabel}
            </button>
          </form>
        )}

        {phase === "results" && result && (
          <div>
            <p className={`quiz-score${result.passed ? " is-pass" : ""}`} role="status">
              {result.correct} / {result.total} ({result.percent}%) —{" "}
              {result.passed ? "Passed" : `Keep practising (pass mark ${Math.round(run.passMark * 100)}%)`}
            </p>
            {result.missed.length > 0 && (
              <>
                <h3 className="h6">Review the ones you missed</h3>
                <ul className="quiz-review">
                  {result.missed.map(({ question: q, picked }) => (
                    <li key={q.id}>
                      <strong>{q.prompt}</strong>
                      <div className="small">
                        Your answer: {picked === undefined ? "none" : q.choices[picked]}
                      </div>
                      <div className="small">Correct answer: {q.choices[q.answer]}</div>
                      <div className="small muted">{q.explanation}</div>
                      <div className="small">Revisit: {skillName(trackId, q.skillId)}</div>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div className="quiz-actions">
              <button type="button" className="quiz-primary" onClick={retry}>Try again</button>
              <button type="button" className="quiz-secondary" onClick={() => dialogRef.current.close()}>Done</button>
            </div>
          </div>
        )}
      </div>
    </dialog>
  );
}
