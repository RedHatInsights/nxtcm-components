---
name: acceptance-criteria-write
description: >-
  Manual-only. Posts suggested acceptance criteria or spike goals from the
  current chat to Jira using acli workitem comment create. Use only when the
  user explicitly invoked the acceptance-criteria-write skill by name in this
  turn, after acceptance-criteria-check output includes non-empty Ready for
  review sections. Do not apply this skill proactively, from other skills, or
  when the user only mentions Jira or posting without naming this skill.
user-invocable: true
---

# Acceptance criteria write (Jira)

## Hard gate — stop unless all are true

1. **Explicit invocation:** The user **named** this skill (`acceptance-criteria-write`) or clearly said they are running **this** write-to-Jira skill in the **current** message. Generic requests (“post to Jira”, “update the ticket”) **do not** qualify—**stop** and ask them to invoke this skill by name.

2. **Ready for review present:** The conversation already contains **acceptance-criteria-check** (or equivalent) output with a **non-empty** **Ready for review** subsection under **DELIVERABLES** and/or **SPIKES** (same meaning if headings are `## DELIVERABLES` / `### Ready for review…`). If those sections are missing or only say `*None.*`, **stop**—nothing to post.

3. **No auto-chaining:** Do **not** run this skill because another workflow “should” post; do **not** infer from the model’s own prior turn without the user invoking write in this turn.

---

## Steps

### 1. Confirm `acli` is authenticated

```bash
acli jira auth status
```

Continue only if output includes **`✓ Authenticated`**. Otherwise stop and point the user to the [Atlassian CLI](https://developer.atlassian.com/cloud/acli/guides/how-to-get-started/) and [API token](https://id.atlassian.com/manage-profile/security/api-tokens) auth steps (same as `acceptance-criteria-check`).

---

### 2. Collect targets from “Ready for review” only

From the **latest** acceptance-criteria-style report in the thread:

- Under **deliverables**, inside **Ready for review** (only that subsection—not *Ready for pointing*, not *Needs review*), collect each issue line (`KEY - Summary` pattern, e.g. `FCN-232 - …`).
- Under **spikes**, do the same inside **Ready for review** for spikes.

If the user restricts keys in their message (“only FCN-100 and FCN-101”), honor that subset; otherwise post for **every** issue listed there.

If parsing is ambiguous, list the keys you will post and ask **one** yes/no confirmation before running creates.

**Do not post if the check run already said so (no extra Jira fetch):** Use the **same** `acceptance-criteria-check` report in this conversation. For each `KEY` under **Ready for review**, if the block for that issue includes a **Prior Jira** / prior-comment **disclosure** (e.g. text that an **existing** Jira comment already **begins with** `Suggested Acceptance Criteria`, or with `Suggested Spike Goals` / `Suggested Goals` for spikes), **skip** `comment create` for that key. The check run already had **comment** data; do **not** re-fetch with `acli` just to double-check. If skipped, say in chat that Jira already has a suggested comment and a second one was not posted; they can **edit or delete** that comment in Jira if they want a new posted draft. If **every** key is skipped, summarize and run **no** `comment create`. Only keys **not** skipped continue below.

---

### 3. Build each Jira comment body (`$BODY`)

**Header (same for every post):**

|  | Line |
|---|------|
| (1) | `Suggested Acceptance Criteria` (deliverables) or `Suggested Spike Goals` (spikes) — exact text, for the Jira / detection convention |
| (2) | `Created with AI` |
| (3+) | **The full** Ready-for-review text for that issue from the `acceptance-criteria-check` report, **not** the suggested-AC section alone |

**What goes in (3+):** Everything that appears in the check output **for that issue under** **Ready for review**, **after** the line `KEY - Summary`, **through** the end of that issue’s content (stops at the next `KEY - Summary` or the end of the **Ready for review** subsection). Include, when present, in order: **Why / motivation**, **UI design refs** (or spike **Why / why now**), **Prior Jira** disclosure, **Gaps to fix in the story (not AC):**, the **Suggested acceptance criteria** / **Suggested spike goals** heading, **and** every nested or peer line under that section (all testable criteria and narrative lines). The point is to post the **entire** review the user saw in chat, so Jira has context—not only the testable AC bullets. Preserve `*`, `**`, and indentation; if the check used plain lines without bullets, reformat to readable markdown (`* …` per line) without dropping content.

**Do not** drop the `KEY - Summary` line if you want it in Jira for a self-contained comment; or omit it since the key is the issue—either is fine, but (3+) must be **complete** otherwise.

After line (2), one **blank line** (real newline), then the full (3+). **Real newlines** throughout—see next section. Omit only if the user explicitly asked to trim the payload.

Build the full string as **`$BODY`** (see next section) so you can pass it to:

`acli jira workitem comment create --key <KEY> --body "$BODY"`

---

### 4. Real newlines in `--body` (bash / zsh)

**Problem:** In bash and zsh, **ordinary double quotes** `"..."` do **not** turn `\n` into a newline—you pass the two characters `\` and `n`, and Jira shows **literal** `\n` in the comment.

**Do one of the following** so `--body` receives real newline characters:

1. **ANSI-C quoted string (preferred):** `$'...'` — embedded `\n` becomes a real newline.

   Long bodies: prefer **temp file** or a **`body+=$'…'`** loop so the (3+) block (Why, UI, Prior Jira, Gaps, suggested AC—full report slice) is not one unreadable line.

   ```bash
   acli jira workitem comment create --key FCN-123 --body $'Suggested Acceptance Criteria\nCreated with AI\n\n* **Why / motivation:** …\n* **UI design refs:** …\n* …\n* **Suggested acceptance criteria**\n  * …\n'
   ```

   **Nested bullets:** include the leading spaces inside the string, e.g. `$'* **Suggested acceptance criteria**\n  * Child line\n'`

2. **Build in a variable** with `$'...'`, or **`printf`:**

   ```bash
   body=$'Suggested Acceptance Criteria\nCreated with AI\n'
   body+=$'* Line one\n* Line two\n'
   acli jira workitem comment create --key FCN-123 --body "$body"
   ```

   Or: `body=$(printf '%s\n' 'Suggested Acceptance Criteria' 'Created with AI' '* First' '* Second')` then `--body "$body"`.

3. **Temp file:** write the exact final comment (real line breaks) to a file, e.g. `body=$(cat comment.txt)` and `--body "$body"` (mind trailing newlines only if acli is picky).

**Wrong:** `--body "Suggested Acceptance Criteria\n* First"` — in normal `"..."` strings, `\n` is **not** a newline in standard shell.

---

### 5. Post, errors, and cleanup

**Post:** one `acli jira workitem comment create` **per** key **not** skipped in step 2. After **each** command, state in chat **success** or the **full error** from acli. If a create **fails**, **do not** mark that key as done; continue or stop per user.

**Cleanup:** when the run is finished, delete **only** scratch artifacts from this session (e.g. acli JSON dumps, `FCN-*.json`, `.jira-views/`, search result temp files the agent wrote). **Do not** remove pre-existing project files or user-owned deliverables.

---

## Pairing with `acceptance-criteria-check`

That skill **does not** post to Jira. This skill **only** posts what the user approved by invoking write after seeing **Ready for review**—and **step 2** here skips posting when the **check report in the same thread** already discloses a prior Jira `Suggested …` comment (so you do not add a duplicate). Keep rubrics and scoring in `acceptance-criteria-check`; this file is **write-only** and **manual**.
