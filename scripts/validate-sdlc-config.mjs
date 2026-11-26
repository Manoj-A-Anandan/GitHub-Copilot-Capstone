#!/usr/bin/env node
// Static validation of the SDLC agent configuration. Run from the repository root:
//   node scripts/validate-sdlc-config.mjs
// Checks frontmatter, skill/instruction references, stage and retry documentation,
// code-review checklist, PR disclosure, and secret-like strings. Exit code 1 on any failure.
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const failures = [];
const passes = [];
const check = (name, ok, detail = "") => (ok ? passes : failures).push(detail ? `${name}: ${detail}` : name);
const read = (p) => readFileSync(p, "utf8").replace(/\r\n/g, "\n");

function frontmatter(text) {
  const match = text.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match) return null;
  const fields = {};
  for (const line of match[1].split("\n")) {
    const kv = line.match(/^([A-Za-z-]+):\s*(.*)$/);
    if (kv) fields[kv[1]] = kv[2];
  }
  return fields;
}

const agentFiles = readdirSync(".github/agents").filter((f) => f.endsWith(".agent.md"));
const agentNames = new Set();
for (const file of agentFiles) {
  const fm = frontmatter(read(join(".github/agents", file)));
  check(`agent ${file} has frontmatter`, fm !== null);
  if (!fm) continue;
  for (const key of ["name", "description", "tools"]) check(`agent ${file} has ${key}`, Boolean(fm[key]));
  check(`agent ${file} name matches file`, fm.name === file.replace(".agent.md", ""), fm.name);
  agentNames.add(fm.name);
}

const orchestratorText = read(".github/agents/sdlc-orchestrator.agent.md");
const listed = [...orchestratorText.match(/^agents:\n((?:  - .+\n)+)/m)[1].matchAll(/  - (.+)/g)].map((m) => m[1].trim());
for (const name of listed) check(`orchestrator lists existing agent ${name}`, agentNames.has(name));

const skillDirs = readdirSync(".github/skills").filter((d) => statSync(join(".github/skills", d)).isDirectory());
const skillNames = new Set();
for (const dir of skillDirs) {
  const file = join(".github/skills", dir, "SKILL.md");
  check(`skill ${dir} has SKILL.md`, existsSync(file));
  if (!existsSync(file)) continue;
  const fm = frontmatter(read(file));
  check(`skill ${dir} frontmatter name/description`, Boolean(fm?.name && fm?.description));
  check(`skill ${dir} name matches folder`, fm?.name === dir, fm?.name);
  skillNames.add(dir);
}

const instructionFiles = readdirSync(".github/instructions").filter((f) => f.endsWith(".instructions.md"));
for (const file of instructionFiles) {
  const fm = frontmatter(read(join(".github/instructions", file)));
  check(`instruction ${file} has applyTo`, Boolean(fm?.applyTo));
}

// Reference resolution: every `.github/...` path and every skills/<name> mentioned in agents/instructions/docs must exist.
const docsToScan = [
  ...agentFiles.map((f) => join(".github/agents", f)),
  ...instructionFiles.map((f) => join(".github/instructions", f)),
  ".github/copilot-instructions.md",
  ...skillDirs.map((d) => join(".github/skills", d, "SKILL.md")),
  "docs/sdlc/README.md",
  "docs/sdlc/orchestrator.md",
];
for (const file of docsToScan) {
  const text = read(file);
  for (const m of text.matchAll(/`(\.github\/[A-Za-z0-9_\-./*]+)`/g)) {
    const ref = m[1];
    if (ref.includes("*") || ref.endsWith("/")) continue;
    check(`${file} reference ${ref} resolves`, existsSync(ref));
  }
  for (const m of text.matchAll(/(?:skills\/|`)(requirements-analysis|architecture-design|js-implementation|code-review|testing-strategy|verification|pr-authoring|docs-sync-check|user-story-intake)(?:\/SKILL\.md)?`?/g)) {
    check(`${file} skill ${m[1]} exists`, skillNames.has(m[1]));
  }
}

// Every agent must reference its skills (not merely have skill files).
const requiredSkillRefs = {
  "requirements-analyst": ["requirements-analysis"],
  architect: ["architecture-design"],
  "design-reviewer": ["architecture-design"],
  "implementation-planner": ["architecture-design", "requirements-analysis"],
  implementer: ["js-implementation", "testing-strategy"],
  "code-reviewer": ["code-review"],
  verifier: ["verification", "testing-strategy"],
  "pr-creator": ["pr-authoring"],
};
for (const [agent, skills] of Object.entries(requiredSkillRefs)) {
  const text = read(`.github/agents/${agent}.agent.md`);
  for (const skill of skills) check(`agent ${agent} references skill ${skill}`, text.includes(skill));
  check(`agent ${agent} handles RETRY CONTEXT`, text.includes("RETRY CONTEXT"));
}
check("agent docs-sync handles RETRY CONTEXT", read(".github/agents/docs-sync.agent.md").includes("RETRY CONTEXT"));

// Orchestrator stage and retry documentation.
const orchestratorDoc = read("docs/sdlc/orchestrator.md");
for (const stage of ["Stage 0", "Stage 1", "Stage 2", "Stage 3", "Stage 4", "Stage 5", "Stage 6", "Stage 7", "Stage 8"]) {
  check(`docs/sdlc/orchestrator.md documents ${stage}`, orchestratorDoc.includes(`### ${stage}`));
}
for (const label of ["Responsible", "Inputs", "Outputs", "Preconditions", "Validation", "Next", "Human approval"]) {
  const count = orchestratorDoc.split(`| ${label} |`).length - 1;
  check(`docs/sdlc/orchestrator.md has '${label}' for every stage`, count >= 9, `found ${count}`);
}
check("docs/sdlc/orchestrator.md has Mermaid flowchart", /```mermaid\nflowchart/.test(orchestratorDoc));
for (const gate of ["G0", "G1", "G2", "G3", "G4", "G5", "G6", "G7", "G8"]) check(`orchestrator agent defines ${gate}`, orchestratorText.includes(gate));
for (const unit of ["0 Preflight", "1 Requirements", "2 Architecture", "3 Design review", "4 Planning", "5 Implementation", "6 Code review", "7 Verify", "8 PR, Phase A", "8 PR, Phase B", "docs-sync"]) {
  check(`orchestrator validation criteria cover ${unit}`, orchestratorText.includes(`| ${unit}`));
}
for (const phrase of ["Maximum attempts: 2", "RETRY CONTEXT", ".sdlc/retry-log.md", "Controlled revision cycle", "idempotent", "BLOCKED", "Limitation"]) {
  check(`orchestrator agent mentions '${phrase}'`, orchestratorText.includes(phrase));
}
check(".sdlc/retry-log.md exists", existsSync(".sdlc/retry-log.md"));

// Code review checklist: 15 areas and severity scale.
const reviewSkill = read(".github/skills/code-review/SKILL.md");
for (let i = 1; i <= 15; i += 1) check(`code-review skill checklist row ${i}`, new RegExp(`^\\| ${i} \\|`, "m").test(reviewSkill));
for (const sev of ["Blocker", "Major", "Minor", "Suggestion"]) check(`code-review skill defines ${sev}`, reviewSkill.includes(`**${sev}**`));
check("code-review skill forbids editing production code", /never fix|Report, never fix/i.test(reviewSkill));
check("code-reviewer agent cannot silently modify code", read(".github/agents/code-reviewer.agent.md").includes("never modify production code"));

// PR disclosure.
const disclosureLines = [
  "AI-Assisted Pull Request",
  "This pull request was created with the assistance of an AI-driven SDLC workflow.",
  "AI assistance was used for requirements analysis, planning, design, implementation and supporting documentation, as applicable to this PR.",
  "Human Review Required:",
  "All generated changes and supporting evidence must be reviewed and validated by a human before approval and merging.",
];
for (const file of [".github/agents/pr-creator.agent.md", ".github/skills/pr-authoring/SKILL.md"]) {
  const text = read(file);
  for (const line of disclosureLines) check(`${file} contains disclosure text '${line.slice(0, 40)}'`, text.includes(line));
}
check("pr-creator never merges", /never merge the PR/.test(read(".github/agents/pr-creator.agent.md")));
check("pr-creator uses idempotent comment marker", read(".github/agents/pr-creator.agent.md").includes("<!-- ai-sdlc-disclosure -->"));

// Secrets scan over the files this work touches.
const secretPattern = /ghp_[A-Za-z0-9]{36}|github_pat_[A-Za-z0-9_]{40,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|xox[abp]-[A-Za-z0-9-]{10,}/;
for (const file of docsToScan) check(`no secret-like string in ${file}`, !secretPattern.test(read(file)));

for (const line of passes) console.log(`PASS  ${line}`);
for (const line of failures) console.log(`FAIL  ${line}`);
console.log(`\n${passes.length} passed, ${failures.length} failed`);
process.exit(failures.length === 0 ? 0 : 1);
