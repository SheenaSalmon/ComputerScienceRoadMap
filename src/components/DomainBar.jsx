import roadmapData from "../data/roadmapData";
import { categories, totalTracks, trackLabels } from "../data/trackIndex";

// Sticky domain bar: always one tap from any domain, even deep in a roadmap.
// This project does not use a runtime prop-types dependency.
/* eslint-disable react/prop-types */
export default function DomainBar({ categoryFilter, onChoose, selectedTrack }) {
  return (
    <nav className="domain-bar" aria-label="Domains">
      <div className="domain-chips">
        <button
          type="button"
          className="domain-chip"
          aria-pressed={categoryFilter === "all"}
          onClick={() => onChoose("all")}
        >
          All<span className="chip-count">{totalTracks}</span>
        </button>
        {categories.map((category) => (
          <button
            key={category.id}
            type="button"
            className="domain-chip"
            data-category={category.id}
            aria-pressed={categoryFilter === category.id}
            onClick={() => onChoose(category.id)}
          >
            {category.label}
            <span className="chip-count">{category.tracks.length}</span>
          </button>
        ))}
      </div>
      <span className="now-reading" title={roadmapData[selectedTrack]?.title}>
        Reading: <strong>{trackLabels[selectedTrack]}</strong>
      </span>
    </nav>
  );
}
