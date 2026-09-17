# Bug — evaluation criteria

Apply when `classified_type` is **bug** (this file).

## Type metadata

| Field | Value |
|-------|-------|
| **Slug** | `bug` |
| **Definition** | **Broken functionality.** Prevents the user from performing a task they would normally be able to perform. |
| **Jira issuetype aliases** | Bug |
| **Quick signals** | broken, regression, fails, error, cannot, unexpected, works in X not Y |
| **Comment prefix** | Suggested Acceptance Criteria |

Description **WHAT** and **WHY** → [GENERAL.md](../GENERAL.md). This file adds the **description template** and rubric for **how to reproduce** and **expected** behavior ([SCORING.md](../SCORING.md)). Bugs do **not** use an acceptance criteria section — fix verification is **repro gone + expected behavior restored**.

---

## Description template

A well-formed bug in Jira uses these sections (markdown `###` headings or equivalent in the ticket body):

### Description

Describes the **what** and **why** ([GENERAL.md](../GENERAL.md)) — what is broken, who is affected, and why it matters (user blocked, regression, severity).

### How to reproduce

Step-by-step instructions to **repeatedly** reproduce the bug. Numbered steps; include prerequisites (role, data, feature flags, starting page) so QA and devs get the same result.

### Expected

What **should** happen — the correct behavior when the user follows the repro steps.

### Actual

What **does** happen instead — the observable failure (error message, wrong screen, silent failure, etc.). Include this section when it is not already obvious from the description alone.

**Example skeleton** (paste into Jira; replace placeholders):

```markdown
### Description

<What is broken, who is impacted, and why it matters.>

### How to reproduce

1. <Prerequisite or starting state>
2. <Action>
3. <Action>

### Expected

<Correct behavior — what the user should see or be able to do.>

### Actual

<What happens instead — error, wrong state, blocked action.>
```

---

## How to reproduce (evaluation)

Judge whether someone **not** on the authoring team can reproduce the bug reliably.

| Criterion | Good | Weak |
|-----------|------|------|
| **Repeatability** | Same steps yield the same failure most of the time | “Sometimes fails” with no pattern |
| **Step clarity** | Numbered, ordered, one action per step | Vague “use the app and see error” |
| **Starting state** | Role, account, data, URL, or feature state stated | Assumes tacit team knowledge |
| **Environment** | Browser/OS/version, cluster, or build called out when relevant | Omits environment though bug is env-specific |
| **Minimal path** | Shortest path to the failure | Long unrelated setup |
| **Evidence** | Screenshot, HAR, console snippet, or log line when helpful | No anchor for intermittent issues |

**Missing repro:** If there are no steps, score repro as **Missing** — the bug cannot be verified or closed with confidence.

---

## Expected (evaluation)

Judge whether **correct** behavior is defined clearly enough to know when the fix is done.

| Criterion | Good | Weak |
|-----------|------|------|
| **Observable outcome** | States what the user sees, can do, or what data shows | “Should work correctly” |
| **Scoped to repro** | Expected result matches the steps above | Generic product spec unrelated to repro |
| **Complete path** | Success includes navigation, messaging, or state change if relevant | Only happy path implied |
| **Contrast with actual** | Reader can tell expected vs actual without guessing | Expected duplicates description noise |

For bugs, **expected behavior often replaces acceptance criteria** — “done” means repro steps produce the expected result.

---

## Actual (evaluation)

When an **Actual** section (or equivalent in the description) is present:

| Criterion | Good | Weak |
|-----------|------|------|
| **Specific failure** | Named error, wrong UI, missing control, incorrect data | “Doesn’t work” |
| **User-visible** | Describes what the user experiences | Internal-only stack trace with no user impact |
| **Aligned with repro** | Failure happens at the last step (or noted step) | Mismatch between steps and failure |

If **actual** is only implied, score **Partial** when the gap is inferable; **Missing** when the failure mode is unclear.

---

## Description (bug-specific)

Beyond [GENERAL.md](../GENERAL.md):

- **Impact:** Is it clear **what task** the user cannot complete?
- **Regression:** If this used to work, is that stated (version, release, or “regression since …”)?
- **Scope:** Is the bug bounded (one flow) vs “whole app broken” without evidence?

---

## Scoring

Use with [GENERAL.md](../GENERAL.md) and [SCORING.md](../SCORING.md). Produce **one 1–5** for how well this bug’s **content** supports fix and verification.

### What to judge

| Layer | Source |
|-------|--------|
| Description — WHAT + WHY (+ impact) | [GENERAL.md](../GENERAL.md), [Description (bug-specific)](#description-bug-specific) |
| How to reproduce | [How to reproduce (evaluation)](#how-to-reproduce-evaluation) |
| Expected | [Expected (evaluation)](#expected-evaluation) |
| Actual | [Actual (evaluation)](#actual-evaluation) — when present or inferable |

### Weak vs strong (score drivers)

| Area | Weak (pulls toward 1–3) | Strong (pulls toward 4–5) |
|------|-------------------------|---------------------------|
| Description | Impact unclear | What is broken and why it matters |
| How to reproduce | Missing or not repeatable | Numbered steps with starting state |
| Expected / actual | “Should work” only | Observable correct vs broken behavior |

### Balance and caps

- No repro steps → **cap at 2** (cannot verify fix).
- Repro + expected but vague actual → **typically 3–4** if failure mode is inferable.
- Clear WHAT/WHY with no repro → **cap at 2–3**.

### Calibration examples

| Score | Example |
|-------|---------|
| **5** | Impact clear + numbered repro + specific expected and actual. |
| **4** | Good repro + expected; actual slightly thin but failure is obvious from steps. |
| **3** | Repro works but expected vague, or actual missing and only partly inferable. |
| **2** | Description of broken behavior only; no repro steps. |
| **1** | Title-only or no indication of failure mode. |

---

## Fix verification (not a Jira section)

When drafting suggestions ([DRAFT.md](../DRAFT.md)) or closing a bug, verification is:

1. Follow **how to reproduce** — failure no longer occurs.
2. Observe **expected** behavior.
3. Spot-check related paths only when the fix could reasonably regress neighbors.

Do not replace missing repro/expected with a list of story-style AC unless the ticket was misclassified.
