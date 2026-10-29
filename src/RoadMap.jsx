import roadmapData from "./roadmapData";

// Resolve prerequisite references centrally so cards can show readable labels,
// including prerequisites that belong to a different track.
const skillsById = Object.fromEntries(
  Object.values(roadmapData).flatMap((track) =>
    track.levels.flatMap((level) =>
      level.skills.map((skill) => [skill.id, skill.name]),
    ),
  ),
);

const isVideo = (url) => /youtube\.com|youtu\.be/.test(url);

// Keep filter ids stable because they are passed from App and used to classify links.
const FILTERS = [
  { id: "all", label: "All" },
  { id: "reading", label: "Reading" },
  { id: "videos", label: "Videos" },
];

// This project does not use a runtime prop-types dependency.
/* eslint-disable react/prop-types */
const Roadmap = ({ category, completed, onToggle, onSelectTrack, resourceFilter, onResourceFilter }) => {
  const roadmap = roadmapData[category];

  // A missing key usually means the category index and roadmap data are out of
  // sync; show an explicit status instead of rendering a broken page.
  if (!roadmap) {
    return (
      <p className="alert alert-warning" role="status">
        This roadmap is not available.
      </p>
    );
  }

  // Derive progress from the active roadmap so global progress remains owned by App.
  const allSkills = roadmap.levels.flatMap((level) => level.skills);
  const doneCount = allSkills.filter((skill) => completed.has(skill.id)).length;
  const percent = allSkills.length ? Math.round((doneCount / allSkills.length) * 100) : 0;
  const totalHours = allSkills.reduce((sum, s) => sum + (s.estimatedHours || 0), 0);
  const remainingHours = allSkills
    .filter((s) => !completed.has(s.id))
    .reduce((sum, s) => sum + (s.estimatedHours || 0), 0);
  const relatedTracks = (roadmap.relatedTracks ?? []).filter(
    (track) => roadmapData[track.id],
  );

  return (
    <main>
      <section className="roadmap-intro">
        <p className="eyebrow mb-2">Learning path</p>
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
              {doneCount} of {allSkills.length} skills complete
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
                <h3>Who this is for</h3>
                <p className="mb-0">{roadmap.audience}</p>
              </div>
            </div>
          )}
          {roadmap.goal && (
            <div className="col-md-6">
              <div className="intro-meta">
                <h3>Learning goal</h3>
                <p className="mb-0">{roadmap.goal}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Optional cross-links connect learners to adjacent tracks without copying
          those curricula into this roadmap. */}
      {relatedTracks.length > 0 && (
        <section className="related-paths mb-4" aria-labelledby="related-paths-title">
          <p id="related-paths-title" className="eyebrow mb-2">Related learning paths</p>
          <div className="d-flex flex-wrap gap-2">
            {relatedTracks.map((track) => (
              <button
                key={track.id}
                type="button"
                className="btn btn-sm btn-outline-secondary"
                title={track.reason}
                aria-label={`Explore ${roadmapData[track.id].title}: ${track.reason}`}
                onClick={() => onSelectTrack(track.id)}
              >
                {roadmapData[track.id].title}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Levels are numbered steps; projects are displayed before the skills
          they synthesize, and cards stay keyed by stable skill ids. */}
      <div className="timeline">
        {roadmap.levels.map((level, index) => (
          <section
            key={level.level}
            className="level"
            aria-labelledby={`roadmap-level-${index}`}
          >
            <span className="level-marker" aria-hidden="true">
              {index + 1}
            </span>
            <div className="level-header">
              <h3 id={`roadmap-level-${index}`}>{level.level}</h3>
              {level.goal && <p className="muted mb-0">{level.goal}</p>}
            </div>

            {level.project && (
              <div className="project-box">
                <span className="eyebrow">Build this</span>
                <strong>{level.project.title}</strong>
                <p className="small muted mb-0">{level.project.description}</p>
              </div>
            )}

            <div className="row g-3">
              {level.skills.map((skill) => (
                <div className="col-12 col-lg-6" key={skill.id}>
                  <article
                    className={`skill-card${completed.has(skill.id) ? " is-complete" : ""}`}
                  >
                    <div className="skill-heading d-flex justify-content-between align-items-start gap-2 mb-2">
                      <h4 className="h5 mb-0">{skill.name}</h4>
                      <div className="skill-badges d-flex gap-1 flex-shrink-0">
                        {skill.priority === "optional" && (
                          <span className="pill">Optional</span>
                        )}
                        {Number.isFinite(skill.estimatedHours) && (
                          <span className="pill">~{skill.estimatedHours} hrs</span>
                        )}
                      </div>
                    </div>
                    <p className="muted">{skill.description}</p>

                    <label className="skill-check">
                      <input
                        type="checkbox"
                        checked={completed.has(skill.id)}
                        onChange={() => onToggle(skill.id)}
                      />
                      <span>Mark {skill.name} as complete</span>
                    </label>

                    {/* Native details keeps extra content compact and keyboard accessible. */}
                    <details>
                      <summary>Learning details</summary>
                      <div className="pt-3">
                        {skill.outcomes?.length > 0 && (
                          <>
                            <h5 className="h6">You’ll learn to</h5>
                            <ul>
                              {skill.outcomes.map((outcome) => (
                                <li key={outcome}>{outcome}</li>
                              ))}
                            </ul>
                          </>
                        )}

                        {skill.prerequisites?.length > 0 && (
                          <p className="small">
                            <strong>Prerequisites:</strong>{" "}
                            {skill.prerequisites
                              .map((id) => skillsById[id] ?? id)
                              .join(", ")}
                          </p>
                        )}

                        {/* Apply the selected resource type to each skill's own
                            resource list; an empty filtered list gets an explanation. */}
                        {(() => {
                          const shown = (skill.resources ?? []).filter(
                            (r) =>
                              resourceFilter === "all" ||
                              (resourceFilter === "videos") === isVideo(r.url),
                          );
                          if (shown.length === 0) {
                            return (
                              <p className="small muted mb-0">
                                {resourceFilter === "all"
                                  ? "No resources added yet."
                                  : `No ${resourceFilter} resources for this skill yet.`}
                              </p>
                            );
                          }
                          return (
                            <>
                              <h5 className="h6">Recommended resources</h5>
                              <ul className="mb-0">
                                {shown.map((resource) => (
                                  <li key={resource.url}>
                                    {/* Announce the new-tab behavior to screen-reader users. */}
                                    <a
                                      href={resource.url}
                                      target="_blank"
                                      rel="noreferrer"
                                    >
                                      {isVideo(resource.url) && (
                                        <span className="video-icon" aria-hidden="true">▶ </span>
                                      )}
                                      {resource.label}
                                      <span className="visually-hidden">
                                        {" "}
                                        (opens in a new tab)
                                      </span>
                                    </a>
                                  </li>
                                ))}
                              </ul>
                            </>
                          );
                        })()}
                      </div>
                    </details>
                  </article>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {roadmap.capstone && (
        <section className="capstone">
          <span className="eyebrow">Capstone</span>
          <h3 className="h4 mt-1">{roadmap.capstone.title}</h3>
          <p className="mb-0">{roadmap.capstone.description}</p>
        </section>
      )}
    </main>
  );
};

export default Roadmap;
