import { useMemo, useState } from 'react'
import Header from './Header'
import Roadmap from './RoadMap'
import categories from './assets/categories.json'
import roadmapData from './roadmapData'
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Track ids in categories.json must match keys in the merged roadmap data
const DEFAULT_TRACK = "frontend";

// Find the category that owns a track (used for accent colors and default expansion)
const findCategory = (trackId) =>
  categories.find((category) =>
    category.tracks.some((track) => track.id === trackId),
  );

// Build one lowercase string per track so searching is a simple substring check.
// It covers the track label, title, description, and every skill name.
const searchIndex = Object.fromEntries(
  categories.flatMap((category) =>
    category.tracks.map((track) => {
      const roadmap = roadmapData[track.id];
      const skillNames = roadmap
        ? roadmap.levels.flatMap((level) => level.skills.map((skill) => skill.name))
        : [];
      const text = [track.label, roadmap?.title, roadmap?.description, ...skillNames]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return [track.id, text];
    }),
  ),
);

function App() {
  const [selectedTrack, setSelectedTrack] = useState(DEFAULT_TRACK);
  const [query, setQuery] = useState("");
  // Ids of categories the user has expanded; start with the selected track's category open
  const [expanded, setExpanded] = useState(
    () => new Set([findCategory(DEFAULT_TRACK)?.id]),
  );

  const activeCategory = findCategory(selectedTrack);
  const searchTerms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const isSearching = searchTerms.length > 0;

  // While searching, keep only tracks that contain every search word and drop empty categories
  const visibleCategories = useMemo(() => {
    if (searchTerms.length === 0) return categories;
    return categories
      .map((category) => ({
        ...category,
        tracks: category.tracks.filter((track) =>
          searchTerms.every((term) => searchIndex[track.id]?.includes(term)),
        ),
      }))
      .filter((category) => category.tracks.length > 0);
    // searchTerms is derived from query, so query is the real dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const toggleCategory = (categoryId) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const setAllExpanded = (open) =>
    setExpanded(open ? new Set(categories.map((category) => category.id)) : new Set());

  return (
    // data-category drives the accent colors defined in App.css
    <div className="app-shell" data-category={activeCategory?.id}>
      <Header />

      <section className="track-browser" aria-labelledby="track-browser-title">
        <div className="browser-heading">
          <div>
            <p className="eyebrow browser-kicker">The index / {String(categories.length).padStart(2, "0")} domains</p>
            <h2 id="track-browser-title">Choose your route</h2>
          </div>
          <p className="browser-note">
            Start with a discipline. Follow it from first principles to things you can build.
          </p>
        </div>

      <div className="track-toolbar">
        <div className="search-box">
          <label htmlFor="track-search" className="visually-hidden">
            Search tracks and skills
          </label>
          <input
            id="track-search"
            type="search"
            className="search-input"
            placeholder="Find a track or skill..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        {/* Expand/collapse all is hidden while searching, since results are always expanded */}
        {!isSearching && (
          <div className="toolbar-actions">
            <button type="button" className="link-button" onClick={() => setAllExpanded(true)}>
              Expand all
            </button>
            <button type="button" className="link-button" onClick={() => setAllExpanded(false)}>
              Collapse all
            </button>
          </div>
        )}
      </div>

      {/* Announce the result count to screen readers as the user types */}
      <p className="visually-hidden" role="status">
        {isSearching
          ? `${visibleCategories.reduce((sum, c) => sum + c.tracks.length, 0)} matching tracks`
          : ""}
      </p>

      <nav className="track-nav" aria-label="Roadmap tracks">
        {visibleCategories.map((category) => {
          // Search results are always shown; otherwise respect the user's choice
          const isOpen = isSearching || expanded.has(category.id);
          const panelId = `category-panel-${category.id}`;
          const holdsSelection = category.tracks.some((track) => track.id === selectedTrack);
          return (
            <section key={category.id} className="track-group" data-category={category.id}>
              <h2 className="track-group-label">
                <button
                  type="button"
                  className="group-toggle"
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  disabled={isSearching}
                  onClick={() => toggleCategory(category.id)}
                >
                  <span className="chevron" aria-hidden="true">{isOpen ? "▾" : "▸"}</span>
                  <span className="group-title">{category.label}</span>
                  {/* Dot shows which collapsed category holds the current selection */}
                  {holdsSelection && !isOpen && (
                    <span className="selection-dot" title="Contains the selected track" />
                  )}
                  <span className="group-count">{category.tracks.length}</span>
                </button>
              </h2>
              {isOpen && (
                <div id={panelId} className="track-tabs">
                  {category.tracks.map((track) => (
                    <button
                      key={track.id}
                      type="button"
                      className="track-tab"
                      // aria-pressed exposes the selected track to assistive technology
                      aria-pressed={selectedTrack === track.id}
                      onClick={() => setSelectedTrack(track.id)}
                    >
                      {track.label}
                    </button>
                  ))}
                </div>
              )}
            </section>
          );
        })}
      </nav>

      {isSearching && visibleCategories.length === 0 && (
        <p className="no-results">No tracks match “{query.trim()}”. Try a different word.</p>
      )}
      </section>

      <Roadmap category={selectedTrack} />
    </div>
  )
}

export default App
