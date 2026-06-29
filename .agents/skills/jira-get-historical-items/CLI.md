# Jira fetch (CLI)

Supplement to [SKILL.md](SKILL.md). Fast path: `fetch-historical-items.mjs` (Jira REST).

**Do not use this file when the user chose MCP** — see [JIRA.md](JIRA.md) instead.

---

## When to use

- User chose **CLI** at step 2 (or said command / terminal / faster)
- User wants the fastest fetch (parallel REST, no MCP round-trips)
- User explicitly **switches** to CLI after MCP failed (new run)
- User will say "continue" or "JSON is ready" after the script finishes **only when using `--skip-report`**

If the user did **not** pick a route, the agent must **ask first** — see [SKILL.md](SKILL.md) §0 and step 2. Do not jump to this path by default.

Do **not** use CLI because MCP was slow, Write was awkward, or env vars happen to exist — those are not reasons to break route lock.

The agent **stops after giving the command** unless asked to run it or the output file already exists. By default the fetch script also writes `.jira-historical-report.json` in the same workspace — the agent can read that file after the user confirms fetch is done.

---

## Prerequisites

1. **Node.js 18 or newer** — required to run the fetch and report scripts (`node --version`). Uses ES modules (`.mjs`) and native `fetch`; Node 16 and below will not work.
2. [Atlassian API token](https://id.atlassian.com/manage-profile/security/api-tokens) for your account
3. Credentials in `~/.config/jira-fetch.env` (recommended) or exported env vars (see below)

The agent should mention the Node requirement when giving the CLI command for the first time in a thread.

### First-time setup — create an env file

Keep credentials in a local file outside any git repo. The agent should walk the user through this once when they pick **CLI** and do not already have credentials set up.

1. Create the file (example path):

```bash
mkdir -p ~/.config
touch ~/.config/jira-fetch.env
chmod 600 ~/.config/jira-fetch.env
```

2. Add your Jira site, email, and API token:

```bash
# ~/.config/jira-fetch.env
JIRA_SITE=redhat.atlassian.net
JIRA_EMAIL=you@redhat.com
JIRA_API_TOKEN=your-api-token
```

3. Pass it on every fetch command:

```bash
--env-file ~/.config/jira-fetch.env
```

**Do not commit this file.** Add `jira-fetch.env` to your global or project gitignore if needed.

**Environment variables** (alternative to `--env-file`; any of these pairs work):

| Variable | Alternate |
|----------|-----------|
| `JIRA_EMAIL` | `ATLASSIAN_EMAIL` |
| `JIRA_API_TOKEN` | `ATLASSIAN_API_TOKEN`, `JIRA_TOKEN` |
| `JIRA_SITE` (optional) | `ATLASSIAN_SITE` — default `redhat.atlassian.net` |

Export before running, or inline on the command:

```bash
export JIRA_EMAIL='you@redhat.com'
export JIRA_API_TOKEN='your-api-token'
```

---

## Command

Use **absolute** `--output`. Replace `{workspace}` with the Cursor workspace root (or wherever artifacts should live).

```bash
node scripts/fetch-historical-items.mjs \
  --jql 'parent = FCN-41 AND created >= -20d' \
  --output /absolute/path/to/workspace/.jira-historical-issues.json \
  --env-file ~/.config/jira-fetch.env
```

With env vars instead of `--env-file`, omit that flag after `export JIRA_EMAIL` / `JIRA_API_TOKEN`.

### Options

| Flag | Default | Purpose |
|------|---------|---------|
| `--jql` | *(required)* | JQL query |
| `--output`, `-o` | *(required)* | Output JSON path |
| `--env-file` | — | `.env` file with `JIRA_EMAIL`, `JIRA_API_TOKEN`, optional `JIRA_SITE` |
| `--site` | `redhat.atlassian.net` | Jira hostname |
| `--story-points-field` | `customfield_10028` | FCN story points field |
| `--concurrency` | `10` | Parallel issue fetches |
| `--max-results` | `100` | Cap on issues returned — wider date windows may need a narrower JQL instead of raising this |
| `--workspace`, `-w` | output file directory | Where `.jira-historical-report.json` is written |
| `--skip-report` | off | Fetch only; skip report pipeline |

### 0 results

Writes `[]` to the output file and an empty report JSON. The agent should post JQL + "No issues matched" and skip re-running the pipeline.

---

## Output format

Same as MCP `getJiraIssue` with `expand=changelog`:

```json
[
  {
    "key": "FCN-533",
    "fields": {
      "summary": "…",
      "description": "…",
      "status": { "name": "Closed" },
      "resolution": { "name": "Done" },
      "issuetype": { "name": "Story" },
      "customfield_10028": 3
    },
    "changelog": {
      "histories": [ … ]
    }
  }
]
```

Array of issues. Each must have non-empty `changelog.histories` (the script paginates changelog when Jira truncates).

---

## After fetch

By default the script also runs the report pipeline and writes `{workspace}/.jira-historical-report.json` next to the fetch file (same artifact as the MCP path after step 4).

Tell the agent fetch is done (e.g. "continue") so it can post JQL + report + **Saved files** links in chat. Use `--skip-report` only if you want fetch JSON without the report.

To re-run the report from an existing fetch file:

```bash
node scripts/run-historical-report.mjs \
  --input /absolute/path/to/workspace/.jira-historical-issues.json \
  --workspace /absolute/path/to/workspace \
  --jql 'parent = FCN-41 AND created >= -20d'
```

---

## Troubleshooting

| Error | Fix |
|-------|-----|
| Missing Jira API credentials | Create `~/.config/jira-fetch.env` or export `JIRA_EMAIL` / `JIRA_API_TOKEN`; see **First-time setup** above |
| `fetch is not defined` / syntax errors on `.mjs` | Upgrade to **Node.js 18+** — check with `node --version` |
| HTTP 401 | Bad email/token; regenerate API token |
| HTTP 400 on JQL | Fix JQL syntax; use `created >= -20d` not `createdDate` |
| `field 'customfield_10028' is not allowed` on search | Should not happen — script requests fields on issue fetch, not search-only |
| Permission denied writing output | Use a workspace path you can write to; prefer absolute paths |

**Do not use** the Atlassian CLI (`acli`) for this skill — `acli jira workitem view` returns `"changelog": null`. Use `fetch-historical-items.mjs` (this path) or MCP instead.
