import Icon from "../components/Icon";

// One "take the quiz" control with its saved-result badge. Used for both level
// quizzes and per-skill quizzes so the two stay visually and behaviourally alike.
// This project does not use a runtime prop-types dependency.
/* eslint-disable react/prop-types */
export default function QuizButton({ result, label, retakeLabel, ariaLabel, className = "", onClick }) {
  return (
    <div className={`level-quiz ${className}`.trim()}>
      <button type="button" className="quiz-start" aria-label={ariaLabel} onClick={onClick}>
        <Icon name="checkCircle" /> {result ? retakeLabel : label}
      </button>
      {result && (
        <span className={`pill${result.passed ? " quiz-passed" : ""}`}>
          {result.passed ? "Passed" : "Not passed"} · best {result.best}%
        </span>
      )}
    </div>
  );
}
