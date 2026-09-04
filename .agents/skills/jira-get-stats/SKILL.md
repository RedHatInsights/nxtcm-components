---
name: jira-get-stats
description: Use when the user asks for Jira historical stats, cycle time breakdown, throughput metrics, or a closed-items table from an existing `.jira-historical-report.json` — read-only, no Jira fetch. NOT for building the report (jira-get-historical-items) or recommending story points (jira-get-estimates).
user-invocable: true
---

# Get Jira stats

Read-only summary of `.jira-historical-report.json` — no Jira fetch.

**Reference files:**

| File | Contents |
|------|----------|
| [OUTPUT.md](OUTPUT.md) | Chat output format |
| [jira-get-historical-items/RESOLVE_REPORT.md](../jira-get-historical-items/RESOLVE_REPORT.md) | Step 1 — resolve report file |
| [jira-get-historical-items/REPORT.md](../jira-get-historical-items/REPORT.md) | Report JSON schema |
| [jira-get-historical-items/SKILL.md](../jira-get-historical-items/SKILL.md) | Generate report (user consent only) |
| [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) | Shared paths, MCP rules, glossary |

---

## Hard rules

| Do | Do not |
|----|--------|
| Resolve `.jira-historical-report.json` first — **stop** if missing → [RESOLVE_REPORT.md](../jira-get-historical-items/RESOLVE_REPORT.md) | Guess a report path or continue without a report |
| **Stop** when no report file is found | Silently invoke `jira-get-historical-items` without user consent |
| **Hand off** to `jira-get-historical-items` with its §0 discovery gate | Assume report scope or CLI/MCP from this thread |
| Run `summarize-report-stats.mjs` with **absolute paths** | Reimplement stats logic in chat |
| Post summary **in chat** by default per [OUTPUT.md](OUTPUT.md) | Write a markdown file unless the user asks for one |
| Write stats JSON to `{report-dir}/.jira-historical-stats.json` (script default) | Save JSON to skill dir or a different folder |
| Write optional markdown to `{report-dir}/.jira-historical-stats.md` when asked — **absolute path** | Save markdown to cwd or an unstated path |
| **Post absolute artifact paths** under `## Saved files` after success (step 3) | Omit where JSON (or optional markdown) was saved |
| Use an interactive table view when **>15 rows** (fallback to full chat table when the host has no table UI) | Paste a 50+ row markdown table in chat |
| Auto-detect sibling `.jira-historical-issues.json` for created dates | Re-fetch Jira for created dates |

---

## Constants

| | Value |
|--|--------|
| **`{workspace}`**, **`{report-dir}`**, report lookup | [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) |
| Report filename | `.jira-historical-report.json` |
| Default output | **Chat only** — script still writes stats JSON |
| Stats script | `jira-get-historical-items/scripts/summarize-report-stats.mjs` (use absolute path to script) |
| Stats JSON artifact | `{report-dir}/.jira-historical-stats.json` |
| Optional markdown artifact | `{report-dir}/.jira-historical-stats.md` — only when the user asks for a markdown file |

---

## Workflow

```
Progress:
- [ ] Step 1 — Resolve historical report file → [RESOLVE_REPORT.md](../jira-get-historical-items/RESOLVE_REPORT.md)
- [ ] Step 2 — Run stats script
- [ ] Step 3 — Post summary in chat
- [ ] Step 4 — Interactive table for large item lists (when applicable)
```

### Step 1 — Resolve historical report file

Follow [jira-get-historical-items/RESOLVE_REPORT.md](../jira-get-historical-items/RESOLVE_REPORT.md) (steps 1a–1d).

### Step 2 — Run stats script

```bash
node {absolute-path-to}/jira-get-historical-items/scripts/summarize-report-stats.mjs \
  --input {absolute-report-path} \
  --stdout
```

When `{report-dir}/.jira-historical-issues.json` exists, pass it explicitly:

```bash
node {absolute-path-to}/jira-get-historical-items/scripts/summarize-report-stats.mjs \
  --input {absolute-report-path} \
  --issues-input {report-dir}/.jira-historical-issues.json \
  --stdout
```

The script writes `{report-dir}/.jira-historical-stats.json` automatically.

If the script exits **1**, read stderr.

### Step 3 — Post summary in chat

Follow [OUTPUT.md](OUTPUT.md). Use the markdown from `--stdout` as the base — do not re-paste the full stats JSON unless the user asks.

When the user asked for a **markdown file**, write the same summary to `{report-dir}/.jira-historical-stats.md` using an **absolute path**.

Always post **`## Saved files`** (OUTPUT.md §10) after a successful run: clickable **absolute** links to `.jira-historical-stats.json` and the report file used; add `.jira-historical-stats.md` when written. Paths only — do not re-paste file contents.

### Step 4 — Interactive table for large item lists

When `items.length > 15`, use an interactive table view when the host supports it; embed data from `.jira-historical-stats.json` `items` array. Skip the full markdown items table in chat when linking to that view. If the host has no interactive table support, include the full items table from `--stdout` in chat instead.

When `items.length ≤ 15`, include the items table from `--stdout` in chat.

---

## Pitfalls

| Problem | Fix |
|---------|-----|
| No report file | [RESOLVE_REPORT.md](../jira-get-historical-items/RESOLVE_REPORT.md) step 1c — stop; [CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) § Historical artifact read lookup |
| Report in workspace but agent checked skills dir only | RESOLVE_REPORT step 1b — workspace first |
| Agent omitted artifact paths | Step 3 — always post `## Saved files` with absolute links after success |
| User asked for markdown file | Step 3 — write `{report-dir}/.jira-historical-stats.md`; link in `## Saved files` |
| User chose generate | Follow jira-get-historical-items §0 — ask scope + CLI/MCP; return to step 1 when done |
| Invalid or unparsable report JSON | RESOLVE_REPORT step 1d — tell user; treat as not found unless they fix the file |
| Created date range shows `—` | Pass `--issues-input` when fetch JSON lives elsewhere |
| Fetch cap warning in output | Report JQL matched ≥100 issues — mention incomplete data |
| Huge chat table | Step 4 — use an interactive table when >15 items; fall back to chat table if the host has no table UI |

---

## Dependencies

### MCP tools
- None — read-only; operates on local JSON artifacts only

### Related skills
- `jira-get-historical-items` — generate `.jira-historical-report.json` (user consent only)
- `jira-get-estimates` — story point recommendations from the same report

### Supporting files
- `jira-get-historical-items/scripts/summarize-report-stats.mjs` — stats pipeline
- [OUTPUT.md](OUTPUT.md), [jira-get-historical-items/RESOLVE_REPORT.md](../jira-get-historical-items/RESOLVE_REPORT.md)
- [CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) — shared artifact paths
