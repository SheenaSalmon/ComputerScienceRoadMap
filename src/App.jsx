import { useEffect, useMemo, useRef, useState } from 'react'
import Header from './Header'
import Roadmap from './RoadMap'
import categories from './assets/categories.json'
import roadmapData from './roadmapData'
import useProgress from './useProgress'
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// This module owns track browsing, selection, progress-transfer controls, and
// the app-level keyboard interactions. Roadmap content and progress persistence
// are kept in roadmapData.js and useProgress.js respectively.
//
// Track ids in categories.json must match keys in the merged roadmap data.
const DEFAULT_TRACK = "frontend";

// Curated entry points shown above the full index; each id must be a known track.
const FEATURED = [
  { id: "foundations", kicker: "New to CS" },
  { id: "lang-python", kicker: "First language" },
  { id: "frontend", kicker: "Build for the web" },
  { id: "backend", kicker: "Servers & APIs" },
  { id: "ai", kicker: "Machine learning" },
  { id: "interviews", kicker: "Land the job" },
];

const totalTracks = categories.reduce((sum, category) => sum + category.tracks.length, 0);

// Respect the user's motion preference for programmatic navigation.
const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Shared scroll helper for moving between the browser, roadmap, and filters.
const scrollToElement = (element) =>
  element?.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });

// Find the category that owns a track; used for accent colors and default expansion.
const findCategory = (trackId) =>
  categories.find((category) =>
    category.tracks.some((track) => track.id === trackId),
  );

// Precompute searchable text once so keystrokes only perform simple substring
// checks. Search covers the track label, title, description, and skill names.
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

// These indexes keep progress summaries consistent with the skills actually
// present in roadmap data, including tracks loaded from the assets/tracks glob.
const trackSkillIds = Object.fromEntries(
  Object.entries(roadmapData).map(([id, track]) => [
    id,
    track.levels.flatMap((level) => level.skills.map((skill) => skill.id)),
  ]),
);
const allSkillIds = new Set(Object.values(trackSkillIds).flat());

const trackLabels = Object.fromEntries(
  categories.flatMap((category) => category.tracks.map((track) => [track.id, track.label])),
);

// Sum planned learning time for featured-card summaries.
const trackHours = (trackId) =>
  roadmapData[trackId]?.levels
    .flatMap((level) => level.skills)
    .reduce((sum, skill) => sum + (skill.estimatedHours || 0), 0) ?? 0;

function App() {
  // Progress is persisted by the hook; this component uses its public API for
  // counters, toggles, and portable JSON import/export.
  const { completed, toggle, reset, exportData, importData } = useProgress();
  const fileInput = useRef(null);
  const searchInput = useRef(null);
  const browserRef = useRef(null);
  const roadmapRef = useRef(null);
  // A counter allows selecting the same track repeatedly to trigger focus/scroll.
  const [scrollTick, setScrollTick] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [resourceFilter, setResourceFilter] = useState("all");
  const [transferMessage, setTransferMessage] = useState("");
  const [selectedTrack, setSelectedTrack] = useState(DEFAULT_TRACK);
  const [query, setQuery] = useState("");
  // Store expanded category ids in a Set for efficient toggling and membership checks.
  // Start with the selected track's category open.
  const [expanded, setExpanded] = useState(
    () => new Set([findCategory(DEFAULT_TRACK)?.id]),
  );

  const activeCategory = findCategory(selectedTrack);
  const searchTerms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const isSearching = searchTerms.length > 0;
  const isFiltered = categoryFilter !== "all";
  // Search results and a selected-domain filter are locked open to expose results.
  const locked = isSearching || isFiltered;

  // A result must contain every search term. Filtering maps categories rather
  // than mutating the shared source data and removes categories with no matches.
  const visibleCategories = useMemo(() => {
    if (searchTerms.length === 0) {
      return categoryFilter === "all"
        ? categories
        : categories.filter((category) => category.id === categoryFilter);
    }
    return categories
      .map((category) => ({
        ...category,
        tracks: category.tracks.filter((track) =>
          searchTerms.every((term) => searchIndex[track.id]?.includes(term)),
        ),
      }))
      .filter((category) => category.tracks.length > 0);
    // searchTerms is derived from query, so query is the real dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query, categoryFilter]);

  const visibleTrackCount = visibleCategories.reduce((sum, c) => sum + c.tracks.length, 0);

  // Selection updates the roadmap and schedules focus/scroll after React renders it.
  const selectTrack = (trackId) => {
    setSelectedTrack(trackId);
    setScrollTick((tick) => tick + 1);
  };

  useEffect(() => {
    if (scrollTick === 0) return;
    roadmapRef.current?.focus({ preventScroll: true });
    scrollToElement(roadmapRef.current);
  }, [scrollTick]);

  // Choosing a domain clears search so the domain filter remains the sole constraint.
  const chooseCategory = (categoryId) => {
    setCategoryFilter(categoryId);
    setQuery("");
    scrollToElement(browserRef.current);
  };

  // "/" is a global search shortcut, except while the user is typing in an
  // editable control. Cleanup prevents a duplicate listener after unmount.
  useEffect(() => {
    const onKeyDown = (event) => {
      if (event.key !== "/" || event.metaKey || event.ctrlKey || event.altKey) return;
      const target = event.target;
      if (target.closest("input, textarea, select, [contenteditable='true']")) return;
      event.preventDefault();
      searchInput.current?.focus();
      searchInput.current?.select();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Search keyboard behavior: Escape clears/closes, Enter opens the first match,
  // and ArrowDown moves focus into the result list.
  const onSearchKeyDown = (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      if (query) setQuery("");
      else event.currentTarget.blur();
    } else if (event.key === "Enter" && isSearching) {
      const first = visibleCategories[0]?.tracks[0];
      if (first) selectTrack(first.id);
    } else if (event.key === "ArrowDown") {
      const firstTab = document.querySelector(".track-nav .track-tab");
      if (firstTab) {
        event.preventDefault();
        firstTab.focus();
      }
    }
  };

  // Roving keyboard navigation keeps the large track index usable without
  // requiring a Tab press for every track button.
  const onTrackNavKeyDown = (event) => {
    if (!event.target.classList.contains("track-tab")) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const tabs = [...event.currentTarget.querySelectorAll(".track-tab")];
    const index = tabs.indexOf(event.target);
    let next;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = tabs[Math.min(index + 1, tabs.length - 1)];
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      if (index === 0) next = searchInput.current;
      else next = tabs[index - 1];
    } else if (event.key === "Home") next = tabs[0];
    else if (event.key === "End") next = tabs[tabs.length - 1];
    if (next) {
      event.preventDefault();
      next.focus();
    }
  };

  const toggleCategory = (categoryId) => {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(categoryId)) next.delete(categoryId);
      else next.add(categoryId);
      return next;
    });
  };

  const doneTotal = [...completed].filter((id) => allSkillIds.has(id)).length;
  const doneInTrack = (trackId) =>
    (trackSkillIds[trackId] ?? []).filter((id) => completed.has(id)).length;

  const confirmReset = () => {
    if (window.confirm("Clear all saved progress on this device?")) reset();
  };

  const handleExport = () => {
    // Export only the hook's versioned progress payload; the browser handles the download.
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cs-roadmap-progress.json";
    link.click();
    URL.revokeObjectURL(url);
    setTransferMessage(`Exported ${doneTotal} completed skills.`);
  };

  const handleImport = async (event) => {
    // Reset the input first so choosing the same file again still emits change.
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const count = importData(await file.text(), allSkillIds);
    setTransferMessage(
      count < 0
        ? "That file isn’t a valid progress export."
        : `Imported ${count} completed skills and merged them with your progress.`,
    );
  };

  const setAllExpanded = (open) =>
    setExpanded(open ? new Set(categories.map((category) => category.id)) : new Set());

  return (
    // data-category drives the accent colors defined in App.css
    <div className="app-shell" data-category={activeCategory?.id}>
      <Header />

      {/* Sticky domain bar: always one tap from any domain, even deep in a roadmap */}
      <nav className="domain-bar" aria-label="Domains">
        <div className="domain-chips">
          <button
            type="button"
            className="domain-chip"
            aria-pressed={!isFiltered}
            onClick={() => chooseCategory("all")}
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
              onClick={() => chooseCategory(category.id)}
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

      <section className="track-browser" ref={browserRef} aria-labelledby="track-browser-title">
        <div className="browser-heading">
          <div>
            <p className="eyebrow browser-kicker">The index / {String(categories.length).padStart(2, "0")} domains</p>
            <h2 id="track-browser-title">Choose your route</h2>
          </div>
          <p className="browser-note">
            Start with a discipline. Follow it from first principles to things you can build.
          </p>
        </div>

      {/* Progress controls sit with the index so users can transfer or reset it
          without navigating away from their current roadmap. */}
      <div className="overall-progress">
        <span>
          <strong>{doneTotal}</strong> of {allSkillIds.size} skills complete across all tracks
        </span>
        <div className="progress-actions">
          {doneTotal > 0 && (
            <button type="button" className="link-button" onClick={handleExport}>
              Export
            </button>
          )}
          <button type="button" className="link-button" onClick={() => fileInput.current?.click()}>
            Import
          </button>
          {doneTotal > 0 && (
            <button type="button" className="link-button" onClick={confirmReset}>
              Reset progress
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="visually-hidden"
            tabIndex={-1}
            aria-label="Import progress file"
            onChange={handleImport}
          />
        </div>
      </div>
      <p className="visually-hidden" role="status">{transferMessage}</p>
      {transferMessage && <p className="transfer-message small muted">{transferMessage}</p>}

      {/* Featured routes provide curated entry points until the user narrows the index. */}
      {!locked && (
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
                  onClick={() => selectTrack(item.id)}
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
      )}

      {/* Search and category filters share one result set; locked state keeps
          matching groups expanded so results remain discoverable. */}
      <div className="track-toolbar">
        <div className="search-box">
          <label htmlFor="track-search" className="visually-hidden">
            Search tracks and skills
          </label>
          <input
            id="track-search"
            ref={searchInput}
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
            <button type="button" className="link-button" onClick={() => setAllExpanded(true)}>
              Expand all
            </button>
            <button type="button" className="link-button" onClick={() => setAllExpanded(false)}>
              Collapse all
            </button>
          </div>
        )}
      </div>

      <nav className="track-nav" aria-label="Roadmap tracks" onKeyDown={onTrackNavKeyDown}>
        {visibleCategories.map((category) => {
          // Search results and the domain filter are always shown; otherwise respect the user's choice
          const isOpen = locked || expanded.has(category.id);
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
                  disabled={locked}
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
                      onClick={() => selectTrack(track.id)}
                    >
                      {track.label}
                      {doneInTrack(track.id) > 0 && (
                        <span className="tab-progress">
                          {doneInTrack(track.id)}/{trackSkillIds[track.id].length}
                        </span>
                      )}
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

      <div id="roadmap-view" className="roadmap-view" ref={roadmapRef} tabIndex={-1} aria-label={`${roadmapData[selectedTrack]?.title ?? "Roadmap"} roadmap`}>
        <Roadmap
          category={selectedTrack}
          completed={completed}
          onToggle={toggle}
          onSelectTrack={selectTrack}
          resourceFilter={resourceFilter}
          onResourceFilter={setResourceFilter}
        />
      </div>
    </div>
  )
}

export default App
