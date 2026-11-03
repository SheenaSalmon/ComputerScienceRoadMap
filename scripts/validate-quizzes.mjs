// Checks every quiz file in src/assets/quizzes against the roadmap data.
// Run with: npm run validate:quizzes   (exits 1 if any problem is found).
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { validateQuiz } from "../src/quiz/quizEngine.js";

const read = (path) => JSON.parse(readFileSync(path, "utf8"));

// Same merge the app does in roadmapData.js: roadmap.json plus tracks/*.json.
const tracksDir = "src/assets/tracks";
const roadmap = Object.assign(
  {},
  read("src/assets/roadmap.json"),
  ...readdirSync(tracksDir).filter((f) => f.endsWith(".json")).map((f) => read(join(tracksDir, f))),
);

const quizDir = "src/assets/quizzes";
const files = readdirSync(quizDir).filter((f) => f.endsWith(".json"));
let problems = 0;

for (const file of files) {
  const quiz = read(join(quizDir, file));
  const issues = validateQuiz(quiz, roadmap[quiz.trackId]);
  if (quiz.trackId !== file.replace(/\.json$/, "")) {
    issues.push(`${file}: trackId "${quiz.trackId}" must match the file name.`);
  }
  const count = quiz.levels?.reduce((sum, l) => sum + (l.questions?.length ?? 0), 0) ?? 0;
  console.log(`${issues.length ? "FAIL" : "ok  "} ${file} (${count} questions)`);
  issues.forEach((issue) => console.log(`   - ${issue}`));
  problems += issues.length;

  // Coverage is informational: list skills in this track that have no questions.
  const covered = new Set(quiz.levels?.flatMap((l) => l.questions?.map((q) => q.skillId) ?? []));
  const skills = roadmap[quiz.trackId]?.levels.flatMap((l) => l.skills) ?? [];
  const missing = skills.filter((s) => !covered.has(s.id));
  console.log(`   skill coverage: ${skills.length - missing.length}/${skills.length}`);
  missing.forEach((s) => console.log(`   (no questions) ${s.id}`));
}

if (problems > 0) process.exit(1);
console.log(`${files.length} quiz file(s) valid.`);
