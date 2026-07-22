# Synthetic / draft input (no Jira fetch)

Use when issues **do not exist in Jira yet** or the user pasted draft bodies — e.g. **jira-epic-breakdown** pre-delivery review, or “score these drafts” in chat.

**Skip [JIRA.md](JIRA.md) fetch** when synthetic input is already available in the same turn or from an earlier step in the conversation.

---

## When to use

| Source | Action |
|--------|--------|
| **jira-epic-breakdown** step 5 (internal) | Build synthetic list from drafted child items — see [jira-epic-breakdown/REVIEW.md](../jira-epic-breakdown/REVIEW.md) |
| User pasted ticket bodies | Parse into synthetic issues (summary, type, description per item) |
| User says “score drafts” / “check these before Jira” | Synthetic mode — do not fetch Jira unless user also gives keys |

When the user gives **Jira keys** or **JQL**, use [JIRA.md](JIRA.md) instead.

---

## Synthetic issue shape

Each issue must have:

| Field | Required | Notes |
|-------|----------|-------|
| `summary` | Yes | Title line |
| `description` | Yes | Full ticket body per its type template — may be empty only for title-only checks |
| `declared_type` or `issuetype` | Yes | Type slug — must match a rubric under [JIRA_TYPE/](JIRA_TYPE/README.md) |
| `draft_id` or `key` | Optional | Breakdown `#` or placeholder `DRAFT-1` — use in report when no Jira key exists |

For classify: treat `declared_type` as Jira `issuetype` when comparing to **Jira issuetype aliases** in each type file’s metadata ([JIRA_TYPE/README.md](JIRA_TYPE/README.md)).

---

## Downstream steps

After building the synthetic list, continue [SKILL.md](SKILL.md) from **step 2 Classify** — same classify, score, draft, and report rules as Jira-fetched issues.

### Report labels for drafts

When issues have no Jira key:

- Use `DRAFT-<#> - Summary` or `#<n> - Summary` in report lines (match jira-epic-breakdown numbering).
- Do **not** link to `redhat.atlassian.net/browse/...` for draft-only ids.

### Drafting (scores 1–3)

For **jira-epic-breakdown** internal review, revising the breakdown output takes priority over a separate jira-acceptance-criteria-check report file. Follow [jira-epic-breakdown/REVIEW.md](../jira-epic-breakdown/REVIEW.md) § Revise weak drafts.

When the user invoked **jira-acceptance-criteria-check** directly on pasted drafts (not via jira-epic-breakdown), follow normal [REPORT.md](REPORT.md) output.

---

## Hard rules

| Do | Do not |
|----|--------|
| Score substance in the draft body | Require Jira keys for draft review |
| Use epic/parent context from the same conversation when revising | Post Jira comments for draft-only ids |
| Record `declared_type` vs `classified_type` mismatch | Assume declared type is always correct |

**Jira comments:** [POST_JIRA.md](POST_JIRA.md) applies only to **real Jira keys**. Draft-only runs skip the post prompt.
