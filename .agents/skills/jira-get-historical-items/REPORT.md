# Report output

Always post results in **chat**.

---

## Chat report shape

Post these sections **in order**:

### 1. JQL

```text
<JQL used for the search>
```

One fenced block with the exact JQL string.

### 2. Fetch counts

One short paragraph:

- Issues matched by JQL: **N**
- Included after processing (resolution Done): **M**
- Skipped (non-Done resolution): **N − M**
- Note any fetch/changelog caveats (truncated changelog, auth retry, CLI vs MCP) if applicable

### 3. Historical report

Heading: **`## Historical report`**

Paste the **full** report JSON as a code block (or stdout from `run-historical-report.mjs --stdout` before the `---CYCLE_TIME_SUMMARY---` delimiter). Filename: `.jira-historical-report.json` per [CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md).

Do **not** omit or summarize this JSON unless the user asked for summary only.

### 4. Cycle time summary

Heading: **`## Cycle time summary`**

Paste human-readable text from:

```bash
node scripts/summarize-cycle-times.mjs \
  --input {absolute-report-artifact-path}
```

Report artifact path: [CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) § Historical artifact write paths.

Or use the text after `---CYCLE_TIME_SUMMARY---` when using `--stdout`.

When `cycleTime` is `null` in the report, show:

```text
No items with measurable cycle time — summary not produced.
```

### 5. Saved files

Heading: **`## Saved files`**

**Always** post after a successful run (including 0-issue fetches that still wrote empty artifact files). Use **absolute paths** from this run as markdown links — paths from [CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) § Historical artifact write paths:

```markdown
## Saved files

- [.jira-historical-issues.json]({absolute-fetch-artifact-path})
- [.jira-historical-report.json]({absolute-report-artifact-path})
```

- Link **label** = filename; link **target** = full absolute path resolved this run.
- **Paths and links only** — do not paste file contents again under this heading (the report JSON already appears in §3).
- Skip this section when fetch or the report pipeline failed.

---

## Report schema (version 1)

```json
{
  "version": 1,
  "runAt": "2026-06-24T15:30:00.000Z",
  "jql": "parent = <PROJECT>-41 AND created >= -20d",
  "meta": {
    "site": "redhat.atlassian.net",
    "storyPointsField": "<storyPointsField>",
    "counts": {
      "fetched": 12,
      "included": 10,
      "skipped": 2
    }
  },
  "items": [
    {
      "key": "<PROJECT>-533",
      "summary": "…",
      "description": "…",
      "issueType": "Story",
      "storyPoints": 3,
      "startDate": "2026-06-17",
      "completionDate": "2026-06-24",
      "cycleTime": 6
    }
  ],
  "cycleTime": {
    "closedDateRange": {
      "earliest": "2026-06-10",
      "latest": "2026-06-24"
    },
    "percentiles": [
      { "group": "all", "label": "All items", "count": 5, "p75Days": 3.4 },
      { "group": "issueType", "issueType": "story", "label": "All stories", "count": 1, "p75Days": 6 },
      { "group": "storyPoints", "storyPoints": 3, "label": "All 3 point items", "count": 1, "p75Days": 6 },
      { "group": "issueTypeAndStoryPoints", "issueType": "story", "storyPoints": 3, "label": "3 point items", "count": 1, "p75Days": 6 }
    ]
  }
}
```

`cycleTime` is `null` when no processed item has a numeric `cycleTime`.

---

## Example (structure only)

## JQL

```text
parent = <PROJECT>-41 AND created >= -20d
```

Fetched **12** issues; **10** included (resolution Done); **2** skipped.

## Historical report

```json
{
  "version": 1,
  "runAt": "2026-06-24T15:30:00.000Z",
  "jql": "parent = <PROJECT>-41 AND created >= -20d",
  "meta": { "counts": { "fetched": 12, "included": 10, "skipped": 2 } },
  "items": [ … ],
  "cycleTime": { … }
}
```

## Cycle time summary

```text
Closed date range: 2026-06-18 - 2026-06-23
Cycle time: 75th percentile (business days)

All items (8): 4 days
All stories (6): 3.5 days
…
```

## Saved files

- [.jira-historical-issues.json]({absolute-fetch-artifact-path})
- [.jira-historical-report.json]({absolute-report-artifact-path})

---

## Errors

Respect **route lock** ([SKILL.md](SKILL.md)): on MCP path, never auto-run CLI fetch; on CLI path, never auto-run MCP fetch. Ask the user to **switch routes** explicitly if needed.

| Situation | Chat response |
|-----------|----------------|
| Scope or fetch route unknown | **Stop** — [SKILL.md](SKILL.md) §0; ask what to include and CLI vs MCP; do not infer project or date range |
| MCP auth failed | Say so; re-authenticate the Atlassian MCP server once; if still failing, **stop** — ask if user wants to switch to CLI ([CLI.md](CLI.md)) |
| MCP fetch/save failed (MCP path) | **Stop** — do not run `fetch-historical-items.mjs`; ask user to fix MCP or switch to CLI |
| JQL returned 0 issues | Show JQL + "No issues matched." Still post **Saved files** links if empty artifacts were written |
| All issues skipped (non-Done) | Show JQL, fetch count, report with `items: []` and `cycleTime: null` |
| `run-historical-report.mjs` failure | Show JQL + full stderr (missing file, invalid fetch, missing changelog) — this is local processing, not a fetch fallback |
| MCP -32601 | Wrong tool name — read MCP schema; retry MCP; ask before switching to CLI |
| CLI fetch failed | Show stderr; check JIRA_EMAIL / JIRA_API_TOKEN — do not silently switch to MCP |
