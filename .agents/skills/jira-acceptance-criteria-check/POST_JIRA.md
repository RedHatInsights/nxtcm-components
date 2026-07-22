# Post suggestions to Jira (optional)

After [REPORT.md](REPORT.md) delivers the check output, offer to save **Needs review** suggestions as Jira comments via **MCP only**.

---

## When to ask

Ask **only when all** are true:

| Condition | Notes |
|-----------|-------|
| Step 5 report is complete | Chat (1 issue) or `jira-acceptance-criteria-check-report.md` + chat pointer (2+) |
| At least one **Needs review** item | Score **1–3** **and** a draft was produced ([DRAFT.md](DRAFT.md)) |
| At least one postable key | Real Jira key (e.g. `<KEY>`) — not `DRAFT-*`, `#n`, or synthetic-only ids ([DRAFT_INPUT.md](DRAFT_INPUT.md)) |

If **no** item qualifies → **do not ask**; end the skill after the report.

**Prompt (one short question):**

> Post **N** suggestion(s) as Jira comment(s) using MCP? (yes / no)

Replace **N** with the count of postable **Needs review** keys. If the user restricts keys in their reply (“only `<KEY>`”), honor that subset.

**Do not post** unless the user clearly agrees (**yes**, **y**, **post**, **save**, etc.). **No** or silence → stop; no Jira writes.

---

## Which issues to post

| Include | Exclude |
|---------|---------|
| **Needs review** — score 1–3 with suggested `###` sections | **Ready** (4–5) |
| Real Jira keys from this run | **Needs Refinement** (1–3 without draft) |
| User-approved subset when they name keys | Synthetic / draft-only ids |

---

## Skip duplicate comments

Before posting a key, check whether this run already found an existing Jira comment that **starts with** the type file’s **Comment prefix** from **Type metadata** ([JIRA_TYPE/README.md](JIRA_TYPE/README.md)).

**Fallback** when a type omits **Comment prefix** — infer from that type file’s **Description template** headings only:

| Template signal | Prefix |
|-----------------|--------|
| Includes **Acceptance Criteria** (or equivalent) | `Suggested Acceptance Criteria` |
| Primary sections are outcomes / goals / research deliverables (not AC) | `Suggested Goals` |
| Other | `Suggested Description` |

**Source:** comment data from [DRAFT.md](DRAFT.md) enrichment in this run — **do not** re-fetch just to double-check.

If a prior suggested comment exists for a key → **skip** that key. Tell the user Jira already has a suggested comment; they can edit or delete it in Jira if they want a new one.

If **every** postable key is skipped → summarize; run **no** `mcp__jira-mcp-server__addCommentToJiraIssue` calls.

---

## MCP transport

Use Fleet-standard Jira MCP tools (`mcp__jira-mcp-server__*`). If unavailable, fall back to Cursor's `user-atlassian-mcp-server` equivalents — see [CONVENTIONS.md](CONVENTIONS.md) § MCP transport.

1. Read MCP tool schemas — prefer `mcp__jira-mcp-server__*` (Claude Code, OpenCode); else `user-atlassian-mcp-server` (Cursor).
2. If only `mcp_auth` is exposed → call `mcp_auth` for the Atlassian server with `{}`, then re-check tools.
3. Resolve `cloudId` via `mcp__jira-mcp-server__getAccessibleAtlassianResources` (or `getAccessibleAtlassianResources`; or pass `<JIRA-SITE>` per tool docs).
4. For each key **not** skipped, call **`mcp__jira-mcp-server__addCommentToJiraIssue`** (or `addCommentToJiraIssue`):
   - `issueIdOrKey`: the Jira key
   - `commentBody`: built per [Comment body](#comment-body) below
   - `contentFormat`: `"markdown"`

**On MCP failure** (auth, server missing, API error): report the **full error** for that key. Tell the user to fix MCP in **Settings → MCP** (Atlassian server enabled; complete the host MCP auth flow if prompted) and re-run the post step if they want.

After **each** successful post, confirm in chat: key + “comment posted”. On failure, show the error and continue or stop per user preference.

---

## Comment body

Build one `commentBody` per key from the **Needs review** content for that issue in this run’s report (chat or `jira-acceptance-criteria-check-report.md`).

**Header (lines 1–2):**

Line 1: **Comment prefix** from the issue’s type file **Type metadata** ([JIRA_TYPE/README.md](JIRA_TYPE/README.md)); use [Skip duplicate comments](#skip-duplicate-comments) fallbacks if missing.

Line 2 (all types): `Created with AI`

Then **one blank line**, then the issue block from the report:

- **Score: N** and **Score note** when present
- **Recommend change to \<type\>** when `type_match` is **mismatch**
- All suggested **`###` sections** and their bullets/content

**Do not** drop sections to save space — post the same suggestion the user saw in the check output.

Preserve markdown (`*`, `**`, nesting). Omit the `## KEY - Summary` title line (the key is the issue); include everything else from the item block through the last `###` section.

---

## Synthetic / draft-only runs

When input came from [DRAFT_INPUT.md](DRAFT_INPUT.md) with **no** real Jira keys → **never** ask to post; **never** call MCP for comments.

When a run mixes Jira keys and draft IDs → ask only about postable Jira keys; skip draft IDs silently in the count unless the user asks.
