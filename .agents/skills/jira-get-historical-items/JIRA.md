# Jira fetch (MCP)

Supplement to [SKILL.md](SKILL.md). Agent-driven fetch via `user-atlassian-mcp-server` **only**.

Shared MCP rules: [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md).

For the CLI path, see [CLI.md](CLI.md). **Do not use CLI.md on this path.**

**Cloud ID:** see [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md)

---

## When to use

- User chose **MCP** at step 2 (or said agent fetch / fetch in chat)
- User does not want to run a terminal command
- After MCP fetch, the agent **continues automatically** to the pipeline (no pause)

If the user did **not** pick a route, the agent must **ask first** — see [SKILL.md](SKILL.md) §0 and step 2. Do not jump to this path by default.

---

## MCP-only (route lock)

When the user chose **MCP**, Jira issue data comes **only** from `user-atlassian-mcp-server`. Until the user explicitly starts over with **CLI**, do not:

| Forbidden on MCP path | Why |
|-----------------------|-----|
| `fetch-historical-items.mjs` | CLI REST fetch — different route |
| Atlassian CLI (`acli`) | No changelog; wrong tool — use `fetch-historical-items.mjs` or MCP |
| Jira REST / curl / env-file credential probes | Not MCP |
| Silent fallback to CLI when MCP or Write fails | Ask user to switch routes instead |

**Allowed after MCP save:** `run-historical-report.mjs` (and `summarize-cycle-times.mjs` if needed) — local JSON processing only, no Jira API.

---

## MCP tools (exact names)

Read the tool schema JSON in the MCP descriptors folder **before** calling. Typos cause JSON-RPC **-32601** (method not found).

| Step | Tool | Required args |
|------|------|----------------|
| Auth check | `getAccessibleAtlassianResources` | — |
| Search | `searchJiraIssuesUsingJql` | `cloudId`, `jql`, `maxResults`, `fields` |
| Changelog | `getJiraIssue` | `cloudId`, `issueIdOrKey`, `expand=changelog`, `fields` |

**Changelog fetch:** one `getJiraIssue` per key. Issue **all** calls in **one parallel batch** (same tool-use turn).

On **401**: `mcp_auth` for `user-atlassian-mcp-server`, retry once. **Stop** if MCP still fails — say MCP auth failed; ask if the user wants to **start over with CLI** ([CLI.md](CLI.md)). Do not run CLI fetch without that explicit switch.

---

## MCP error codes

| Code | Meaning | Action |
|------|---------|--------|
| **-32601** | Method not found | Verify exact tool name in schema |
| **401** | Not authenticated | `mcp_auth` on `user-atlassian-mcp-server`, retry |
| Empty / invalid payload | Wrong args | Re-read schema; ensure `cloudId` and required fields are set |

---

## Fields to request

`summary`, `description`, `status`, `resolution`, `issuetype`, `customfield_10028`

---

## Save format

Array of `getJiraIssue` objects → `{workspace}/.jira-historical-issues.json`

Each element must include:

- `key`
- `fields` (at least the fields above)
- `changelog.histories` (non-empty)

Use the **Write** tool. Save full MCP responses — do not reconstruct from memory or shorten descriptions.

The pipeline rejects search-only payloads with a clear error per key.

---

## Parallel batch (required)

- ≤100 keys: single parallel batch
- More than 100 keys: parallel batches of ~15–20 keys per turn until all keys are fetched

Search results alone have **no changelog** — you must call `getJiraIssue` per key.

If the user's scope covers **more than ~6 months**, post the date-range heads-up from [SKILL.md](SKILL.md) §1 before fetching — do not block.

---

## JQL notes

| Use | Avoid |
|-----|-------|
| `created >= -20d` | `createdDate > -20d` (non-standard) |
| `parent = FCN-41` | unquoted keys are usually fine; match project key casing in links |

---

## Run pipeline after save

See [SKILL.md](SKILL.md) step 4 — **`run-historical-report.mjs` only** (not `fetch-historical-items.mjs`).

```bash
node scripts/run-historical-report.mjs \
  --input {workspace}/.jira-historical-issues.json \
  --workspace {workspace} \
  --jql '{exact JQL}'
```

This step does not call Jira; it only processes the MCP-saved JSON.
