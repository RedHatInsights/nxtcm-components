# Jira fetch

Fetch work items for **jira-acceptance-criteria-check** via **Atlassian MCP only** — no CLI fallback.

Shared MCP rules: [CONVENTIONS.md](CONVENTIONS.md). This file adds AC-specific input defaults.

**Draft / synthetic input (no Jira):** When issues are not in Jira yet — e.g. **jira-epic-breakdown** pre-delivery review — use [DRAFT_INPUT.md](DRAFT_INPUT.md) instead of this file.

**Site:** `redhat.atlassian.net`

**Output:** Do **not** dump the raw fetch to the user. Hold the resolved JQL and issue payloads in memory for later steps in [SKILL.md](SKILL.md) (classify → score → draft → report). Mention fetch failures only when the workflow must stop.

---

## 1. Resolve scope → JQL

**Input** (same turn or immediate follow-up):

| Input | Action |
|-------|--------|
| Issue keys (e.g. `FCN-232`, `FCN-1 FCN-2`) | `key in (FCN-232, …)` — keys beat filters when both are given |
| Full JQL string | Use after a quick sanity check |
| Natural language | Translate to a single JQL string (e.g. assigned to me, under epic FCN-100, my open stories in fcn) |

**Default JQL** when the user gives **no filter hints** (team-specific example — adapt project and fields to the user’s site):

```text
project = fcn AND status in ("To Do") AND type in (Story, Task, Spike) AND "Story Points" is EMPTY
```

**Common JQL fragments** (combine with `AND`; rename fields if Jira errors — sites differ):

| Intent | Example |
|--------|---------|
| Assigned to me | `assignee = currentUser()` |
| Assigned to someone | `assignee = "user.name"` (or account id) |
| Direct parent | `parent = FCN-100` |
| Epic link (classic) | `"Epic Link" = FCN-100` |
| Hierarchy (some sites) | `issue in childIssuesOf("FCN-100")` |

If the ask is **ambiguous** (e.g. “my team’s tickets” with no project), ask **one** short clarifying question before searching.

---

## 2. Resolve fields

| User says | Fetch |
|-----------|--------|
| *(default)* | `key`, `summary`, `description` |
| Names other fields | Those fields instead of or in addition to the default |

**Pipeline note:** For jira-acceptance-criteria-check runs, always also fetch **`issuetype`** — [CLASSIFY.md](JIRA_TYPE/CLASSIFY.md) needs it. Do not echo raw issue bodies in chat during fetch; later steps consume them.

---

## 3. Transport — MCP only

1. Read MCP tool schemas under `user-atlassian-mcp-server` before calling.
2. If only **`mcp_auth`** is listed → call `mcp_auth` for `user-atlassian-mcp-server` with `{}`, then re-check tools.
3. `getAccessibleAtlassianResources` → `cloudId` for `redhat.atlassian.net`.
4. **One key:** `getJiraIssue` with requested fields; `responseContentFormat: "markdown"` for description when available.
5. **Many / JQL:** `searchJiraIssuesUsingJql` with the resolved JQL, `cloudId` for `redhat.atlassian.net`, and requested `fields`. When the response includes `nextPageToken`, repeat the search with that token until all issues are fetched or you hit a reasonable cap — do not silently truncate large result sets.

**If MCP fails** (server missing, tools unavailable after auth, or fetch error):

- **Stop** the skill. Do not classify or score without data.
- **Tell the user** how to fix:
  - Cursor → **Settings → MCP** — ensure the **Atlassian** MCP server is enabled.
  - Complete auth when prompted (`mcp_auth` for `user-atlassian-mcp-server`).
  - Retry the skill after MCP is connected.

There is **no** acli or other CLI fallback for this skill.

---

## 4. Hand off to downstream steps

Record internally (for the agent, not the user report):

| Item | Use |
|------|-----|
| Resolved JQL | Traceability in report header if needed |
| Transport | `MCP` |
| Issue list | `key`, `summary`, `description`, `issuetype` (+ any extra requested fields) |
| Gaps | Empty description, pagination truncated, field rename workarounds |

Pass the issue list to **classify** ([CLASSIFY.md](JIRA_TYPE/CLASSIFY.md)). Enrichment (parent, comments) for low-scored items happens later in [DRAFT.md](DRAFT.md), not here.
