// Derived lookups over the domain list (categories.json) and the merged roadmap
// data. They are computed once at module load so components only do cheap reads.
// Track ids in categories.json must match keys in roadmapData.
import categories from "../assets/categories.json";
import roadmapData from "./roadmapData";

export { categories };

export const totalTracks = categories.reduce((sum, category) => sum + category.tracks.length, 0);

// Find the category that owns a track; used for accent colors and default expansion.
export const findCategory = (trackId) =>
  categories.find((category) => category.tracks.some((track) => track.id === trackId));

export const trackLabels = Object.fromEntries(
  categories.flatMap((category) => category.tracks.map((track) => [track.id, track.label])),
);

// Track id -> its skill ids, so progress summaries match the skills actually
// present in roadmap data, including tracks loaded from the assets/tracks glob.
export const trackSkillIds = Object.fromEntries(
  Object.entries(roadmapData).map(([id, track]) => [
    id,
    track.levels.flatMap((level) => level.skills.map((skill) => skill.id)),
  ]),
);

export const allSkillIds = new Set(Object.values(trackSkillIds).flat());

// Skill id -> display name across every track, so prerequisites can show
// readable labels even when they belong to a different track.
export const skillNames = Object.fromEntries(
  Object.values(roadmapData).flatMap((track) =>
    track.levels.flatMap((level) => level.skills.map((skill) => [skill.id, skill.name])),
  ),
);

// Sum planned learning time for featured-card summaries.
export const trackHours = (trackId) =>
  roadmapData[trackId]?.levels
    .flatMap((level) => level.skills)
    .reduce((sum, skill) => sum + (skill.estimatedHours || 0), 0) ?? 0;

// Searchable text per track (label, title, description, skill names), lower-cased
// once so keystrokes only perform simple substring checks.
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

// Pure filter: with no search terms, optionally narrow to one domain; with terms,
// keep tracks containing every term and drop domains left empty. Returns new
// objects rather than mutating the shared source data.
export function filterCategories(categoryFilter, searchTerms) {
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
}
