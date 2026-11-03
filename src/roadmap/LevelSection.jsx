import Icon from "../components/Icon";
import QuizButton from "../quiz/QuizButton";
import SkillCard from "./SkillCard";

// One numbered step of the timeline: heading and goal, optional level quiz,
// the "build this" project, and the level's skill cards (keyed by stable skill id).
// This project does not use a runtime prop-types dependency.
/* eslint-disable react/prop-types */
export default function LevelSection({ level, index, completed, onToggle, resourceFilter, quiz }) {
  return (
    <section className="level" aria-labelledby={`roadmap-level-${index}`}>
      <span className="level-marker" aria-hidden="true">
        {index + 1}
      </span>
      <div className="level-header">
        <h3 id={`roadmap-level-${index}`}>{level.level}</h3>
        {level.goal && <p className="muted mb-0">{level.goal}</p>}
        {/* Only levels that have questions in this track's quiz file get a button. */}
        {quiz.hasLevel(level.level) && (
          <QuizButton
            result={quiz.getResult(level.level)}
            label="Take the level quiz"
            retakeLabel="Retake level quiz"
            onClick={() => quiz.start("level", level.level)}
          />
        )}
      </div>

      {level.project && (
        <div className="project-box">
          <span className="eyebrow"><Icon name="hammer" /> Build this</span>
          <strong>{level.project.title}</strong>
          <p className="small muted mb-0">{level.project.description}</p>
        </div>
      )}

      <div className="row g-3">
        {level.skills.map((skill) => (
          <div className="col-12 col-lg-6" key={skill.id}>
            <SkillCard
              skill={skill}
              done={completed.has(skill.id)}
              onToggle={onToggle}
              resourceFilter={resourceFilter}
              quiz={quiz}
            />
          </div>
        ))}
      </div>
    </section>
  );
}
