# CRITERIA — bot suitability rubrics

This directory holds **one markdown file per evaluation criterion**. The skill discovers criteria at runtime — it does **not** assume a fixed set.

**Bundled defaults:** `DESCRIPTION_CLARITY.md`, `OPEN_QUESTIONS.md`, `BLAST_RADIUS.md`. Teams may add, rename, or remove criterion files to match how they pick bot work.

---

## What each criterion file defines

Each file is authoritative for **one dimension** of bot suitability:

- **Definition** — what the criterion measures
- **What to look for** — signals in ticket text, comments, and repo
- **Scoring** — how to rate **that dimension** (typically 1–5 where higher = better for bot success)
- **Calibration examples** — anchor holistic scoring in [SCORING.md](../SCORING.md)

Other skill files (`SKILL.md`, `SCORING.md`, `REPORT.md`) **never** define criterion semantics — they discover files and delegate.

---

## Discovery

Before scoring each run:

1. List `*.md` in this directory.
2. **Exclude** `README.md` — orchestration only, not a criterion.
3. Each remaining file is one criterion. Its **slug** is the filename stem, lowercased, with `-` and spaces → `_` (e.g. `TEST_COVERAGE.md` → `test_coverage`).
4. Read the **Criterion metadata** section at the top of each file.

**Resolve file from slug:** `CRITERIA/{SLUG}.md` — try case-insensitive filename match if needed (e.g. slug `description_clarity` → `DESCRIPTION_CLARITY.md`).

---

## Adding a criterion

1. Copy an existing criterion file or use the skeleton below.
2. Name the file for the slug (e.g. `TEST_COVERAGE.md`).
3. Fill **Criterion metadata**, **What to look for**, and **Scoring**.
4. **No changes to `SKILL.md` required** — the next run discovers the new file automatically.

### Criterion file skeleton

```markdown
# Test coverage — bot suitability

Apply when evaluating criterion slug **test_coverage** (this file).

## Criterion metadata

| Field | Value |
|-------|-------|
| **Slug** | `test_coverage` |
| **Definition** | <One sentence: what this criterion measures for bot success.> |
| **Weight hint** | <optional — e.g. "blocking when rating ≤ 2"> |

---

## What to look for

<Bullets or table of signals.>

---

## Scoring

Rate **this criterion only** from 1–5 (higher = better for bot success).

### Weak vs strong

| Rating | Signals |
|--------|---------|
| … | … |

### Calibration examples

| Rating | Example |
|--------|---------|
| **5** | … |
| **1** | … |
```

---

## Bundled criteria

| Slug | File | Measures |
|------|------|----------|
| `description_clarity` | [DESCRIPTION_CLARITY.md](DESCRIPTION_CLARITY.md) | Enough ticket detail to know what to build or fix |
| `open_questions` | [OPEN_QUESTIONS.md](OPEN_QUESTIONS.md) | Unresolved questions and **missing required information** blocking autonomous work |
| `blast_radius` | [BLAST_RADIUS.md](BLAST_RADIUS.md) | Straightforward repo change with limited touch surface |

---

## How criteria interact

Criteria are **independent dimensions** but their **weight hints** create holistic caps:

- **`open_questions`** — critical gaps cap holistic score **≤ 3** (enforced in that file)
- **`blast_radius`** — large/unknown radius caps holistic score **≤ 3** (enforced in that file)  
- **`description_clarity`** — thin description unlikely above **2** (enforced in that file)

When **multiple** criteria have blocking issues, the holistic score reflects the **most restrictive** cap.

---

## Scope

This skill **does not** classify Jira work types. It evaluates **bot pickup fitness** — how likely an autonomous coding agent can complete the work successfully. Optional `issuetype` appears in the report for context only.
