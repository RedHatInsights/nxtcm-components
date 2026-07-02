# Scripts reference

Local processing for [jira-get-historical-items](SKILL.md). **Do not reimplement this logic in chat.**

All scripts live under `jira-get-historical-items/scripts/`. Use **absolute paths** for `--input`, `--output`, and `--workspace`.

Requires **Node.js 18+** for CLI fetch.

---

| Script | Purpose |
|--------|---------|
| **fetch-historical-items.mjs** | JQL search + per-issue changelog via Jira REST → writes `.jira-historical-issues.json` and (by default) `.jira-historical-report.json` |
| **run-historical-report.mjs** | Validates fetch → process → summarize → writes `.jira-historical-report.json` |
| **process-historical-items.mjs** | Keeps items with resolution **Done**; computes `startDate`, `completionDate`, `cycleTime` (business days Mon–Fri) |
| **summarize-cycle-times.mjs** | Human-readable 75th-percentile cycle time by type and story points |
| **summarize-report-stats.mjs** | Stats summary from report JSON — used by [jira-get-stats](../jira-get-stats/SKILL.md) |

**Alternative pipeline** (only if `run-historical-report.mjs` fails): run `process-historical-items.mjs` then `summarize-cycle-times.mjs`, both with absolute `--input` paths.

See [CLI.md](CLI.md) for fetch credentials and [JIRA.md](JIRA.md) for MCP fetch.
