# Update Jira with estimates (optional)

After [OUTPUT.md](OUTPUT.md) delivers the estimate report and [SKILL.md](SKILL.md) step 6 asks the user, apply estimates to Jira via **MCP only**.

---

## When to run

Run **only when** the user clearly chooses **Update Jira** in step 6.

| Do | Do not |
|----|--------|
| Wait for step 5 report to finish first | Call write tools before the user agrees |
| Update every fetched issue that has applicable values | Re-fetch issues just to double-check estimates |
| Honor a user-named key subset | Update keys the user excluded |

---

## Per-issue rules

Use the estimates from **this run's** step 5 output — not existing Jira values.

| Field | Apply when | Skip when |
|-------|------------|-----------|
| **Story points** (`editJiraIssue`) | Issue type is **Story** or **Task** **and** `Estimated points` is a definite number (`1`, `2`, `3`, `5`, `8`) | `n/a`, `cannot determine`, **Bug**, **Spike** |
| **Cycle-time comment** (`addCommentToJiraIssue`) | `Estimated cycletime` is a definite value (e.g. `6 business days (p75)`) | `n/a`, `cannot determine` |

An issue may get **story points only**, **comment only**, **both**, or **neither** — depending on which values exist for that issue.

**Never** set story points on **bugs** or **spikes**, even if Jira already has points.

---

## MCP transport

**MCP only** — do **not** use `acli` or direct REST for this step.

1. Read MCP tool schemas under `user-atlassian-mcp-server` before calling.
2. If only **`mcp_auth`** is listed → call `mcp_auth` for `user-atlassian-mcp-server` with `{}`, then re-check tools.
3. Use `cloudId`: `redhat.atlassian.net` (or `2b9e35e3-6bd3-4cec-b838-f4249ee02432`).
4. Story points field: `meta.storyPointsField` from the historical report when present; otherwise `customfield_10028`.

### Set story points

For each issue that qualifies, call **`editJiraIssue`**:

- `issueIdOrKey`: the Jira key
- `fields`: `{ "<storyPointsField>": <number> }` — use the numeric estimate from this run

### Post cycle-time comment

For each issue that qualifies, call **`addCommentToJiraIssue`**:

- `issueIdOrKey`: the Jira key
- `commentBody`: built per [Comment body](#comment-body) below
- `contentFormat`: `"markdown"`

Run story-point updates and comments in any sensible order per issue (e.g. points first, then comment).

**On MCP failure** (auth, server missing, API error): report the **full error** for that key; do **not** fall back to acli. Tell the user to fix MCP in **Settings → MCP** (Atlassian server enabled; complete `mcp_auth` if prompted) and re-run the update step if they want.

After **each** successful write, confirm in chat: key + what was updated (`story points set to N`, `cycle-time comment posted`, or both). On failure, show the error and continue or stop per user preference.

---

## Skip duplicate cycle-time comments

Before posting a cycle-time comment, check whether this run's fetch already found an existing Jira comment that **starts with**:

```text
Estimated cycle time
```

**Source:** comment data from the step 3 fetch in this run — **do not** re-fetch just to double-check.

If a prior estimated cycle-time comment exists for a key → **skip** the comment for that key (still set story points when applicable). Tell the user Jira already has an estimated cycle-time comment; they can edit or delete it in Jira if they want a new one.

---

## Comment body

Build one `commentBody` per key from this run's `Estimated cycletime` line.

**Format:**

```text
Estimated cycle time

<exact cycletime text from step 5 output, without the "Estimated cycletime:" label>

Created with AI
```

**Example** (story/task):

```text
Estimated cycle time

6 business days (p75)

Created with AI
```

**Example** (bug):

```text
Estimated cycle time

4.2 business days (p75, all bugs)

Created with AI
```

Use the same cycle-time wording the user saw in the step 5 report — do not rephrase or round.

---

## Summary after all writes

Post a short closing summary:

- Keys updated (story points, comments, or both)
- Keys skipped (no applicable values, duplicate comment, or user subset)
- Any failures
