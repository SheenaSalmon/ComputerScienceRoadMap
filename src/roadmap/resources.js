// Resource-type helpers shared by the filter chips and the resource list.
export const isVideo = (url) => /youtube\.com|youtu\.be/.test(url);

// Keep filter ids stable because they are passed from App and used to classify links.
export const FILTERS = [
  { id: "all", label: "All" },
  { id: "reading", label: "Reading" },
  { id: "videos", label: "Videos" },
];
