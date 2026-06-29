# jira-get-stats

A [Cursor Agent Skill](https://cursor.com/docs/agent/skills) that summarizes `.jira-historical-report.json` into readable stats — date ranges, issue counts, cycle time distribution, throughput, outliers, and an items table. **Read-only** — no Jira fetch.

Use when you want to understand a historical baseline — volume, timing, and data quality — without re-fetching Jira or sizing new tickets.

---

## Where it fits

```
jira-get-historical-items  →  fetch + process  →  .jira-historical-report.json
jira-get-stats             →  read report      →  stats summary + items table
jira-get-estimates         →  read report      →  forward-looking sizing
```

| Skill | Question it answers |
|-------|---------------------|
| **jira-get-historical-items** | “Build me a baseline from closed Jira work.” |
| **jira-get-stats** | “What does that baseline look like?” |
| **jira-get-estimates** | “Size these open tickets from that baseline.” |

---

## Prerequisites

This skill **does not fetch historical data on its own**. It reads an existing `.jira-historical-report.json`.

| Requirement | Details |
|-------------|---------|
| **Historical report** | `.jira-historical-report.json` — lookup order: active workspace, then `~/.cursor/skills/` (see [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md)); or a path you provide |
| **Optional fetch file** | `.jira-historical-issues.json` in the same directory — adds Jira **created** date range (auto-detected when present) |
| **No report yet?** | The agent **stops** and asks you to provide a file **or** run [jira-get-historical-items](../jira-get-historical-items/SKILL.md) |

**Tip:** A narrow, recent report (one project, last 3–6 months, resolution Done) gives stats that reflect how the team ships today. See [jira-get-historical-items/README.md](../jira-get-historical-items/README.md).

---

## What it does

**Report → stats script → summary in chat (+ optional canvas for large tables).**

1. **Resolve report** — load `.jira-historical-report.json` ([SKILL.md](SKILL.md) step 1). Stops and asks if missing.
2. **Run stats script** — `summarize-report-stats.mjs` with absolute paths.
3. **Post summary** — formatted markdown in chat ([OUTPUT.md](OUTPUT.md)).
4. **Large item tables** — when **>15 rows**, opens a sortable **canvas** instead of dumping a huge markdown table.

Also writes `{report-dir}/.jira-historical-stats.json` for reuse or tooling.

---

## What you get

| Section | Contents |
|---------|----------|
| **Scope** | JQL used, fetched / included / skipped counts, fetch-cap warning |
| **Date ranges** | Jira created, work started (left To Do), closed |
| **Issue counts** | Total, pointed vs unpointed, by type, type × story points matrix |
| **Cycle time** | min / p50 / p75 / p90 / max, distribution buckets, p75 groups |
| **Throughput** | Closed items and story points per month |
| **Point distribution** | How many 1s, 2s, 3s, etc. |
| **Data quality** | Missing dates, unpointed items |
| **Outliers** | Items >1.5× their group p75 |
| **Items table** | Key (linked), type, points, dates, cycle time, outlier flag, summary |

### p75 groups (by story points)

For each point size, p75 cycle time is shown for **all**, **stories**, and **tasks**:

```text
### 75th percentile groups

- All items (78): 6 days
- All stories (39): 7 days
- All tasks (39): 2 days

8 point items
  - all: 5.5 days
  - stories: 6.3 days
  - tasks: 1 days

3 point items
  - all: 7.3 days
  - stories: 8 days
  - tasks: 3 days
```

Type lines (`stories`, `tasks`, `bugs`) only appear when there is data for that point size.

---

## Output (chat)

After each run, chat includes scope, counts, cycle time, throughput, and either a compact items table or a canvas link ([OUTPUT.md](OUTPUT.md)).

**Saved files** (absolute paths as clickable links):

| File | Contents |
|------|----------|
| `.jira-historical-stats.json` | Full structured stats (counts, distributions, items, outliers) |
| `.jira-historical-report.json` | Source report (linked, not re-pasted) |

---

## How to use it

### Install the skill

| Location | Scope |
|----------|-------|
| `~/.cursor/skills/jira-get-stats/` | Personal — all projects |
| `.cursor/skills/jira-get-stats/` | Project — shared with the repo |

### Trigger in Cursor

Ask the agent — for example:

- “Show stats from the FCN historical report”
- “Run jira-get-stats on `~/.cursor/skills/.jira-historical-report.json`”
- “Summarize closed work — counts, cycle time, and throughput”

**Not this skill:** fetching Jira or building `.jira-historical-report.json` → use [jira-get-historical-items](../jira-get-historical-items/SKILL.md) first.
- “Give me a table of closed items with cycle times from the last 90-day report”
- “How many story points did we deliver in May?”

The skill is **user-invocable** (`SKILL.md` frontmatter).

### What to have ready

| Input | When |
|-------|------|
| **Historical report** path or prior jira-get-historical-items run | Always — agent stops if missing |
| **Report path override** | When the report is not in the workspace or skills dir |

### No report yet?

The agent posts:

> I couldn't find `.jira-historical-report.json`.
>
> How would you like to proceed?
> 1. **Provide a file** — paste the report JSON or give me a path.
> 2. **Generate a report** — run **jira-get-historical-items**, then come back here.

It will not run stats until you choose.

### After delivery

1. Review counts, cycle time, and throughput in chat.
2. Open `.jira-historical-stats.json` for the full structured data.
3. For large sets, use the **canvas** items table to sort and scan.
4. To refresh stats, re-run [jira-get-historical-items](../jira-get-historical-items/SKILL.md) with an updated window, then run stats again.

---

## Script (direct)

You can run the stats script without the agent:

```bash
node ../jira-get-historical-items/scripts/summarize-report-stats.mjs \
  --input /path/to/.jira-historical-report.json \
  --issues-input /path/to/.jira-historical-issues.json \
  --stdout
```

| Flag | Purpose |
|------|---------|
| `--input` | Path to `.jira-historical-report.json` (required) |
| `--issues-input` | Optional fetch file for Jira **created** dates |
| `--output` | Override stats JSON path (default: `{report-dir}/.jira-historical-stats.json`) |
| `--stdout` | Print markdown summary to stdout |

Requires **Node.js 18+**.

---

## Directory layout

```
jira-get-stats/
├── README.md       # This file
├── SKILL.md        # Orchestrator — workflow, report resolution gate
└── OUTPUT.md       # Chat output format

# Shared:
jira-get-historical-items/RESOLVE_REPORT.md   # Step 1 — find report file
jira-get-historical-items/scripts/summarize-report-stats.mjs
jira-acceptance-criteria-check/CONVENTIONS.md
```

---

## Related skills

| Skill | Relationship |
|-------|--------------|
| [jira-get-historical-items](../jira-get-historical-items/SKILL.md) | **Upstream** — fetch + process → `.jira-historical-report.json` |
| [jira-get-estimates](../jira-get-estimates/SKILL.md) | **Sibling** — forward-looking story point and cycle-time sizing from the same report |
| [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) | Shared paths, MCP rules, skill index |
| [jira-epic-breakdown](../jira-epic-breakdown/SKILL.md) | Optional — break down epics; run stats or estimates on child scope |
| [jira-acceptance-criteria-check](../jira-acceptance-criteria-check/SKILL.md) | Separate — ticket quality review; does not use this report |

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| No `.jira-historical-report.json` found | Agent stops at step 1c — provide a file or generate via jira-get-historical-items |
| Agent asks before running stats | Expected when no report is resolved — same gate as jira-get-estimates |
| Invalid report JSON | File must parse as JSON with `version` and `items` — regenerate or fix path |
| Created date range shows `—` | Pass `--issues-input` when fetch JSON is not beside the report |
| Fetch cap warning in output | Report JQL matched ≥100 issues — narrow JQL or raise fetch cap upstream |
| Stats feel stale or off | Re-run jira-get-historical-items with a recent 3–6 month window |
| Huge items table in chat | Expected for ≤15 items; >15 uses canvas — see [SKILL.md](SKILL.md) step 4 |
| `Input file not found` | Use **absolute paths** for `--input` and `--issues-input` |

Site default: **redhat.atlassian.net**. Story points field default (FCN): `customfield_10028` (or `meta.storyPointsField` from the report).

---

*Created by Kim Doberstein.*
