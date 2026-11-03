import { useMemo, useState } from "react";
import { filterCategories, totalTracks } from "../data/trackIndex";

// Owns the track-browser filter state: the free-text query and the selected
// domain. Everything else (matching categories, counts, "locked open" state) is
// derived from those two values.
export default function useTrackFilter() {
  const [query, setQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const searchTerms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const isSearching = searchTerms.length > 0;
  const isFiltered = categoryFilter !== "all";
  // Search results and a selected-domain filter are locked open to expose results.
  const locked = isSearching || isFiltered;

  // searchTerms is derived from query, so query is the real dependency.
  const visibleCategories = useMemo(
    () => filterCategories(categoryFilter, searchTerms),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [query, categoryFilter],
  );
  const visibleTrackCount = visibleCategories.reduce((sum, c) => sum + c.tracks.length, 0);

  // Choosing a domain clears search so the domain filter remains the sole constraint.
  const chooseCategory = (categoryId) => {
    setCategoryFilter(categoryId);
    setQuery("");
  };

  return {
    query,
    setQuery,
    categoryFilter,
    chooseCategory,
    isSearching,
    isFiltered,
    locked,
    visibleCategories,
    visibleTrackCount,
    totalTracks,
  };
}
