import Icon from "../components/Icon";
import { FILTERS } from "./resources";

// Top of a roadmap: title, resource-type filter, this track's progress bar, and
// the audience/goal summary. Progress numbers are derived by the parent from the
// active roadmap, so global progress remains owned by App.
// This project does not use a runtime prop-types dependency.
/* eslint-disable react/prop-types */
export default function RoadmapIntro({ roadmap, stats, resourceFilter, onResourceFilter }) {
  const { doneCount, total, percent, totalHours, remainingHours } = stats;

  return (
    <section className="roadmap-intro">
      <p className="eyebrow mb-2"><Icon name="route" /> Learning path</p>
      <h2 className="fw-bold mb-3">{roadmap.title}</h2>
      <p className="lead muted mb-4">{roadmap.description}</p>

      <div className="resource-filter" role="group" aria-label="Show resource type">
        <span className="eyebrow">Resources</span>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            className="filter-chip"
            aria-pressed={resourceFilter === f.id}
            onClick={() => onResourceFilter(f.id)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="track-progress">
        <div className="track-progress-text">
          <strong>
            {doneCount} of {total} skills complete
          </strong>
          <span className="muted">
            {percent}%
            {totalHours > 0 && ` · ~${remainingHours} of ${totalHours} hrs remaining`}
          </span>
        </div>
        <div
          className="progress-bar-track"
          role="progressbar"
          aria-label={`${roadmap.title} progress`}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
        >
          <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>

      <div className="row g-3">
        {roadmap.audience && (
          <div className="col-md-6">
            <div className="intro-meta">
              <h3><Icon name="users" /> Who this is for</h3>
              <p className="mb-0">{roadmap.audience}</p>
            </div>
          </div>
        )}
        {roadmap.goal && (
          <div className="col-md-6">
            <div className="intro-meta">
              <h3><Icon name="target" /> Learning goal</h3>
              <p className="mb-0">{roadmap.goal}</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
