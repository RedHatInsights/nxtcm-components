---
name: jira-get-estimates
description: >-
  Recommend Jira story point estimates using historical closed-item data from
  .jira-historical-report.json. Resolves the report from user path, active
  workspace, or ~/.cursor/skills fallback; fetches target issues via JQL, builds effort profiles from
  historical story-point groups, and maps each issue to the closest point bucket.
  Stories and tasks only for points; bugs get p75 cycle time from bug history (no
  points); spikes get no points or time estimate. After reporting, asks whether to
  update Jira (story points + cycle-time comments) or do nothing. Use when the user
  asks for Jira estimates, story point sizing, or estimate recommendations from
  historical cycle time data.
user-invocable: true
---

# Get Jira estimates

Recommend story point estimates by calibrating effort levels from historical items in `.jira-historical-report.json`, then matching each target issue to the closest story-point bucket.

**Reference files** (read when you reach that step):

| File | Contents |
|------|----------|
| [SIZING.md](SIZING.md) | Effort profiles, team scale, per-issue estimation, cycle time lookup |
| [JIRA.md](JIRA.md) | Fetch target issues via MCP |
| [OUTPUT.md](OUTPUT.md) | Chat output format |
| [UPDATE_JIRA.md](UPDATE_JIRA.md) | Optional Jira write after report (story points + cycle-time comments) |
| [jira-get-historical-items/RESOLVE_REPORT.md](../jira-get-historical-items/RESOLVE_REPORT.md) | Step 1 — resolve `.jira-historical-report.json` |
| [jira-get-historical-items/REPORT.md](../jira-get-historical-items/REPORT.md) | Report JSON schema (`items`, `cycleTime.percentiles`) |
| [jira-get-historical-items/SKILL.md](../jira-get-historical-items/SKILL.md) | Generate `.jira-historical-report.json` (user consent only) |
| [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) | Shared paths, MCP rules, glossary |

---

## Hard rules

| Do | Do not |
|----|--------|
| Resolve `.jira-historical-report.json` first → [RESOLVE_REPORT.md](../jira-get-historical-items/RESOLVE_REPORT.md) | Guess a report path or continue with empty historical data |
| **Stop** when no report file is found | Silently invoke `jira-get-historical-items` without user consent |
| Post estimate results **in chat** by default → [OUTPUT.md](OUTPUT.md) | Write a markdown file unless the user asks for one |
| Write optional markdown to `{report-dir}/.jira-estimates-report.md` when asked — **absolute path** | Save estimates to skill dir, cwd, or a path the user did not request |
| **Post absolute paths** under `## Saved files` when a markdown file was written | Omit where the file was saved |
| **Hand off** to `jira-get-historical-items` with its §0 discovery gate | Assume report scope or CLI/MCP from the estimating conversation |
| Build exact JQL before fetching | Run a vague or invented query |
| Post the exact JQL used before results | Hide the query from the user |
| **Build effort profiles** per story-point group from historical data | Require an exact ticket-to-ticket description match |
| Assess target issue **effort** (scope, complexity, touch surface) | Size from summary alone when a description exists |
| Match effort to the **closest valid point** (1, 2, 3, 5, or 8) for **stories and tasks only** | Use values outside the allowed scale or skip gaps when effort falls between neighbors |
| Use **all** historical `items` to calibrate effort (pointed and unpointed) | Ignore unpointed rows entirely |
| **Ignore** existing Jira story points when estimating stories/tasks | Use the current Jira point value as the estimate |
| **Spikes:** no story points and no time estimate | Assign points or cycle time to spikes |
| **Bugs:** no story points; report **p75 cycle time** from historical bugs only | Assign story points to bugs or size bugs against the point scale |
| Report **cannot determine** only when scope is truly unknown (stories/tasks) or no bug history exists (bugs) | Refuse to estimate because history is sparse or the match is imperfect |
| Read MCP tool schemas before Jira calls | Call Jira tools without checking schema |
| **Ask** after the report whether to update Jira or do nothing | Update Jira without clear user agreement |
| **MCP only** for Jira writes in step 6 | Use `acli` or REST for story points or comments |

---

## Constants

| | Value |
|--|--------|
| **`{workspace}`**, **`{report-dir}`**, report lookup | [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) |
| Report filename | `.jira-historical-report.json` |
| Default output | **Chat only** — no file written |
| Optional markdown artifact | `{report-dir}/.jira-estimates-report.md` — only when the user asks for a markdown file |
| Jira site | `redhat.atlassian.net` |
| **Allowed story points** | `1`, `2`, `3`, `5`, `8` only |

---

## Workflow

```
Progress:
- [ ] Step 1 — Resolve historical report file → [RESOLVE_REPORT.md](../jira-get-historical-items/RESOLVE_REPORT.md)
- [ ] Step 2 — Resolve scope and build JQL
- [ ] Step 3 — Fetch target issues → [JIRA.md](JIRA.md)
- [ ] Step 4 — Estimate each issue → [SIZING.md](SIZING.md)
- [ ] Step 5 — Report results → [OUTPUT.md](OUTPUT.md)
- [ ] Step 6 — Offer to update Jira → [UPDATE_JIRA.md](UPDATE_JIRA.md)
```

---

## Step 1 — Resolve historical report file

Follow [jira-get-historical-items/RESOLVE_REPORT.md](../jira-get-historical-items/RESOLVE_REPORT.md) (steps 1a–1d).

---

## Step 2 — Resolve scope and build JQL

The user must supply **what to estimate** — either natural language or JQL. If they invoked the skill with no scope, **stop and ask** what issues to review (paste keys, describe a filter, or provide JQL).

### 2a. User provided JQL

Use the JQL **as-is** unless it is obviously invalid. Normalize only when needed (e.g. `createdDate` → `created`).

### 2b. User provided natural language

Translate intent into **exact JQL**. Common patterns:

| User intent | JQL pattern |
|-------------|-------------|
| Specific keys | `key in (FCN-123, FCN-456)` |
| Unpointed items in a project | `project = FCN AND "Story Points[Number]" IS EMPTY AND type in (Story, Task)` |
| Items under parent epics | add `AND parent in (FCN-41, FCN-100, ...)` |
| Open backlog | add `AND status not in (Closed, Done)` |
| Closed items for review | add `AND status in (Closed, Done)` |

Combine filters the user mentions. When project or type is missing, infer from issue keys or ask — do not invent a project.

### 2c. Confirm JQL

Before fetching, post the exact JQL in a fenced block:

```text
<exact JQL>
```

---

## Step 3 — Fetch target issues

Follow [JIRA.md](JIRA.md).

---

## Step 4 — Estimate each issue

Sizing logic: [SIZING.md](SIZING.md). Orchestration constraints: Hard rules above.

---

## Step 5 — Report results

Follow [OUTPUT.md](OUTPUT.md). Default: post in chat only.

When the user asked for a **markdown file**, write the same content to `{report-dir}/.jira-estimates-report.md` using an **absolute path**, then post `## Saved files` with a clickable link to that file (and the historical report path used). Do not re-paste the file body under `## Saved files`.

---

## Step 6 — Offer to update Jira (optional)

After step 5 is complete, ask what the user wants to do with the estimates.

> **What would you like to do with these estimates?**
> 1. **Update Jira** — set story points and post cycle-time comments for all applicable items (MCP)
> 2. **Do nothing** — keep the estimates in chat only

Wait for the user's choice before any Jira writes.

| Choice | Action |
|--------|--------|
| **Update Jira** | Follow [UPDATE_JIRA.md](UPDATE_JIRA.md) for every fetched issue |
| **Do nothing** | Acknowledge briefly. Do not call Jira write tools. |

Treat clear agreement (**yes**, **y**, **update**, **post**, option **1**) as **Update Jira**. **No** or option **2** → **do nothing**. **Implicit default: do nothing** (including silence).

If the user restricts keys in their reply (“only FCN-100”), honor that subset.

---

## Pitfalls

| Problem | Fix |
|---------|-----|
| No report file | [RESOLVE_REPORT.md](../jira-get-historical-items/RESOLVE_REPORT.md) step 1c — stop; workspace then `~/.cursor/skills/` |
| Report in workspace but agent checked skills dir only | RESOLVE_REPORT step 1b — workspace first |
| User asked for markdown file | Step 5 — write `{report-dir}/.jira-estimates-report.md`; post `## Saved files` |
| Generate report handoff | Follow jira-get-historical-items §0 — ask scope + CLI/MCP; don't infer FCN or date range |
| User gave no scope (estimates) | Ask for keys, JQL, or a natural-language filter before fetching |
| Historical report missing some point values | [SIZING.md](SIZING.md) — ordered scale + neighbors |
| MCP 401 | [JIRA.md](JIRA.md) — `mcp_auth`, retry once |
| Empty description, vague summary | **cannot determine** for that story/task only — [SIZING.md](SIZING.md) |
| Bug or spike in scope | No story points — bugs use bug p75 only; spikes get `n/a` for both |
| No bugs in historical report | Bug cycle time **cannot determine** — do not fall back to all-items p75 |
| **Skipping step 6** | Delivering estimates without asking update vs do nothing |
| **Updating without consent** | Calling `editJiraIssue` or `addCommentToJiraIssue` before the user chooses **Update Jira** |
| **acli for writes** | Step 6 uses MCP only — [UPDATE_JIRA.md](UPDATE_JIRA.md) |
