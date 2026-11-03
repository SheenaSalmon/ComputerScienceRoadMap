import Icon from "../components/Icon";
import { skillNames } from "../data/trackIndex";
import QuizButton from "../quiz/QuizButton";
import ResourceList from "./ResourceList";

// One skill: heading and badges, description, completion checkbox, optional
// skill quiz button, and a collapsible "Learning details" section.
// This project does not use a runtime prop-types dependency.
/* eslint-disable react/prop-types */
export default function SkillCard({ skill, done, onToggle, resourceFilter, quiz }) {
  return (
    <article className={`skill-card${done ? " is-complete" : ""}`}>
      <div className="skill-heading d-flex justify-content-between align-items-start gap-2 mb-2">
        <h4 className="h5 mb-0">{skill.name}</h4>
        <div className="skill-badges d-flex gap-1 flex-shrink-0">
          {skill.priority === "optional" && (
            <span className="pill"><Icon name="star" /> Optional</span>
          )}
          {Number.isFinite(skill.estimatedHours) && (
            <span className="pill"><Icon name="clock" /> ~{skill.estimatedHours} hrs</span>
          )}
        </div>
      </div>
      <p className="muted">{skill.description}</p>

      <label className="skill-check">
        <input type="checkbox" checked={done} onChange={() => onToggle(skill.id)} />
        <span>Mark {skill.name} as complete</span>
      </label>

      {/* Shown only when the quiz file has questions for this skill. */}
      {quiz.skillIds.has(skill.id) && (
        <QuizButton
          className="skill-quiz"
          result={quiz.getResult(`skill:${skill.id}`)}
          label="Skill quiz"
          retakeLabel="Retake skill quiz"
          ariaLabel={`${quiz.getResult(`skill:${skill.id}`) ? "Retake" : "Take"} the ${skill.name} quiz`}
          onClick={() => quiz.start("skill", skill.id)}
        />
      )}

      {/* Native details keeps extra content compact and keyboard accessible. */}
      <details>
        <summary>Learning details</summary>
        <div className="pt-3">
          {skill.outcomes?.length > 0 && (
            <>
              <h5 className="h6"><Icon name="checkCircle" /> You’ll learn to</h5>
              <ul className="bullet-list bullet-check">
                {skill.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </>
          )}

          {skill.prerequisites?.length > 0 && (
            <p className="small">
              <strong><Icon name="lock" /> Prerequisites:</strong>{" "}
              {skill.prerequisites.map((id) => skillNames[id] ?? id).join(", ")}
            </p>
          )}

          <ResourceList resources={skill.resources} filter={resourceFilter} />
        </div>
      </details>
    </article>
  );
}
