import { useEffect, useRef, useState } from "react";
import DomainBar from "./components/DomainBar";
import Header from "./components/Header";
import TrackBrowser from "./components/TrackBrowser";
import { findCategory, trackSkillIds } from "./data/trackIndex";
import roadmapData from "./data/roadmapData";
import useProgress from "./hooks/useProgress";
import useTrackFilter from "./hooks/useTrackFilter";
import { scrollToElement } from "./lib/scroll";
import QuizDialog from "./quiz/QuizDialog";
import useQuizController from "./quiz/useQuizController";
import Roadmap from "./roadmap/Roadmap";
import "bootstrap/dist/css/bootstrap.min.css";
import "./App.css";
import "./quiz/quiz.css";

// App is the composition root. It owns only state that several areas share: the
// selected track, the track filter, resource filter and skill progress. Browsing
// UI lives in components/, roadmap rendering in roadmap/, quizzes in quiz/, and
// data lookups in data/.
//
// Track ids in categories.json must match keys in the merged roadmap data.
const DEFAULT_TRACK = "frontend";

function App() {
  const { completed, toggle, reset, exportData, importData } = useProgress();
  const filter = useTrackFilter();
  const [selectedTrack, setSelectedTrack] = useState(DEFAULT_TRACK);
  const [resourceFilter, setResourceFilter] = useState("all");
  const quiz = useQuizController(selectedTrack);

  const browserRef = useRef(null);
  const roadmapRef = useRef(null);
  // A counter allows selecting the same track repeatedly to trigger focus/scroll.
  const [scrollTick, setScrollTick] = useState(0);

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

  const chooseCategory = (categoryId) => {
    filter.chooseCategory(categoryId);
    scrollToElement(browserRef.current);
  };

  const doneInTrack = (trackId) =>
    (trackSkillIds[trackId] ?? []).filter((id) => completed.has(id)).length;

  return (
    // data-category drives the accent colors defined in App.css
    <div className="app-shell" data-category={findCategory(selectedTrack)?.id}>
      <Header />

      <DomainBar
        categoryFilter={filter.categoryFilter}
        onChoose={chooseCategory}
        selectedTrack={selectedTrack}
      />

      <TrackBrowser
        sectionRef={browserRef}
        filter={filter}
        selectedTrack={selectedTrack}
        onSelectTrack={selectTrack}
        progress={{ completed, exportData, importData, reset }}
        doneInTrack={doneInTrack}
      />

      <div
        id="roadmap-view"
        className="roadmap-view"
        ref={roadmapRef}
        tabIndex={-1}
        aria-label={`${roadmapData[selectedTrack]?.title ?? "Roadmap"} roadmap`}
      >
        <Roadmap
          category={selectedTrack}
          completed={completed}
          onToggle={toggle}
          onSelectTrack={selectTrack}
          resourceFilter={resourceFilter}
          onResourceFilter={setResourceFilter}
          quiz={quiz.roadmapQuiz}
        />
      </div>

      {quiz.active && (
        <QuizDialog
          key={`${selectedTrack}-${quiz.active.resultKey}`}
          trackId={selectedTrack}
          level={quiz.active.level}
          title={quiz.active.title}
          onClose={quiz.close}
          onResult={quiz.record}
        />
      )}
    </div>
  );
}

export default App;
