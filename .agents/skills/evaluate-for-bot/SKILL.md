---
name: evaluate-for-bot
description: >-
  Evaluates Jira work items for bot/automation suitability using configurable
  rubrics in CRITERIA/. Scores each item 1–5 (5 = high confidence a coding bot
  will succeed) on description clarity, open questions, repo blast radius, and
  any added criteria. Accepts Jira keys, JQL, natural-language scope, or pasted
  ticket text. Optionally researches the active working directory repo. Reports good
  candidates vs items needing refinement. Use when the user asks which Jira
  items are good for a bot, agent, or automation to pick up.
user-invocable: true
---

# Evaluate for bot

Score Jira work items for **bot success confidence** (1–5). **5** = high confidence an autonomous coding agent can implement the item with minimal human intervention.

**§ numbers are stable step IDs — do not renumber when editing.**

**No Jira writes** — read-only evaluation and report.

**Jira integration:** Uses available Jira API/integration tools per [JIRA.md](JIRA.md).

---

## Companion files

| Step | File |
|------|------|
| Resolve input | [DISCOVERY.md](DISCOVERY.md) |
| Fetch Jira | [JIRA.md](JIRA.md) |
| Pasted / draft text | [PASTED_INPUT.md](PASTED_INPUT.md) |
| Repo research | [REPO.md](REPO.md) |
| Criteria rubrics | [CRITERIA/](CRITERIA/README.md) — one file per criterion |
| Combine scores | [SCORING.md](SCORING.md) |
| Output | [REPORT.md](REPORT.md) |

**Bundled criteria:** `description_clarity` · `open_questions` · `blast_radius`. Teams add criteria by dropping a new file in [CRITERIA/](CRITERIA/README.md) — no edits to this skill required.

---

## Workflow

### 1. Discover input

Follow [DISCOVERY.md](DISCOVERY.md).

Hold per run: issue list (keys or synthetic), resolved JQL when applicable, target **repo path** for blast-radius research (default: current working directory).

**Stop** if zero parseable items — tell the user; do not score.

**Stop** if Jira fetch is required and integration fails — [JIRA.md](JIRA.md).

---

### 2. Load item content

| Source | Action |
|--------|--------|
| Jira keys / JQL | [JIRA.md](JIRA.md) — `key`, `summary`, `description`, `issuetype`, `status` |
| Pasted descriptions | [PASTED_INPUT.md](PASTED_INPUT.md) — no Jira fetch |
| Mixed | Fetch keys; parse remaining text blocks as synthetic items |

Enrichment (comments, linked epic context from same thread) → [JIRA.md](JIRA.md) § Enrichment when it helps open-questions or clarity scoring.

---

### 3. Discover criteria

Follow [CRITERIA/README.md](CRITERIA/README.md):

1. List `*.md` in `CRITERIA/`.
2. Exclude `README.md`.
3. Each remaining file is one criterion slug.

Read every discovered criterion file before scoring.

---

### 4. Research repo (per item)

For **each** item, follow [REPO.md](REPO.md) before scoring `blast_radius` (and to inform other criteria when relevant).

Record: likely touch points, estimated blast radius, implementation path notes, repo confidence (`high` / `medium` / `low` / `none` when no repo access).

**Skip deep repo research** only when the user explicitly scoped **ticket-only** evaluation ([DISCOVERY.md](DISCOVERY.md) § Ticket-only mode). In that mode, score `blast_radius` from ticket text only and note **repo not searched** in the report.

---

### 5. Score each item

For **each** item:

1. Read every discovered criterion file.
2. Apply each criterion's **Scoring** section — record per-criterion ratings and notes.
3. Follow [SCORING.md](SCORING.md) to combine into **one holistic score 1–5** (`bot_confidence_score`).
4. List **blockers** and **bot strengths** per [SCORING.md](SCORING.md).

Use the **full range** (1–5). Avoid defaulting everything to 3.

---

### 6. Report

Follow [REPORT.md](REPORT.md):

- **Good candidates** — scores **4–5**
- **Marginal** — score **3**
- **Poor fit** — scores **1–2**

**One item** → full content in response; omit section bucket headers.

**Two or more** → write `evaluate-for-bot-report.md` to the target repo directory (or current directory if ticket-only mode); response includes only path, scope, repo path, issue count, and bucket counts.

---

## Anti-patterns

- Scoring blast radius without repo search when a repo is available and ticket-only mode was not requested
- Treating Jira template headings as substance
- Dumping raw Jira fetch output unless the user asked
- Inventing requirements or code paths not supported by ticket + repo evidence
- Adding criteria by editing `SKILL.md` or `SCORING.md` instead of adding a file under `CRITERIA/`
- Ignoring weight hints and caps defined in criterion files
