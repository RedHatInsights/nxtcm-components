# JIRA_TYPE — work-type rubrics

This directory holds **one markdown file per work type**. The skill discovers types at runtime — it does **not** assume a fixed set of story / task / bug / spike.

**Glossary:** `classified_type` = the slug discovered from a type file (e.g. `story`). Same as **planning slug** in [jira-epic-breakdown](../../jira-epic-breakdown/CLASSIFY.md). Full shared terms → [CONVENTIONS.md](../CONVENTIONS.md).

**Bundled defaults:** `STORY.md`, `TASK.md`, `BUG.md`, `SPIKE.md`. Teams may add, rename, or remove type files (e.g. `SUB_TASK.md`, `EPIC.md`) to match their Jira setup.

---

## What each type means (authoritative source)

**Only** the **Definition** (and optional **Quick signals**, **Summary prefix hints**) in each type file’s **Type metadata** defines what that type is.

- Other skill files (`SKILL.md`, `CLASSIFY.md`, `SCORING.md`, `REPORT.md`, etc.) **never** define or assume type semantics — they discover files and delegate to the matching rubric.
- Teams use Jira differently (e.g. **Story** = any non-routine work, **Task** = routine maintenance). **Edit the type file’s Definition** to match your project; do not change orchestration files for that.

Everything else in a type file (description template, scoring rubric, section headings) describes **how to evaluate and draft** tickets **of that type** — still team-configurable, but separate from the one-line **Definition** of what the type is for.

---

## Discovery

Before classify, score, draft, or report:

1. List `*.md` in this directory.
2. **Exclude** `CLASSIFY.md` and `README.md` — they are orchestration docs, not types.
3. Each remaining file is one type. Its **slug** is the filename stem, lowercased, with `-` and spaces → `_` (e.g. `SUB_TASK.md` → `sub_task`, `Story.md` → `story`).
4. Read the **Type metadata** section at the top of each type file: **Definition** (what this type means), **Jira issuetype aliases**, **Quick signals**, optional **Summary prefix hints**, optional **Comment prefix**.

**Resolve type file from slug:** `JIRA_TYPE/{SLUG}.md` using the same stem rules in reverse — try exact stem match on case-insensitive filename if needed (e.g. slug `story` → `STORY.md`).

---

## Adding a type

1. Copy an existing type file or start from the skeleton below.
2. Name the file for the type (e.g. `SUB_TASK.md`).
3. Fill in **Type metadata** and the **Description template** / **Scoring** sections.
4. No changes to `SKILL.md` are required — classify will pick it up on the next run.

### Type file skeleton

```markdown
# Sub-task — evaluation criteria

Apply when `classified_type` is **sub_task** (this file).

## Type metadata

| Field | Value |
|-------|-------|
| **Slug** | `sub_task` |
| **Definition** | <One sentence: what kind of work this type represents for your team.> |
| **Jira issuetype aliases** | Sub-task, Subtask |
| **Quick signals** | <comma-separated tokens that often appear in summary/description> |
| **Summary prefix hints** | <optional — e.g. Sub-task:, [Sub-task]> |
| **Comment prefix** | Suggested Acceptance Criteria |

Description **WHAT** and **WHY** → [GENERAL.md](../GENERAL.md). This file adds the description template and scoring rubric ([SCORING.md](../SCORING.md)).

---

## Description template

### Description

...

## Scoring

...
```

---

## Classification

Follow [CLASSIFY.md](CLASSIFY.md): compare Jira `issuetype` + ticket content against **every** discovered type’s metadata and rubric intent, then assign the **best-fit slug** as `classified_type`.

When Jira `issuetype` maps to one slug but content fits another better → `type_match: mismatch` and recommend the content-fit slug in the report.

---

*Originally created by Kim Doberstein.*
