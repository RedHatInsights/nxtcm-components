# Jira fetch and update

Supplement to [SKILL.md](SKILL.md). Target-issue search only — no changelog fetch.

For historical closed-item fetch (changelog, pipeline), use [jira-get-historical-items/SKILL.md](../jira-get-historical-items/SKILL.md).

Shared MCP rules: [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md).

---

## MCP server

`user-atlassian-mcp-server`

Read tool schema JSON in the MCP descriptors folder **before** calling.

| | Value |
|--|--------|
| Cloud ID | `redhat.atlassian.net` or value from [CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) |
| Story points field (FCN) | `customfield_10028` (or `meta.storyPointsField` from the report) |

---

## Fetch target issues

Call `searchJiraIssuesUsingJql` with:

- `cloudId`: `redhat.atlassian.net`
- `jql`: exact JQL from step 2
- `maxResults`: 50 (raise if user expects more; paginate with `nextPageToken` when needed)
- `responseContentFormat`: `markdown`
- `fields`: `summary`, `description`, `issuetype`, `status`, `customfield_10028` (or `meta.storyPointsField` from the report), `comment`

**0 results:** post the JQL, say no issues matched, **stop**.

For each returned issue, read `key`, `summary`, issue type, full `description`, and **comments** (for duplicate cycle-time detection in step 6). Fetch story points from Jira if present, but **do not use them** when estimating — historical data drives the estimate.

---

## Errors

| Code / situation | Action |
|------------------|--------|
| **401** | `mcp_auth` on `user-atlassian-mcp-server`, retry once |
| **-32601** | Wrong tool name — re-read schema; use `searchJiraIssuesUsingJql` exactly |
| 0 issues matched | Show JQL + stop |

---

## Jira writes

Story-point and comment updates happen only in **step 6** after the user chooses **Update Jira**. See [UPDATE_JIRA.md](UPDATE_JIRA.md).
