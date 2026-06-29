---
name: jira-acceptance-criteria-check
description: >-
  Fetches Jira work items, classifies by work type using rubrics in JIRA_TYPE/,
  scores description and type-specific content 1–5, drafts suggested ticket content
  for low scores when enough context exists, and reports Ready / Needs review /
  Needs Refinement (chat for one issue; markdown file for two or more). After the
  report, optionally posts Needs review suggestions (scores 1–3 with a draft) as
  Jira comments via MCP when the user agrees. Supports synthetic draft input from
  jira-epic-breakdown or pasted bodies without Jira fetch.
user-invocable: true
---

# Acceptance criteria check

Evaluate Jira tickets for description quality and type-specific content per the rubric for `classified_type`. **Optional Jira comment writes** only after the report and only when the user agrees ([POST_JIRA.md](POST_JIRA.md)).

---

## Companion files

| Step | File |
|------|------|
| Shared conventions (all Jira skills) | [CONVENTIONS.md](CONVENTIONS.md) |
| Fetch | [JIRA.md](JIRA.md) · [DRAFT_INPUT.md](DRAFT_INPUT.md) (synthetic / pre-Jira drafts) |
| Classify | [CLASSIFY.md](JIRA_TYPE/CLASSIFY.md) · [JIRA_TYPE/](JIRA_TYPE/README.md) (discover types) |
| Description (all types) | [GENERAL.md](GENERAL.md) |
| Type rubrics | `JIRA_TYPE/*.md` — one file per type (excludes `CLASSIFY.md`, `README.md`) |
| Score | [SCORING.md](SCORING.md) |
| Draft (scores 1–3) | [DRAFT.md](DRAFT.md) |
| Report | [REPORT.md](REPORT.md) |
| Step 6 — Post suggestions (optional) | [POST_JIRA.md](POST_JIRA.md) |

| `classified_type` | Type file |
|-------------------|-----------|
| *(slug)* | `JIRA_TYPE/{slug}.md` — discover slugs per [JIRA_TYPE/README.md](JIRA_TYPE/README.md) |

**Bundled defaults:** story · task · bug · spike ([STORY.md](JIRA_TYPE/STORY.md), [TASK.md](JIRA_TYPE/TASK.md), [BUG.md](JIRA_TYPE/BUG.md), [SPIKE.md](JIRA_TYPE/SPIKE.md)). Teams may add types (e.g. `SUB_TASK.md`) without editing this skill.

---

## Workflow

### 1. Get issues

**Jira keys or JQL** → follow [JIRA.md](JIRA.md) (**MCP only**).

**Draft bodies with no Jira keys** (e.g. **jira-epic-breakdown** pre-delivery review, pasted tickets) → follow [DRAFT_INPUT.md](DRAFT_INPUT.md). **Do not fetch Jira** when synthetic input is already in scope.

**Stop** if MCP fetch fails — tell the user how to fix Atlassian MCP setup; do not continue.

**Stop** if Jira search returns **zero issues** — tell the user no items matched; do not classify, score, or report empty buckets.

**Stop** if synthetic input has zero parseable issues — say so; do not continue.

Otherwise hold the issue list internally for steps 2–5. Do not dump raw fetch output unless the user asked.

---

### 2. Classify each item

For **each** issue from step 1:

1. Discover type rubrics in [JIRA_TYPE/](JIRA_TYPE/README.md).
2. Follow [CLASSIFY.md](JIRA_TYPE/CLASSIFY.md).

Record per issue: `jira_issuetype`, `classified_type`, `classified_type_file`, `type_match`, and mismatch fields when applicable.

---

### 3. Score each item

For **each** issue:

1. Read [GENERAL.md](GENERAL.md) (WHAT + WHY).
2. Open the type file for `classified_type` (from classify step) and read its **Scoring** section.
3. Follow [SCORING.md](SCORING.md) to assign **one score 1–5** and a short `score_justification`.

Score **substance**, not template headings ([SCORING.md](SCORING.md) — what to ignore).

---

### 4. Draft suggested content (scores 1–3 only)

For each issue scored **1, 2, or 3**:

1. Use [GENERAL.md](GENERAL.md) and the **Description template** in that issue’s type file.
2. Follow [DRAFT.md](DRAFT.md) for enrichment, formatting, and sources.
3. Produce suggested Jira body content using the type file’s **`###` section headings** from its **Description template**.

**Do not guess or extrapolate.** If there is **not enough information** for honest, type-appropriate suggestions, **skip drafting** for that issue — it lands in **Needs Refinement** (not **Needs review**). See [REPORT.md](REPORT.md) bucket rules.

Issues scored **4 or 5** — skip this step.

---

### 5. Report

Follow [REPORT.md](REPORT.md):

- **Ready** — scores 4–5  
- **Needs review** — scores 1–3 with a draft  
- **Needs Refinement** — scores 1–3 without a draft  

**One issue** → full content in chat; **omit** section headers (`# Ready`, etc.).

**Two or more issues** → write `jira-acceptance-criteria-check-report.md`; chat gets only a short pointer (path, JQL, counts).

Include **Recommend change to \<type\>** when [CLASSIFY.md](JIRA_TYPE/CLASSIFY.md) reports a type mismatch.

---

### 6. Offer to post suggestions (optional)

When step 5 included at least one **Needs review** item (score **1–3** with a draft) on a **real Jira key**, ask whether to save those suggestions as Jira comments.

Follow [POST_JIRA.md](POST_JIRA.md):

- **Ask** once after the report — do not post without clear user agreement.
- **Post only** Needs review items (scores 1–3 **with** suggestions) — not Ready, not Needs Refinement.
- **Use MCP** (`addCommentToJiraIssue`).
- **Skip** synthetic/draft-only ids and keys that already have a prior `Suggested …` comment from this run’s enrichment.

If nothing qualifies for posting, skip this step.
