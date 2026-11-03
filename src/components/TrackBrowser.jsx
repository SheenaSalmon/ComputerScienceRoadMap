import { useRef, useState } from "react";
import { categories as allCategories, findCategory } from "../data/trackIndex";
import FeaturedTracks from "./FeaturedTracks";
import ProgressSummary from "./ProgressSummary";
import TrackList from "./TrackList";
import TrackSearch from "./TrackSearch";

// The "Choose your route" section: heading, overall progress, featured routes,
// search, and the grouped track index. It owns which groups are expanded; the
// filter (query and domain) is owned by App because the domain bar shares it.
// This project does not use a runtime prop-types dependency.
/* eslint-disable react/prop-types */
export default function TrackBrowser({
  sectionRef,
  filter,
  selectedTrack,
  onSelectTrack,
  progress,
  doneInTrack,
}) {
  const searchRef = useRef(null);
  // Expanded category ids in a Set for efficient toggling; start with the
  // selected track's category open.
  const [expanded, setExpanded] = useState(() => new Set([findCategory(selectedTrack)?.id]));

  const toggleCategory = (categoryId) =>
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });

  const setAllExpanded = (open) =>
    setExpanded(open ? new Set(allCategories.map((category) => category.id)) : new Set());

  return (
    <section className="track-browser" ref={sectionRef} aria-labelledby="track-browser-title">
      <div className="browser-heading">
        <div>
          <p className="eyebrow browser-kicker">The index / {String(allCategories.length).padStart(2, "0")} domains</p>
          <h2 id="track-browser-title">Choose your route</h2>
        </div>
        <p className="browser-note">
          Start with a discipline. Follow it from first principles to things you can build.
        </p>
      </div>

      <ProgressSummary {...progress} />

      {/* Featured routes provide curated entry points until the user narrows the index. */}
      {!filter.locked && (
        <FeaturedTracks selectedTrack={selectedTrack} doneInTrack={doneInTrack} onSelect={onSelectTrack} />
      )}

      <TrackSearch
        filter={filter}
        searchRef={searchRef}
        onOpenFirst={onSelectTrack}
        onExpandAll={setAllExpanded}
      />

      <TrackList
        categories={filter.visibleCategories}
        locked={filter.locked}
        expanded={expanded}
        onToggleCategory={toggleCategory}
        selectedTrack={selectedTrack}
        onSelectTrack={onSelectTrack}
        doneInTrack={doneInTrack}
        searchRef={searchRef}
      />

      {filter.isSearching && filter.visibleCategories.length === 0 && (
        <p className="no-results">No tracks match “{filter.query.trim()}”. Try a different word.</p>
      )}
    </section>
  );
}
