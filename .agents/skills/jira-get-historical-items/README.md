# jira-get-historical-items

A [Cursor Agent Skill](https://cursor.com/docs/agent/skills) that builds a historical baseline from closed Jira work — fetch issues with changelog (CLI or MCP), compute cycle time and p75 percentiles, and write `.jira-historical-report.json` for sizing calibration.

Use when you need data from real **finished** work — not to look up a single ticket.

**Supersedes:** [OLD/jira-cycle-time-report](../OLD/jira-cycle-time-report/SKILL.md).

---

## Scope — be careful what you ask for

Historical data is most useful when the window is **narrow and recent**. Asking for too much slows the fetch, hits caps, and mixes old process with how the team works today.

| Prefer in JQL (for sizing / cycle time) | Why |
|---------------------------------------|-----|
| **One project** (or a small set of parent epics) | Keeps fetch fast and relevant |
| Items **closed in the last 3–6 months** | Recent work reflects how the team ships today |
| **Story** and **Task** types you actually point | Epics and one-offs skew calibration |
| **`resolution = Done`** | Report only includes Done — see below |

**Fetch vs report:** the skill runs **whatever JQL you provide**. It does **not** silently add `status = Closed`. **Open or in-progress items in the fetch won’t break anything** — they are **skipped during processing** (no row in the report). They still cost fetch time and count toward the **100-issue cap**, so narrowing JQL is a performance tip, not a hard requirement.

**Example JQL** for sizing calibration (adjust project and window):

```text
project = FCN AND status = Closed AND resolution = Done AND type in (Story, Task) AND updated >= -90d
```

Looser JQL is fine if you accept skips — e.g. `project = FCN AND updated >= -90d` will fetch open tickets too; only **resolution Done** items appear in `.jira-historical-report.json`.

Items **closed without** Done resolution (won’t fix, duplicate, cancelled) are also skipped at processing — add `resolution = Done` in JQL to avoid fetching them.

If you ask for **more than ~6 months**, the agent posts a heads-up (older data is often less useful for sizing) but still proceeds unless you narrow the scope.

Default fetch cap: **100 issues**. Widen the date range without tightening JQL and you may get incomplete data.

---

## Requirements

### Choose a fetch path

The agent asks how to fetch unless you already said **CLI** or **MCP**.

| Path | Speed | What you need |
|------|-------|----------------|
| **CLI (recommended)** | Faster — parallel Jira REST, no MCP round-trips | **Node.js 18+**, Jira **API token**, `~/.config/jira-fetch.env` or exported env vars — see [CLI.md](CLI.md) |
| **MCP** | Slower for large sets — one MCP call per issue for changelog | **Atlassian MCP** enabled and authenticated — see [JIRA.md](JIRA.md) |

**CLI setup (first time):**

1. Create [Atlassian API token](https://id.atlassian.com/manage-profile/security/api-tokens).
2. Save credentials in `~/.config/jira-fetch.env` (see [CLI.md](CLI.md) **First-time setup**).
3. Confirm Node: `node --version` (must be **18+**).

**MCP setup:**

1. Cursor → **Settings → MCP** — enable **Atlassian** (`user-atlassian-mcp-server`).
2. Complete auth when prompted (`mcp_auth`).

Once you pick a path, the agent **locks** to it for that run — no silent switching if something fails.

---

## What it does

**JQL → fetch with changelog → process → report in chat.**

1. **Discovery** — confirm what to include (project, types, status, date window) and **CLI vs MCP** ([SKILL.md](SKILL.md) §0).
2. **Build JQL** — from your filters or paste JQL as-is.
3. **Fetch** — save raw issues + changelog to `.jira-historical-issues.json`.
4. **Process** — keep resolution **Done**; compute dates and cycle time.
5. **Report** — write `.jira-historical-report.json`; post JQL, counts, summary, and **clickable file links** in chat ([REPORT.md](REPORT.md)).

---

## Output

Two JSON files in your **workspace** (absolute paths posted in chat after each successful run):

| File | Contents |
|------|----------|
| `.jira-historical-issues.json` | Raw Jira fetch — fields + full changelog per issue |
| `.jira-historical-report.json` | Processed report used for sizing calibration |

Each processed item in the report includes:

| Field | Meaning |
|-------|---------|
| `key`, `summary`, `description`, `issueType`, `storyPoints` | Issue metadata |
| `startDate` | First date the item moved **out of To Do** into another status (from changelog) |
| `completionDate` | Date the item moved to **Closed** |
| `cycleTime` | Business days (Mon–Fri) from start to close |

The report also includes **75th-percentile cycle time** grouped by issue type and story points — useful when suggesting how long similar work might take.

### What you can do with it

| Use | Skill |
|-----|-------|
| **Stats summary** — counts, cycle time, throughput, items table | [jira-get-stats](../jira-get-stats/SKILL.md) |
| Recommend **story point** estimates from historical buckets | [jira-get-estimates](../jira-get-estimates/SKILL.md) |
| Inspect raw changelog / re-run processing | Open `.jira-historical-issues.json` or use scripts in `scripts/` |

---

## How to use it

### Install the skill

| Location | Scope |
|----------|-------|
| `~/.cursor/skills/jira-get-historical-items/` | Personal — all projects |
| `.cursor/skills/jira-get-historical-items/` | Project — shared with the repo |

### Trigger in Cursor

Ask the agent — for example:

- “Get historical Jira items for project FCN — closed stories and tasks, last 90 days”
- “Build a cycle-time report for parent FCN-41, resolution Done, updated last 6 months”
- “Generate `.jira-historical-report.json` for sizing — use the CLI command”
- Paste exact JQL: `project = FCN AND status = Closed AND resolution = Done AND updated >= -180d`

The skill is **user-invocable** (`SKILL.md` frontmatter).

### What to have ready

| Input | When |
|-------|------|
| **Project** and/or **parent epic(s)** | Almost always — agent asks if unclear |
| **Date window** (3–6 months typical) | Always — agent asks if not stated |
| **Issue types** (e.g. Story, Task) | Recommended |
| **`resolution = Done`** in JQL or filters | Strongly recommended |
| **CLI vs MCP** | Agent asks unless you specify |
| **API token + Node 18+** | CLI path only |

### After delivery

Chat includes JQL, fetch counts, the historical report JSON, a cycle-time summary, and **Saved files** links to open both artifacts.

**CLI path:** you run the fetch command in your terminal, then say “continue” when files exist.

**MCP path:** the agent fetches and continues automatically.

---

## Directory layout

```
jira-get-historical-items/
├── README.md             # This file
├── SKILL.md              # Orchestrator — workflow, gates, route lock
├── CLI.md                # Terminal fetch (recommended) — env file, Node, commands
├── JIRA.md               # MCP fetch path
├── REPORT.md             # Chat output shape and report schema
├── RESOLVE_REPORT.md     # Shared step 1 for jira-get-stats and jira-get-estimates
├── SCRIPTS.md            # What each script does
└── scripts/
    ├── fetch-historical-items.mjs   # JQL + changelog fetch (CLI)
    ├── run-historical-report.mjs    # Validate → process → summarize
    ├── process-historical-items.mjs
    ├── summarize-cycle-times.mjs
    ├── summarize-report-stats.mjs   # Stats summary from report JSON
    └── lib/                         # Auth, fetch, analyze, report builders
```

---

## Related skills

| Skill | Relationship |
|-------|----------------|
| [jira-get-stats](../jira-get-stats/SKILL.md) | Consumes `.jira-historical-report.json` for readable stats summary |
| [jira-get-estimates](../jira-get-estimates/SKILL.md) | Consumes `.jira-historical-report.json` to suggest story points and cycle-time comments |
| [jira-acceptance-criteria-check](../jira-acceptance-criteria-check/SKILL.md) | Separate — scores ticket quality; does not use this report |
| [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) | Shared paths, MCP rules, skill index |

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| Agent asks scope / CLI vs MCP before fetching | Expected — [SKILL.md](SKILL.md) §0 discovery gate |
| Fetch is slow or times out | Narrow to 3–6 months; prefer **CLI**; check issue count vs 100 cap |
| Many items **skipped** after fetch | Expected if JQL included open or non-Done items — report keeps **resolution Done** only; tighten JQL to fetch fewer skips |
| No `startDate` / `cycleTime` on some rows | Changelog missing a **To Do → …** transition or **Closed** transition |
| CLI: missing credentials | [CLI.md](CLI.md) — create `~/.config/jira-fetch.env` |
| CLI: `fetch is not defined` | Upgrade to **Node.js 18+** |
| MCP auth failed | Settings → MCP → Atlassian; run `mcp_auth`; or switch to CLI |
| Want estimates from the report | Run [jira-get-estimates](../jira-get-estimates/SKILL.md) with the saved report path |

Site default: **redhat.atlassian.net**. Story points field default (FCN): `customfield_10028`.

---

*Originally created by Kim Doberstein.*
