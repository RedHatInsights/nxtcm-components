# Resolve `.jira-historical-report.json`

Shared **step 1** for [jira-get-estimates](../jira-get-estimates/SKILL.md) and [jira-get-stats](../jira-get-stats/SKILL.md).

**Hard stop:** Do not run later steps until a report file is resolved.

Path symbols: [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md).

---

## 1a. User provided a file or path

If the user pasted report JSON, attached a file, or gave an explicit path in chat, use that.

- Expand `~` to the home directory.
- Prefer **absolute paths** when verifying the file exists (e.g. `test -f` or Read).

---

## 1b. No path from the user

Resolve `{workspace}` (see CONVENTIONS), then look for the report **in order**:

1. `{workspace}/.jira-historical-report.json`
2. `~/.cursor/skills/.jira-historical-report.json`

Use the first path that exists. Do not assume either is present.

---

## 1c. File not found — stop

If neither 1a nor 1b produced a readable report file, **stop the workflow**. Do not proceed to later steps.

Post a short message like:

> I couldn't find `.jira-historical-report.json`.
>
> How would you like to proceed?
> 1. **Provide a file** — paste the report JSON or give me a path to `.jira-historical-report.json`.
> 2. **Generate a report** — run the **jira-get-historical-items** skill to fetch historical Jira items and build the report, then come back here.

Prefer **AskQuestion** when available. **Wait** for the user's choice before continuing.

- If they choose **1**, resume from step 1a with their file or path.
- If they choose **2**, read and follow [SKILL.md](SKILL.md) **from §0 Discovery gate**. Do **not** assume what the historical report should include (project, parents, date range) or CLI vs MCP from the calling thread unless the user stated those filters **for the historical report**. After that skill writes `.jira-historical-report.json`, return to the calling skill and re-run step 1.

---

## 1d. File found — confirm

When a report file is resolved:

1. Read the file and confirm it parses as JSON.
2. Confirm expected top-level fields exist: `version`, `items` (array). See [REPORT.md](REPORT.md) for full schema.
3. Note the resolved **absolute path** and **`{report-dir}`** (parent directory) for later steps.
4. Briefly tell the user which file was used (path only — do not dump the full JSON).

Load `meta.storyPointsField` when present; otherwise use `customfield_10028` ([CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md)).
