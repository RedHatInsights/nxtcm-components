# Scoring

How to produce **one score from 1 to 5** per issue for how well the ticket **content** fits its work type.

**What the score measures:** description quality ([GENERAL.md](GENERAL.md)) **plus** type-specific content — judged using the **Scoring** section in the matching type file.

**What the score does not measure (for now):** whether the ticket uses the correct template headings. See [What to ignore](#what-to-ignore).

Type-specific dimensions, weak/strong signals, and calibration examples live **only** in discovered type files under [JIRA_TYPE/](JIRA_TYPE/README.md) — update or add a type file when a rubric changes.

---

## Before you score each issue

1. Have **`classified_type`** from [CLASSIFY.md](JIRA_TYPE/CLASSIFY.md) and **`summary` + `description`** from [JIRA.md](JIRA.md) or [DRAFT_INPUT.md](DRAFT_INPUT.md).
2. Read [GENERAL.md](GENERAL.md) (WHAT + WHY).
3. Open the **Scoring** section in the type file for `classified_type` — resolve path via [JIRA_TYPE/README.md](JIRA_TYPE/README.md).
4. Judge **substance** in the ticket body even when sections are merged, mislabeled, or buried in comments.

---

## How to combine into one score

1. Evaluate **description** (WHAT + WHY) and **type-specific content** together — **one** holistic **1–5**, not separate scores per section.
2. Use the **full range** (1–5) so results sort meaningfully; avoid defaulting everything to 3.
3. Apply the **balance rule:** a **5** requires both a clear description **and** strong type-specific content. One without the other caps the score — see the type file for typical caps.
4. Write a short **justification**: main gaps (below 5) or why it is strong (4–5).

---

## Scale (1–5)

| Score | Meaning |
|-------|---------|
| **5** | **High fit.** Description and type-specific content **clearly meet** that type’s rubric. Minimal clarification needed. |
| **4** | **Good fit.** Mostly complete; only **minor** gaps (small ambiguity, one thin area). |
| **3** | **Partial fit.** Intent is visible but **important** pieces are missing, vague, or untestable. |
| **2** | **Weak fit.** Large holes in description **or** type-specific content. |
| **1** | **Poor fit.** Title-only, wrong kind of content for the type, or too little text to understand the work. |

Use the type file’s **Scoring** section to decide which gaps map to 2 vs 3 vs 4 — each type defines its own weak/strong signals and examples.

---

## What to ignore

- Template **section headings** (`### Description`, `### Acceptance Criteria`, etc.) — missing headings do **not** lower the score if the content is present elsewhere.
- **Optional** template sections named in the type file’s **Description template** unless absence leaves a real content gap.
- Jira **issuetype** vs content mismatch — recorded in [CLASSIFY.md](JIRA_TYPE/CLASSIFY.md) for the report; **not** an automatic score penalty.

---

## Record per issue

| Field | Content |
|-------|---------|
| `score` | 1–5 |
| `score_justification` | Short paragraph or bullets |
| `classified_type` | From classify step |

Type-specific scoring rules → **only** in the type file for that `classified_type`.
