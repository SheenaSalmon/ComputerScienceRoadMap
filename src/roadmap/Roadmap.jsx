import roadmapData from "../data/roadmapData";
import Icon from "../components/Icon";
import LevelSection from "./LevelSection";
import RoadmapIntro from "./RoadmapIntro";

// Composes one track's roadmap: intro and progress, related tracks, the level
// timeline, and the capstone. Detail rendering lives in the sibling components.
// This project does not use a runtime prop-types dependency.
/* eslint-disable react/prop-types */
const Roadmap = ({ category, completed, onToggle, onSelectTrack, resourceFilter, onResourceFilter, quiz }) => {
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
  const hours = (skills) => skills.reduce((sum, s) => sum + (s.estimatedHours || 0), 0);
  const stats = {
    doneCount,
    total: allSkills.length,
    percent: allSkills.length ? Math.round((doneCount / allSkills.length) * 100) : 0,
    totalHours: hours(allSkills),
    remainingHours: hours(allSkills.filter((s) => !completed.has(s.id))),
  };
  const relatedTracks = (roadmap.relatedTracks ?? []).filter((track) => roadmapData[track.id]);

  return (
    <main>
      <RoadmapIntro
        roadmap={roadmap}
        stats={stats}
        resourceFilter={resourceFilter}
        onResourceFilter={onResourceFilter}
      />

      {/* Optional cross-links connect learners to adjacent tracks without copying
          those curricula into this roadmap. */}
      {relatedTracks.length > 0 && (
        <section className="related-paths mb-4" aria-labelledby="related-paths-title">
          <p id="related-paths-title" className="eyebrow mb-2"><Icon name="compass" /> Related learning paths</p>
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
          they synthesize. */}
      <div className="timeline">
        {roadmap.levels.map((level, index) => (
          <LevelSection
            key={level.level}
            level={level}
            index={index}
            completed={completed}
            onToggle={onToggle}
            resourceFilter={resourceFilter}
            quiz={quiz}
          />
        ))}
      </div>

      {roadmap.capstone && (
        <section className="capstone">
          <span className="eyebrow"><Icon name="trophy" /> Capstone</span>
          <h3 className="h4 mt-1">{roadmap.capstone.title}</h3>
          <p className="mb-0">{roadmap.capstone.description}</p>
        </section>
      )}
    </main>
  );
};

export default Roadmap;
