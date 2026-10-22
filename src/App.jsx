import { useState } from 'react'
import Header from './Header'
import Roadmap from './RoadMap'
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";

// Each id must match a top-level key in assets/roadmap.json
const TRACKS = [
  { id: "frontend", label: "Frontend" },
  { id: "backend", label: "Backend" },
  { id: "ai", label: "AI & Machine Learning" },
  { id: "cloud", label: "Cloud & DevOps" },
];

function App() {
  const [selectedCategory, setSelectedCategory] = useState("frontend");

  return (
    // data-track drives the per-track accent colors defined in App.css
    <div className="app-shell" data-track={selectedCategory}>
      <Header />
      {/* aria-pressed exposes the selected track to assistive technology */}
      <nav className="track-tabs" aria-label="Roadmap tracks">
        {TRACKS.map((track) => (
          <button
            key={track.id}
            type="button"
            className="track-tab"
            aria-pressed={selectedCategory === track.id}
            onClick={() => setSelectedCategory(track.id)}
          >
            {track.label}
          </button>
        ))}
      </nav>
      <Roadmap category={selectedCategory} />
    </div>
  )
}

export default App
