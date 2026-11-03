import Icon from "../components/Icon";
import { isVideo } from "./resources";

// A skill's recommended resources, narrowed by the selected resource type. An
// empty filtered list gets an explanation instead of a blank gap.
// This project does not use a runtime prop-types dependency.
/* eslint-disable react/prop-types */
export default function ResourceList({ resources = [], filter }) {
  const shown = resources.filter(
    (r) => filter === "all" || (filter === "videos") === isVideo(r.url),
  );

  if (shown.length === 0) {
    return (
      <p className="small muted mb-0">
        {filter === "all" ? "No resources added yet." : `No ${filter} resources for this skill yet.`}
      </p>
    );
  }

  return (
    <>
      <h5 className="h6"><Icon name="book" /> Recommended resources</h5>
      <ul className="mb-0 bullet-list bullet-link">
        {shown.map((resource) => (
          <li key={resource.url}>
            {/* Announce the new-tab behavior to screen-reader users. */}
            <a href={resource.url} target="_blank" rel="noreferrer">
              <Icon name={isVideo(resource.url) ? "play" : "link"} className="resource-icon" />{" "}
              {resource.label}
              <span className="visually-hidden"> (opens in a new tab)</span>
            </a>
          </li>
        ))}
      </ul>
    </>
  );
}
