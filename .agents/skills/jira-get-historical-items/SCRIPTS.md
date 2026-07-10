# Scripts reference

Local processing for [jira-get-historical-items](SKILL.md). **Do not reimplement this logic in chat.**

All scripts live under `jira-get-historical-items/scripts/`. Use **absolute paths** for `--input`, `--output`, and `--workspace`.

Artifact write paths: [CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) § Historical artifact write paths — do not ask the user where to save.

Requires **Node.js 18+** for CLI fetch.

---

| Script | Purpose |
|--------|---------|
| **fetch-historical-items.mjs** | JQL search + per-issue changelog via Jira REST → fetch + report artifacts per CONVENTIONS |
| **run-historical-report.mjs** | Validates fetch → process → summarize → report artifact per CONVENTIONS |
| **process-historical-items.mjs** | Keeps items with resolution **Done**; computes `startDate`, `completionDate`, `cycleTime` (business days Mon–Fri) |
| **summarize-cycle-times.mjs** | Human-readable 75th-percentile cycle time by type and story points |
| **summarize-report-stats.mjs** | Stats summary from report JSON — used by [jira-get-stats](../jira-get-stats/SKILL.md) |

**Alternative pipeline** (only if `run-historical-report.mjs` fails): run `process-historical-items.mjs` then `summarize-cycle-times.mjs`, both with absolute `--input` paths.

See [CLI.md](CLI.md) for fetch credentials and [JIRA.md](JIRA.md) for MCP fetch.
