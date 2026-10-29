import baseRoadmap from "./assets/roadmap.json";

// Every JSON file in assets/tracks/ holds additional tracks keyed by track id.
// Vite bundles them at build time, so adding a file there is enough to add content.
const trackFiles = import.meta.glob("./assets/tracks/*.json", { eager: true });
const extraTracks = Object.assign(
  {},
  ...Object.values(trackFiles).map((file) => file.default),
);

// Single merged lookup of track id -> roadmap, used by the whole app
const roadmapData = { ...baseRoadmap, ...extraTracks };

export default roadmapData;
