import { useRef, useState } from "react";
import { allSkillIds } from "../data/trackIndex";

// Overall progress with export / import / reset. These controls sit with the
// track index so users can back up or clear progress without leaving their
// current roadmap. The component owns the file input and the transfer message;
// persistence itself stays in useProgress.
// This project does not use a runtime prop-types dependency.
/* eslint-disable react/prop-types */
export default function ProgressSummary({ completed, exportData, importData, reset }) {
  const fileInput = useRef(null);
  const [transferMessage, setTransferMessage] = useState("");

  const doneTotal = [...completed].filter((id) => allSkillIds.has(id)).length;

  const confirmReset = () => {
    if (window.confirm("Clear all saved progress on this device?")) reset();
  };

  const handleExport = () => {
    // Export only the hook's versioned progress payload; the browser handles the download.
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "cs-roadmap-progress.json";
    link.click();
    URL.revokeObjectURL(url);
    setTransferMessage(`Exported ${doneTotal} completed skills.`);
  };

  const handleImport = async (event) => {
    // Reset the input first so choosing the same file again still emits change.
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    const count = importData(await file.text(), allSkillIds);
    setTransferMessage(
      count < 0
        ? "That file isn’t a valid progress export."
        : `Imported ${count} completed skills and merged them with your progress.`,
    );
  };

  return (
    <>
      <div className="overall-progress">
        <span>
          <strong>{doneTotal}</strong> of {allSkillIds.size} skills complete across all tracks
        </span>
        <div className="progress-actions">
          {doneTotal > 0 && (
            <button type="button" className="link-button" onClick={handleExport}>
              Export
            </button>
          )}
          <button type="button" className="link-button" onClick={() => fileInput.current?.click()}>
            Import
          </button>
          {doneTotal > 0 && (
            <button type="button" className="link-button" onClick={confirmReset}>
              Reset progress
            </button>
          )}
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="visually-hidden"
            tabIndex={-1}
            aria-label="Import progress file"
            onChange={handleImport}
          />
        </div>
      </div>
      <p className="visually-hidden" role="status">{transferMessage}</p>
      {transferMessage && <p className="transfer-message small muted">{transferMessage}</p>}
    </>
  );
}
