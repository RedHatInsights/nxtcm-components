# Description clarity — bot suitability

Apply when evaluating criterion slug **description_clarity** (this file).

## Criterion metadata

| Field | Value |
|-------|-------|
| **Slug** | `description_clarity` |
| **Definition** | The ticket includes enough information to know **what** the bug, task, or story is asking for — without guessing intent from the title alone. |
| **Weight hint** | Thin description caps holistic bot confidence at **2** ([SCORING.md](../SCORING.md)). |

---

## What to look for

| Signal | Bot-friendly | Bot-unfriendly |
|--------|--------------|----------------|
| **Outcome** | Clear expected behavior or deliverable | “Improve X”, “fix issue”, title-only |
| **Scope** | Bounded change area (screen, API, component) | Epic-sized ask in one ticket |
| **Context** | WHY or user impact stated (WHAT/WHY both present) | Implementation notes only, no problem statement |
| **Acceptance / repro** | Testable bullets, repro steps (bugs), or verifiable AC | Vague checklist, missing steps |
| **References** | Links to design, parity ticket, or error logs | “See Slack” with no summary in ticket |
| **Contradictions** | Single coherent ask | AC conflicts with description |
| **Completeness** | Expected outcome names concrete values (URL, copy, command) | Names **what** to add but omits **values** the bot must not invent |

Judge **substance anywhere in the body or comments** — not whether `###` headings match a template.

**Clarity ≠ complete information:** A ticket can rate high on this criterion (knowing **what** to change) while still missing URLs, copy, or commands needed for done. That gaps **open_questions** — which caps holistic score **≤ 3** regardless of description clarity alone.

---

## Scoring

Rate **description clarity only** from 1–5 (higher = clearer for a bot).

### Weak vs strong

| Rating | Signals |
|--------|---------|
| **5** | WHAT, WHY, and verifiable success criteria (or bug repro/expected/actual) are explicit; a bot can derive a task list without inventing requirements. |
| **4** | Mostly clear; one minor ambiguity on **optional** detail — not on required deliverables (URLs, copy, commands evaluated in **open_questions**). |
| **3** | Intent visible but important pieces vague — partial AC, missing error paths, or unclear scope. |
| **2** | Summary-level only; large gaps; bot would need to invent behavior. |
| **1** | Title-only or contradictory; cannot tell what “done” means. |

### Calibration examples

| Rating | Example |
|--------|---------|
| **5** | Bug: repro steps, expected vs actual, environment. Story: user outcome + testable AC for happy and error paths. |
| **4** | Story with clear feature ask; one unnamed edge case. Task with file path and concrete change described. |
| **3** | “Add validation to form” with no rules; feature name without behavior. |
| **2** | “Refactor module for performance” with no metric or target files. |
| **1** | “Fix login” with empty description. |

---

## Reporting

When this criterion rates **≤ 2** (thin description), include in `blockers` ([REPORT.md](../REPORT.md)):
- ✓ "Thin description: no acceptance criteria or expected behavior"
- ✓ "Unclear scope: 'improve performance' with no metric or target"
- ✗ "description issues" (too vague)

