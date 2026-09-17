# Scoring

Produce **one `bot_confidence_score` from 1 to 5** per item — how likely an autonomous coding bot can **complete the work successfully** with minimal human intervention.

**5** = high confidence · **1** = poor fit for bot pickup.

**All** criterion-specific rubrics and scoring guidance live in [CRITERIA/](CRITERIA/README.md). This file defines **only** how to combine criterion ratings into one holistic score.

---

## Before you score each item

1. Have **`summary` + `description`** (+ comments if enriched) from [JIRA.md](JIRA.md) or [PASTED_INPUT.md](PASTED_INPUT.md).
2. Have **repo findings** from [REPO.md](REPO.md) unless ticket-only mode.
3. **Discover criteria** per [CRITERIA/README.md](CRITERIA/README.md) and read every criterion file.
4. Judge **substance**, not Jira template headings — missing `### Acceptance Criteria` does not lower the score if testable outcomes appear elsewhere.

---

## Per-criterion assessment

For **each** discovered criterion:

1. Open `CRITERIA/{slug}.md` for that slug.
2. Apply its **Scoring** section — every criterion file defines its own scale and examples.
3. Record internally:
   - `criterion_slug`
   - `criterion_rating` — from that file’s scale (typically 1–5 **for that dimension**)
   - `criterion_notes` — one short paragraph or bullets

Do **not** expose separate criterion scores in the user report unless [REPORT.md](REPORT.md) § Detail mode applies.

---

## Combine into one score

1. Evaluate **all** discovered criteria together — **one** holistic **1–5**.
2. Use the **full range**; avoid clustering everything at 3.
3. Each criterion file may define **caps** or **weight hints** in its metadata — apply those first.
4. Balance the ratings:
   - **5** typically requires strong marks across all criteria.
   - Any criterion flagged as **critical** or **blocking** in its file caps the holistic score.
   - When criteria conflict (e.g., clear description but large blast radius), favor the lower rating.
5. Write **`score_justification`** — main drivers, blockers, and bot strengths.
6. Write **`blockers`** — bullets of what a human should resolve first:
   - **Empty** (`*None.*`) when score ≥ 4 and nothing material remains
   - **Populated** when score ≤ 3 — include specific open questions, missing information (URLs, copy, commands), large blast radius concerns, or other gaps preventing autonomous bot work
   - Be **specific**: "Missing: URL for learn more link" not "needs more info"
7. Write **`bot_strengths`** — bullets when score ≥ 4 (why this is a good pickup).

---

## Scale (1–5) — holistic bot confidence

| Score | Meaning |
|-------|---------|
| **5** | **High confidence.** Bot can likely implement and test with minimal guidance. |
| **4** | **Good candidate.** Bot likely succeeds with light review. |
| **3** | **Marginal.** Bot may stall or need mid-flight human decisions. |
| **2** | **Poor fit.** Significant gaps or complexity. |
| **1** | **Not suitable.** Title-only, contradictory, or requires decisions not in the ticket. |

**Specific thresholds** (what makes a 5 vs 4, what caps at 3) are defined in each criterion file’s **Scoring** section and **Weight hint** metadata.

---

## What to ignore

- Missing template section headings when content exists elsewhere
- Jira `issuetype` label vs actual work shape — note in report if helpful, not an automatic penalty
- Story point or priority fields — unless user asked to filter on them

---

## Record per issue

| Field | Content |
|-------|---------|
| `bot_confidence_score` | 1–5 |
| `score_justification` | Short paragraph |
| `blockers` | Bullet list |
| `bot_strengths` | Bullet list (when score ≥ 4) |
| `blast_radius` | From [REPO.md](REPO.md) |
| `likely_files` | Paths when known |
| `criteria` | Internal per-criterion notes |
