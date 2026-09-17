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
| **`{workspace}`** | **Default:** active project/workspace root as an **absolute path** (repo or directory the user is working in). **Override:** only when the user names a directory in the current thread — then use that path for the whole run. Do not infer from skill install path or prior chats. |
| **`{report-dir}`** | Parent directory of the resolved `.jira-historical-report.json` (absolute path). |
| **`.jira-historical-issues.json`** | Raw Jira fetch with changelog — produced by [jira-get-historical-items](../jira-get-historical-items/SKILL.md). |
| **`.jira-historical-report.json`** | Processed historical report — consumed by [jira-get-stats](../jira-get-stats/SKILL.md) and [jira-get-estimates](../jira-get-estimates/SKILL.md). |

### Historical artifact write paths (`jira-get-historical-items`)

When **jira-get-historical-items** runs, **always** write both JSON files under the resolved `{workspace}` for that run:

| Artifact | Path |
|----------|------|
| Fetch JSON | `{workspace}/.jira-historical-issues.json` |
| Report JSON | `{workspace}/.jira-historical-report.json` |

**Rules:**

- Resolve `{workspace}` once per run (see **`{workspace}`** row above) — use the **same absolute path** for CLI `--output`/`--workspace`, MCP **Write**, pipeline scripts, and **Saved files** links in chat.
- **Do not ask** the user where to save these files.
- **Do not write** to skill dir, script dir, global skills install dirs, or cwd unless the user explicitly named that directory as the `{workspace}` override for this run.

### Historical artifact read lookup (sibling skills)

When **jira-get-estimates** or **jira-get-stats** need an existing report and the user did not provide a path, look **in order** (first existing file wins):

1. `{workspace}/.jira-historical-report.json`
2. `~/.config/opencode/skills/.jira-historical-report.json`
3. `~/.cursor/skills/.jira-historical-report.json`

This lookup is **read-only**. It does not change where **jira-get-historical-items** writes new artifacts.

---

## Jira site defaults

| | Value |
|--|--------|
| Site | `<JIRA-SITE>` — default `redhat.atlassian.net` when the user has not specified a site |
| Cloud ID (MCP) | Resolve via `mcp__jira-mcp-server__getAccessibleAtlassianResources`; example UUID in docs is illustrative only |
| Story points field | Load `meta.storyPointsField` from a historical report when present; otherwise discover via project metadata — do not assume a fixed custom field ID |

---

## Illustrative examples

Skill docs use placeholders such as `<PROJECT>`, `<KEY>`, `<EPIC-KEY>`, and `<JIRA-SITE>`. **Substitute the user's project, keys, and site** — do not copy example keys or JQL literally unless the user provided those values in the current thread.

---

## Host compatibility

These skills are **host-agnostic** — they run in Claude Code, Cursor, OpenCode, and other agents that load `SKILL.md` and support MCP or CLI.

| Concern | Rule |
|---------|------|
| **Skill install** | See each skill's README for host-specific install paths. Workflow steps in `SKILL.md` must not assume one host. |
| **User prompts** | Prefer a **structured choice prompt** (numbered options or the host's multiple-choice UI when available). |
| **Large tables** | When output exceeds ~15 rows, use an interactive table view if the host supports one; otherwise post the full markdown table in chat. |
| **MCP server id** | Discover the **Atlassian MCP server** from the host's MCP catalog before calling. Common ids: `jira-mcp-server` (OpenCode), `user-atlassian-mcp-server` (Cursor). |
| **MCP tool naming** | **Prefer** Fleet-standard `mcp__jira-mcp-server__*` tool names (Claude Code, OpenCode). **Fallback:** when Fleet-standard names are unavailable, use Cursor's `user-atlassian-mcp-server` with bare Atlassian tool names (`getJiraIssue`, `createJiraIssue`, etc.). See [MCP transport](#mcp-transport) for the mapping table. |
| **MCP auth errors** | On **401**, re-authenticate via the host's MCP auth flow, then retry once. If only `mcp_auth` is exposed, call it for the Atlassian server with `{}`, then re-check tools. Tell the user to enable the Atlassian MCP server in the host's MCP settings if tools are missing. |

---

## MCP transport

| Rule | Detail |
|------|------|
| **MCP server** | Atlassian MCP server — discover server id from the host MCP catalog (see [Host compatibility](#host-compatibility)) |
| **Tool naming** | **Prefer** Fleet-standard `mcp__jira-mcp-server__*` (Claude Code, OpenCode). **Fallback:** Cursor `user-atlassian-mcp-server` bare tool names when Fleet-standard names are unavailable. Read schemas from whichever server is listed before calling. |
| **Before calling** | Read Atlassian MCP tool schemas — prefer `mcp__jira-mcp-server__*` when both naming styles exist |
| **Auth** | On **401**: re-authenticate the Atlassian MCP server, retry once; if only `mcp_auth` is exposed, call it for the Atlassian server with `{}`, then re-check tools |
| **No `acli`** | Atlassian CLI is not a fallback for any active Jira skill |
| **Pagination** | When `mcp__jira-mcp-server__searchJiraIssuesUsingJql` (or `searchJiraIssuesUsingJql`) returns `nextPageToken`, repeat with the token until all issues are fetched or the skill’s cap is reached |

### Tool naming — prefer + fallback

Use Fleet-standard names in skill docs and when available in the host. When Fleet-standard tools are missing, fall back to Cursor's `user-atlassian-mcp-server` equivalents:

| Prefer (Fleet-standard) | Fallback (Cursor `user-atlassian-mcp-server`) |
|-------------------------|-----------------------------------------------|
| `mcp__jira-mcp-server__getAccessibleAtlassianResources` | `getAccessibleAtlassianResources` |
| `mcp__jira-mcp-server__getJiraIssue` | `getJiraIssue` |
| `mcp__jira-mcp-server__searchJiraIssuesUsingJql` | `searchJiraIssuesUsingJql` |
| `mcp__jira-mcp-server__createJiraIssue` | `createJiraIssue` |
| `mcp__jira-mcp-server__editJiraIssue` | `editJiraIssue` |
| `mcp__jira-mcp-server__addCommentToJiraIssue` | `addCommentToJiraIssue` |
| `mcp__jira-mcp-server__getJiraIssueTypeMetaWithFields` | `getJiraIssueTypeMetaWithFields` |

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
