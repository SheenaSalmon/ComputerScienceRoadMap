import { useEffect } from "react";
import { categories } from "../data/trackIndex";

// Search box plus expand/collapse controls. Search keyboard behavior: "/" focuses
// the box from anywhere, Escape clears/closes, Enter opens the first match, and
// ArrowDown moves focus into the result list.
// This project does not use a runtime prop-types dependency.
/* eslint-disable react/prop-types */
export default function TrackSearch({ filter, searchRef, onOpenFirst, onExpandAll }) {
  const { query, setQuery, isSearching, isFiltered, locked, visibleCategories, visibleTrackCount, totalTracks } =
    filter;

  // "/" is a global search shortcut, except while the user is typing in an
  // editable control. Cleanup prevents a duplicate listener after unmount.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      if (event.target.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      searchRef.current?.focus();
      searchRef.current?.select();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [searchRef]);

  const onSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (query) setQuery("");
      else event.currentTarget.blur();
    } else if (event.key === "Enter" && isSearching) {
      const first = visibleCategories[0]?.tracks[0];
      if (first) onOpenFirst(first.id);
    } else if (event.key === "ArrowDown") {
      const firstTab = document.querySelector(".track-nav .track-tab");
      if (firstTab) {
        event.preventDefault();
        firstTab.focus();
      }
    }
  };

  return (
    <div className="track-toolbar">
      <div className="search-box">
        <label htmlFor="track-search" className="visually-hidden">
          Search tracks and skills
        </label>
        <input
          id="track-search"
          ref={searchRef}
          type="search"
          className="search-input"
          placeholder="Find a track or skill..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onSearchKeyDown}
          aria-describedby="search-help"
        />
        {!query && <kbd className="search-hint" aria-hidden="true">/</kbd>}
        <p id="search-help" className="visually-hidden">
          Press slash to focus search. Enter opens the first result. Down arrow moves to the results, and Escape clears.
        </p>
        <p className="result-count" role="status" aria-live="polite">
          {isSearching
            ? `${visibleTrackCount} of ${totalTracks} tracks match “${query.trim()}”`
            : isFiltered
              ? `${visibleTrackCount} tracks in ${visibleCategories[0]?.label}`
              : `${totalTracks} tracks across ${categories.length} domains`}
          {isSearching && visibleTrackCount > 0 && (
            <span className="search-tip"> · Enter opens the first result, ↓ browses</span>
          )}
        </p>
      </div>
      {/* Expand/collapse all is hidden while results are locked open */}
      {!locked && (
        <div className="toolbar-actions">
          <button type="button" className="link-button" onClick={() => onExpandAll(true)}>
            Expand all
          </button>
          <button type="button" className="link-button" onClick={() => onExpandAll(false)}>
            Collapse all
          </button>
        </div>
      )}
    </div>
  );
}
