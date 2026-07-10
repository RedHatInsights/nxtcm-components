# Jira fetch and update

Supplement to [SKILL.md](SKILL.md). Target-issue search only — no changelog fetch.

For historical closed-item fetch (changelog, pipeline), use [jira-get-historical-items/SKILL.md](../jira-get-historical-items/SKILL.md).

Shared MCP rules: [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md).

---

## MCP server

Use Fleet-standard Jira MCP tools (`mcp__jira-mcp-server__*`). If unavailable, fall back to Cursor's `user-atlassian-mcp-server` equivalents — see [CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) § MCP transport.

Read MCP tool schemas before calling — prefer `mcp__jira-mcp-server__*` (Claude Code, OpenCode); else `user-atlassian-mcp-server` (Cursor).

| | Value |
|--|--------|
| Cloud ID | `<JIRA-SITE>` or value from [CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) |
| Story points field | `meta.storyPointsField` from the historical report when present; otherwise discover via project metadata |

---

## Fetch target issues

Call `mcp__jira-mcp-server__searchJiraIssuesUsingJql` (or `searchJiraIssuesUsingJql`) with:

- `cloudId`: `<JIRA-SITE>`
- `jql`: exact JQL from step 2
- `maxResults`: 50 (raise if user expects more; paginate with `nextPageToken` when needed)
- `responseContentFormat`: `markdown`
- `fields`: `summary`, `description`, `issuetype`, `status`, story points field from report metadata, `comment`

**0 results:** post the JQL, say no issues matched, **stop**.

For each returned issue, read `key`, `summary`, issue type, full `description`, and **comments** (for duplicate cycle-time detection in step 6). Fetch story points from Jira if present, but **do not use them** when estimating — historical data drives the estimate.

---

## Errors

| Code / situation | Action |
|------------------|--------|
| **401** | re-authenticate the Atlassian MCP server, retry once |
| **-32601** | Wrong tool name — re-read schema; use `mcp__jira-mcp-server__searchJiraIssuesUsingJql` (or `searchJiraIssuesUsingJql`) exactly |
| 0 issues matched | Show JQL + stop |

---

## Jira writes

Story-point and comment updates happen only in **step 6** after the user chooses **Update Jira**. See [UPDATE_JIRA.md](UPDATE_JIRA.md).
