import { findCategory, trackHours, trackLabels, trackSkillIds } from "../data/trackIndex";

// Curated entry points shown above the full index; each id must be a known track.
const FEATURED = [
  { id: "foundations", kicker: "New to CS" },
  { id: "lang-python", kicker: "First language" },
  { id: "frontend", kicker: "Build for the web" },
  { id: "backend", kicker: "Servers & APIs" },
  { id: "ai", kicker: "Machine learning" },
  { id: "interviews", kicker: "Land the job" },
];

// Featured routes give new visitors a few clear places to start before they
// narrow the full index. Each card shows size, time and personal progress.
// This project does not use a runtime prop-types dependency.
/* eslint-disable react/prop-types */
export default function FeaturedTracks({ selectedTrack, doneInTrack, onSelect }) {
  return (
    <section className="featured" aria-labelledby="featured-title">
      <div className="featured-heading">
        <h3 id="featured-title" className="eyebrow">Start here</h3>
        <span className="muted small">Popular first routes</span>
      </div>
      <div className="featured-grid">
        {FEATURED.map((item) => {
          const done = doneInTrack(item.id);
          const total = trackSkillIds[item.id]?.length ?? 0;
          const hours = trackHours(item.id);
          return (
            <button
              key={item.id}
              type="button"
              className="featured-card"
              data-category={findCategory(item.id)?.id}
              aria-current={selectedTrack === item.id ? "true" : undefined}
              onClick={() => onSelect(item.id)}
            >
              <span className="featured-kicker">{item.kicker}</span>
              <span className="featured-title">{trackLabels[item.id]}</span>
              <span className="featured-meta">
                {total} skills{hours > 0 && ` · ~${hours} hrs`}
                {done > 0 && ` · ${done}/${total} done`}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
