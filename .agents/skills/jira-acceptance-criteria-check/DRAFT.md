# Draft suggested content

For issues scored **1–3** only ([SCORING.md](SCORING.md)). Produces suggested ticket body content for [REPORT.md](REPORT.md) **Needs review** section.

---

## When to draft

| Score | Action |
|-------|--------|
| **1–3** | Attempt a draft using [GENERAL.md](GENERAL.md) + type file **Description template** |
| **4–5** | Skip |

If drafting would require **guessing or extrapolating** product behavior, **do not draft** — the issue goes to **Needs Refinement**.

---

## Enrichment (optional fetch)

When Jira text is thin, fetch extra context before drafting:

- **Parent** issue and **comments** on the issue ([JIRA.md](JIRA.md) / **jira-items**)
- **Workspace repo** — read only files plausibly related to the ticket (same feature area, config, docs)

Use prior Jira comments that start with **Suggested …** as context; still produce an **updated** draft for this run.

When enrichment finds such a comment, **record it** for that key so [POST_JIRA.md](POST_JIRA.md) can skip duplicate posts.

---

## How to format

Use the **Description template** from the type file for `classified_type` (`JIRA_TYPE/{slug}.md`):

1. Open that file’s **Description template** section.
2. Draft every `###` heading listed there (skip optional sections unless you have real content).
3. Follow that type file’s rubric for bullets, nesting, and what “done” content looks like — do not assume sections from another type.

Match template **`###` headings**. Use `*` bullets for lists; nest with **2 spaces per level** where the type file’s guidance calls for grouping.

---

## Rules

- **Do not invent** behavior, APIs, or UX not supported by Jira text, parent, comments, or repo evidence.
- Draft **verifiable outcomes** per the type file’s template and scoring rubric — not implementation task lists unless that type file allows it.
- Omit optional template sections unless you have real content.
- Record whether a draft was produced — [REPORT.md](REPORT.md) uses that for **Needs review** vs **Needs Refinement**.
