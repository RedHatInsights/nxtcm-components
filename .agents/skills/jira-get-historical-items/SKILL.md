---
name: jira-get-historical-items
description: >-
  Jira historical items and cycle time: discovery for scope and fetch route (CLI vs MCP),
  build JQL, fetch issues with changelog, save .jira-historical-issues.json, run
  run-historical-report.mjs, print JQL + results in chat. Use for historical Jira items,
  75th-percentile cycle time, closed-item analysis on redhat.atlassian.net. Asks what to
  include and CLI vs MCP unless the user already specified.
user-invocable: true
---

# Get Jira historical items

**JQL → fetch JSON → pipeline script → print in chat.**

Two fetch paths produce the **same** artifact: `{workspace}/.jira-historical-issues.json`. After that, the workflow is identical.

Shared paths and MCP rules: [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md).

---

## Hard rules

| Do | Do not |
|----|--------|
| Save fetch JSON before running the pipeline | Run the pipeline without a fetch file |
| Write both artifacts under one resolved **`{workspace}`** — same path for CLI `--output`/`--workspace`, MCP **Write**, pipeline, and step 5 links | Save to skill dir, script dir, or a different folder per step |
| **Absolute paths** for `--input`, `--output`, `--workspace`, and MCP **Write** | Relative paths when cwd is unknown |
| Scripts in `jira-get-historical-items/scripts/` only — see [SCRIPTS.md](SCRIPTS.md) | Ad-hoc node one-liners or new scripts elsewhere |
| Post JQL + report in chat — shape in [REPORT.md](REPORT.md) | Ask the user to hand-parse JSON |
| **Ask** user for fetch route when not specified | Guess MCP or CLI, or start fetch without asking |
| **Ask** user for report scope when not specified | Infer project, parents, date range, or status from chat context |
| **CLI** (`fetch-historical-items.mjs`) or **MCP** for fetch | Atlassian CLI (`acli`) — changelog is always null |
| **Lock the fetch route** once the user picks CLI or MCP | Mix paths or fall back to the other fetch route mid-run |
| **Post date-range heads-up** when scope exceeds ~6 months (step 1) | Block the fetch or narrow the window without user consent |
| **Post absolute artifact paths** with clickable links after success (step 5) | Dump file contents twice or omit where the JSON files were saved |

### Route lock

Once the user picks a fetch path, **stay on it** for the rest of the run.

| User chose | Fetch (step 2) | Report (step 4) |
|------------|----------------|-----------------|
| **MCP** | `user-atlassian-mcp-server` only — [JIRA.md](JIRA.md) | `run-historical-report.mjs` (local; no Jira network) |
| **CLI** | `fetch-historical-items.mjs` only — [CLI.md](CLI.md) | Usually already written by fetch script; re-run pipeline only if needed |

**MCP path — never for Jira data:** `fetch-historical-items.mjs`, Jira REST/curl, Atlassian CLI, env-file probes, or silent CLI fallback. If MCP fetch or save fails, **stop** and ask whether to **switch to CLI** (new run).

**CLI path — never for Jira data:** MCP `searchJiraIssuesUsingJql` / `getJiraIssue`. If CLI fetch fails, **stop**; do not silently switch to MCP.

`run-historical-report.mjs` reads local JSON only — required after MCP save; not a fetch path.

---

## Constants

| | Value |
|--|--------|
| **`{workspace}`**, site, cloud ID, story points field | [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) |
| Scripts dir | `scripts/` (under this skill — not the artifact workspace) |
| Fetch artifact | `{workspace}/.jira-historical-issues.json` |
| Report artifact | `{workspace}/.jira-historical-report.json` |
| Recommended date window | **3–6 months** of closed work (`updated >= -90d` to `-180d`) for sizing / cycle-time calibration |
| Date range warning | When scope exceeds **~6 months**, post a heads-up before fetch — **do not block** |
| Min Node.js (CLI path) | **18** — see [CLI.md](CLI.md) |
| Default fetch cap | **100** issues (`--max-results` on CLI; `maxResults` on MCP search) |

---

## Workflow

```
Progress:
- [ ] Step 0 — Discovery gate (scope + CLI/MCP unless user specified)
- [ ] Step 1 — Build JQL
- [ ] Step 2 — Fetch → `.jira-historical-issues.json`
- [ ] Step 3 — Confirm fetch JSON
- [ ] Step 4 — Run pipeline → `.jira-historical-report.json`
- [ ] Step 5 — Print in chat → [REPORT.md](REPORT.md)
```

### 0. Discovery gate (hard stop)

Run **before** building JQL or fetching. If the user did not supply enough to proceed, **stop** — discovery-only response; do not fetch, do not run scripts, do not invent defaults.

#### Resolved scope?

Scope is **resolved** only when the user, in this thread, provided **at least one** of:

- Exact **JQL** to use, **or**
- Enough filters to build JQL without guessing: what to include (project and/or parent epics and/or keys), issue **types**, **status** (e.g. Closed/Done), and a **date window** (e.g. `updated >= -90d`)

**Not resolved** = user said “create the report”, “generate historical data”, “yes” to building a file, or gave product context (e.g. epic breakdown) but never said what belongs **in the historical report**.

Prior conversation (jira-epic-create, jira-epic-breakdown, estimate targets) does **not** resolve scope unless the user restated those filters for **this** report.

#### Resolved fetch route?

Route is **resolved** when the user said **CLI** (command, terminal, script) or **MCP** (agent fetch, fetch in chat).

#### If scope or route is not resolved → ask

Post one short message. Prefer **AskQuestion** when available. Example:

> I can build `.jira-historical-report.json` once two things are clear:
>
> 1. **What should the report include?** For example: project, parent epic(s) or “whole project”, issue types (Story/Task), status (usually Closed/Done for cycle time), and how far back. Teams often use the **last 3–6 months** of closed work for sizing calibration — e.g. `updated >= -90d` or `updated >= -180d`. Paste JQL or describe the filter.
> 2. **How should I fetch?**
>    - **CLI** — I’ll help you set up a local `~/.config/jira-fetch.env` if needed, then give you a `fetch-historical-items.mjs` command to run (requires **Node.js 18+**; usually faster). Tell me when the files are ready.
>    - **MCP** — I’ll fetch here in chat via Jira MCP and continue automatically.

Wait for answers. If only one slot is missing, ask only that slot.

**Do not** default to a project (e.g. FCN), parent list, or date range (e.g. 180 days) the user did not state.

---

### 1. Build JQL

Only after step 0 scope is resolved.

From user scope, or use their JQL as-is. Examples:

```text
parent = FCN-41 AND created >= -20d
project = FCN AND status = Closed AND type in (Story, Task) AND updated >= -90d
```

Use `created >= -20d` or `updated >= -90d` (not `createdDate`). When the user picked a date range in step 0, reflect it in JQL. Suggest **3–6 months** only when asking in step 0 — do not apply that window unless the user confirmed it.

#### Date range heads-up (do not block)

When the user's JQL or stated scope covers **more than ~6 months**, post a short note **before step 2 (fetch)**. **Proceed** with their scope unless they ask to narrow it.

**Trigger when any of these apply:**

- Relative JQL beyond ~180 days — e.g. `-365d`, `-1y`, `-52w`, `-300d`
- User phrasing — e.g. “last year”, “past 12 months”, “all of 2024”
- A start date or filter window that clearly spans more than six months

**Example note** (adapt to their scope):

> **Heads-up:** For story-point sizing and cycle-time calibration, teams usually look at **closed work from the last 3–6 months** (`updated >= -90d` to `-180d`). Older tickets often reflect past process or team makeup and are less useful for estimating current work. Your window may also match **many** issues — the default fetch cap is **100** (`--max-results` / MCP `maxResults`); widening the date range without narrowing JQL can mean incomplete data, or a long fetch if the cap is raised.

If they already acknowledged the tradeoff in this thread, skip repeating the full note.

### 2. Fetch → `.jira-historical-issues.json`

Only after step 0 route is resolved.

**Skip fetch** (go to step 3) when:

- User says the JSON is ready, fetch is done, or to continue from the file
- `{workspace}/.jira-historical-issues.json` already exists and the user only wants a re-run of the report

**If route is not resolved:** return to step 0 — ask only the fetch question; do not fetch.

| User said | Path |
|-----------|------|
| CLI, command, terminal, script, faster, REST | **CLI** → [CLI.md](CLI.md) |
| MCP, agent fetch, fetch in chat | **MCP** → [JIRA.md](JIRA.md) |
| *(nothing)* | **Stop** — return to step 0 |

#### Path A — CLI

Full procedure: [CLI.md](CLI.md). Give the user a command with **absolute** `--output` and the exact JQL from step 1:

```bash
node scripts/fetch-historical-items.mjs \
  --jql '{exact JQL}' \
  --output {workspace}/.jira-historical-issues.json \
  --env-file ~/.config/jira-fetch.env
```

**Stop after giving the command** unless the user asked the agent to run it or both output files already exist.

#### Path B — MCP

Follow [JIRA.md](JIRA.md). Save full issue+changelog payloads to `{workspace}/.jira-historical-issues.json`, then continue automatically to steps 3–5.

**0 results:** post JQL in chat, say no issues matched, **stop**.

### 3. Confirm fetch JSON

Verify `{workspace}/.jira-historical-issues.json` exists. Each element must have `key`, `fields`, and `changelog.histories`.

If the user resumed after CLI fetch and the file is missing, say so and stop.

### 4. Run pipeline

**CLI path:** skip when `.jira-historical-report.json` already exists from `fetch-historical-items.mjs` (default).

**MCP path** (or re-run):

```bash
node scripts/run-historical-report.mjs \
  --input {workspace}/.jira-historical-issues.json \
  --workspace {workspace} \
  --jql '{exact JQL}'
```

Optional: add `--stdout` for one-shot chat output. See [SCRIPTS.md](SCRIPTS.md) for alternatives if the pipeline fails.

If a script exits **1**, read stderr.

### 5. Print in chat

Follow [REPORT.md](REPORT.md) for section order, JSON shape, and **Saved files** links.

---

## Pitfalls

| Problem | Fix |
|---------|-----|
| CLI missing credentials | [CLI.md](CLI.md) first-time setup |
| Node too old / not installed | CLI path needs **Node.js 18+** |
| User asked for > 6 months of history | Post step 1 date-range heads-up; proceed unless they narrow scope |
| MCP **-32601** | Wrong tool name — read MCP schema; use `searchJiraIssuesUsingJql` and `getJiraIssue` exactly |
| MCP **401** | `mcp_auth` on `user-atlassian-mcp-server`, retry once |
| Empty dates / no cycle time | Fetch used search only — need per-issue changelog |
| Script exit 1, no output | Use **absolute** `--input` paths; read stderr |
| `Input file not found` | Complete fetch first; path must match `--input` |
| `missing changelog histories` | Save full issue+changelog payloads, not search-only rows |
| Used Atlassian CLI (`acli`) for fetch | Changelog is null — use `fetch-historical-items.mjs` or MCP |
| Slow MCP changelog fetch | Issue all `getJiraIssue` calls in one parallel batch — [JIRA.md](JIRA.md) |
| User ran CLI, agent continued too early | Wait for user confirmation or verify the file exists |
| Reconstructed/trimmed MCP JSON | Save full `getJiraIssue` responses — [JIRA.md](JIRA.md) |

Scope, route, and artifact-path mistakes → see **Hard rules** and step 0.
