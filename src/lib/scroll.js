// Respect the user's motion preference for programmatic navigation.
const prefersReducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// Shared scroll helper for moving between the browser, roadmap, and filters.
export const scrollToElement = (element) =>
  element?.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
