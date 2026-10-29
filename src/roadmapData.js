import baseRoadmap from "./assets/roadmap.json";

// Keep the original roadmap data in roadmap.json and place additional groups in
// tracks/*.json. Vite eagerly bundles those files, so each file must export an
// object keyed by track id and each id must be unique across all files.
const trackFiles = import.meta.glob("./assets/tracks/*.json", { eager: true });
const extraTracks = Object.assign(
  {},
  ...Object.values(trackFiles).map((file) => file.default),
);

// Single lookup of track id -> roadmap shared by search, progress, and rendering.
const roadmapData = { ...baseRoadmap, ...extraTracks };

export default roadmapData;
