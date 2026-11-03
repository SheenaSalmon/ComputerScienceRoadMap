import { trackSkillIds } from "../data/trackIndex";

// The grouped, collapsible index of tracks. Groups open when the user expands
// them or when search / a domain filter locks them open. Keyboard: arrow keys,
// Home and End move between track buttons so the long list needs few Tab presses.
// This project does not use a runtime prop-types dependency.
/* eslint-disable react/prop-types */
export default function TrackList({
  categories,
  locked,
  expanded,
  onToggleCategory,
  selectedTrack,
  onSelectTrack,
  doneInTrack,
  searchRef,
}) {
  const onKeyDown = (event) => {
    if (!event.target.classList.contains("track-tab")) return;
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    const tabs = [...event.currentTarget.querySelectorAll(".track-tab")];
    const index = tabs.indexOf(event.target);
    let next;
    if (event.key === "ArrowRight" || event.key === "ArrowDown") next = tabs[Math.min(index + 1, tabs.length - 1)];
    else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
      // From the first track, go back up to the search box.
      next = index === 0 ? searchRef.current : tabs[index - 1];
    } else if (event.key === "Home") next = tabs[0];
    else if (event.key === "End") next = tabs[tabs.length - 1];
    if (next) {
      event.preventDefault();
      next.focus();
    }
  };

  return (
    <nav className="track-nav" aria-label="Roadmap tracks" onKeyDown={onKeyDown}>
      {categories.map((category) => {
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
                onClick={() => onToggleCategory(category.id)}
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
                    onClick={() => onSelectTrack(track.id)}
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
  );
}
