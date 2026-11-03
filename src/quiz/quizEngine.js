// Pure quiz logic: picking questions, shuffling choices, scoring and validating
// quiz files. There is no React, DOM or storage code here, so the same module is
// used by the UI, by scripts/validate-quizzes.mjs (plain Node) and by tests.
//
// Quiz file shape (src/assets/quizzes/<trackId>.json):
//   { trackId, levels: [{ level, passMark?, questions: [
//       { id, skillId, prompt, code?, choices[], answer, explanation } ] }] }
// `level` must match a level name in the track's roadmap. `answer` is the index
// of the correct entry in `choices`.

export const QUESTIONS_PER_RUN = 10;
export const DEFAULT_PASS_MARK = 0.7;

// Fisher-Yates on a copy. `rng` is injectable so tests can be deterministic.
export function shuffle(items, rng = Math.random) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Draw a random subset of a level's questions and shuffle each question's
// choices. The returned `answer` is re-mapped to the shuffled position, so the
// stored answer index never has to match the order the learner sees.
export function buildRun(level, rng = Math.random, count = QUESTIONS_PER_RUN) {
  const questions = shuffle(level.questions, rng).slice(0, count).map((question) => {
    const order = shuffle(question.choices.map((_, index) => index), rng);
    return {
      id: question.id,
      skillId: question.skillId,
      prompt: question.prompt,
      code: question.code,
      explanation: question.explanation,
      choices: order.map((index) => question.choices[index]),
      answer: order.indexOf(question.answer),
    };
  });
  return {
    level: level.level,
    passMark: level.passMark ?? DEFAULT_PASS_MARK,
    questions,
  };
}

// Score a finished run. `picks[i]` is the chosen choice index for question i
// (or undefined if skipped). `missed` keeps what the results screen needs.
export function scoreRun(run, picks) {
  const missed = [];
  let correct = 0;
  run.questions.forEach((question, index) => {
    if (picks[index] === question.answer) correct += 1;
    else missed.push({ question, picked: picks[index] });
  });
  const total = run.questions.length;
  const ratio = total ? correct / total : 0;
  return {
    correct,
    total,
    percent: Math.round(ratio * 100),
    passed: total > 0 && ratio >= run.passMark,
    missed,
  };
}

// Check a quiz file against its track. Returns a list of human-readable
// problems (empty means valid). `track` is the roadmap object for quiz.trackId.
export function validateQuiz(quiz, track) {
  const issues = [];
  const isText = (value) => typeof value === "string" && value.trim() !== "";

  if (!track) return [`Track "${quiz?.trackId}" does not exist.`];
  const trackSkills = new Set(track.levels.flatMap((l) => l.skills.map((s) => s.id)));
  const levelNames = new Set(track.levels.map((l) => l.level));
  const seenIds = new Set();

  if (!Array.isArray(quiz.levels) || quiz.levels.length === 0) {
    return [`${quiz.trackId}: needs at least one level.`];
  }

  for (const level of quiz.levels) {
    const where = `${quiz.trackId} / ${level.level}`;
    if (!levelNames.has(level.level)) issues.push(`${where}: no such level in the roadmap.`);
    if (level.passMark !== undefined && !(level.passMark > 0 && level.passMark <= 1)) {
      issues.push(`${where}: passMark must be above 0 and at most 1.`);
    }
    if (!Array.isArray(level.questions) || level.questions.length === 0) {
      issues.push(`${where}: needs at least one question.`);
      continue;
    }
    for (const q of level.questions) {
      const at = `${where} / ${q.id ?? "(no id)"}`;
      if (!isText(q.id)) issues.push(`${at}: missing id.`);
      else if (seenIds.has(q.id)) issues.push(`${at}: duplicate question id.`);
      else seenIds.add(q.id);
      if (!isText(q.prompt)) issues.push(`${at}: missing prompt.`);
      if (!isText(q.explanation)) issues.push(`${at}: missing explanation.`);
      if (!trackSkills.has(q.skillId)) issues.push(`${at}: skillId "${q.skillId}" is not in this track.`);
      const choices = q.choices;
      if (!Array.isArray(choices) || choices.length < 2 || choices.length > 6 || !choices.every(isText)) {
        issues.push(`${at}: needs 2 to 6 non-empty choices.`);
      } else if (new Set(choices.map((c) => c.trim().toLowerCase())).size !== choices.length) {
        issues.push(`${at}: choices must be distinct.`);
      } else if (!Number.isInteger(q.answer) || q.answer < 0 || q.answer >= choices.length) {
        issues.push(`${at}: answer must be the index of a choice.`);
      }
    }
  }
  return issues;
}
