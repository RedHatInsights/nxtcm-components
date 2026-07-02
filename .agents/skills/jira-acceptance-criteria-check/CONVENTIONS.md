# Jira skills — shared conventions

Canonical definitions referenced by all Jira skills. **Do not reword rules here** — other Jira skills link here to avoid drift.

---

## Glossary

| Term | Meaning |
|------|---------|
| **`classified_type`** | Work-type slug from [JIRA_TYPE/](JIRA_TYPE/README.md) discovery (e.g. `story`, `task`, `bug`, `spike`). Used for scoring, templates, and breakdown tables. |
| **Planning slug** | Same as `classified_type` — the type assigned from rubric content, which may differ from Jira `issuetype`. |
| **Synthetic input** | Draft ticket bodies not yet in Jira — parsed per [DRAFT_INPUT.md](DRAFT_INPUT.md); no Jira fetch. |
| **Discovery gate** | Hard stop that asks for missing facts before fetch, draft, or scripts run. Each skill defines its own gate (§0 or step 1). |
| **Route lock** | After the user picks CLI or MCP for historical fetch, stay on that path for the rest of the run — no silent fallback. |
| **Needs review** | Report bucket: score 1–3 **with** a draft ([REPORT.md](REPORT.md)). |
| **Needs Refinement** | Report bucket: score 1–3 **without** a draft (not enough context to suggest honestly). |

---

## Paths and artifacts

| Symbol / file | Definition |
|---------------|------------|
| **`{workspace}`** | **Default:** active Cursor workspace root as an **absolute path**. **Override:** only when the user names a directory in the current thread — then use that path for the whole run. Do not infer from skill install path or prior chats. |
| **`{report-dir}`** | Parent directory of the resolved `.jira-historical-report.json` (absolute path). |
| **`.jira-historical-issues.json`** | Raw Jira fetch with changelog — produced by [jira-get-historical-items](../jira-get-historical-items/SKILL.md). |
| **`.jira-historical-report.json`** | Processed historical report — consumed by [jira-get-stats](../jira-get-stats/SKILL.md) and [jira-get-estimates](../jira-get-estimates/SKILL.md). |
| **Report lookup** (no user path) | 1) `{workspace}/.jira-historical-report.json` → 2) `~/.cursor/skills/.jira-historical-report.json` — first existing file wins. |

---

## Jira site defaults

| | Value |
|--|--------|
| Site | `redhat.atlassian.net` |
| Cloud ID (MCP) | `2b9e35e3-6bd3-4cec-b838-f4249ee02432` |
| Story points field (FCN) | `customfield_10028` |

Load `meta.storyPointsField` from a historical report when present; otherwise use `customfield_10028`.

---

## MCP transport

| Rule | Detail |
|------|--------|
| **MCP server** | `user-atlassian-mcp-server` |
| **Before calling** | Read tool schema JSON in the MCP descriptors folder |
| **Auth** | On **401**: `mcp_auth` for `user-atlassian-mcp-server`, retry once |
| **No `acli`** | Atlassian CLI is not a fallback for any active Jira skill |
| **Pagination** | When `searchJiraIssuesUsingJql` returns `nextPageToken`, repeat with the token until all issues are fetched or the skill’s cap is reached |

Common tools: `getAccessibleAtlassianResources`, `searchJiraIssuesUsingJql`, `getJiraIssue`, `createJiraIssue`, `editJiraIssue`, `addCommentToJiraIssue`.

---

## Section labels in skill docs

| Label | Role |
|-------|------|
| **Hard rules** | Orchestrator constraints — what the agent must / must not do |
| **Anti-patterns** | Content and slicing mistakes (epic authoring skills) |
| **Pitfalls** | Troubleshooting when something goes wrong at runtime |

---

## Skill index

| Skill | Use when |
|-------|----------|
| [jira-epic-create](../jira-epic-create/SKILL.md) | Draft a paste-ready epic description |
| [jira-epic-breakdown](../jira-epic-breakdown/SKILL.md) | Split an epic into child stories/tasks/spikes |
| [jira-acceptance-criteria-check](SKILL.md) | Score ticket quality; draft improvements |
| [jira-get-historical-items](../jira-get-historical-items/SKILL.md) | Fetch closed work + build cycle-time report |
| [jira-get-stats](../jira-get-stats/SKILL.md) | Summarize an existing historical report (read-only) |
| [jira-get-estimates](../jira-get-estimates/SKILL.md) | Recommend story points from historical data |

**Typical pipeline:** historical-items → stats or estimates. **Authoring pipeline:** epic-create → epic-breakdown → acceptance-criteria-check (optional).

**Supersedes:** [OLD/jira-cycle-time-report](../OLD/jira-cycle-time-report/SKILL.md) — use jira-get-historical-items instead.
