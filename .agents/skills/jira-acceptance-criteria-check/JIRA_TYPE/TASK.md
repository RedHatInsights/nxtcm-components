# Task — evaluation criteria

Apply when `classified_type` is **task** (this file).

## Type metadata

| Field | Value |
|-------|-------|
| **Slug** | `task` |
| **Definition** | **Structural or coding work without a user interface.** There is a clear deliverable — code change, config change, report, tooling, infra, etc. *(Bundled default for this skill install — edit to match your team, e.g. if Task means routine or operational work.)* |
| **Jira issuetype aliases** | Task |
| **Quick signals** | refactor, config, pipeline, dependency bump, report, script, infra, API contract (no UI) |
| **Comment prefix** | Suggested Acceptance Criteria |

Description **WHAT** and **WHY** → [GENERAL.md](../GENERAL.md). This file adds the **description template**, task-specific checks, and **acceptance criteria** rubric for scoring ([SCORING.md](../SCORING.md)).

---

## Description template

A well-formed task description in Jira uses these sections (markdown `###` headings or equivalent in the ticket body):

### Description

Describes the **what** and **why** ([GENERAL.md](../GENERAL.md)).

### Acceptance Criteria

The full acceptance criteria — testable bullets judged against the rubric in [Acceptance criteria](#acceptance-criteria) below.

### Out of Scope

This section doesn't need to be filled out.  When it is filled out is specifies any thing that is not covered by this story.  Not that this shouldn't replace acceptance criteria. The purpose of this section is for clarification or to answer commonly asked questions.

### Implementation Notes

This section doesn't need to be filled out.  When it is filled out it contains high level implementation approaches, notes, or items a developer will need to know when coding.

**Example skeleton** (paste into Jira; replace placeholders):

```markdown
### Description or User Story

<What is changing and why it matters.>

### Acceptance Criteria

* <Verifiable outcome 1>
* <Verifiable outcome 2>

```

---

## Acceptance criteria

**Testability:** Each criterion must be verifiably clear, allowing QA or team members to determine when the work is complete.


**What vs how (outcomes vs implementation):** AC should specify **what** must be true when the work is accepted. Avoid prescribing **how** to implement (specific layers, refactors, internal APIs, file moves) except where the ticket defines an explicit integration **contract**; then state that contract as the **what** at the boundary (e.g. what data the host provides), not arbitrary engineering steps.

**Clarity, conciseness & length:** One **verifiable outcome** per bullet, as a **tight line** (not a paragraph). Prefer precise pass/fail wording over narrative; keep background, rationale, and long edge-case notes in the story body or linked docs. Plain language so the list stays **scannable** for QA, product, and engineering.

**Grouping & nesting:** **Related** criteria can sit under one **parent** bullet so readers see structure (e.g. one flow: loading state → error/retry → success branches; or one integration contract with sub-bullets for each observable rule). Each nested line stays a **separate** testable outcome; nesting shows **relationship**, not one long run-on sentence.

**Completeness:** Cover functional requirements, edge cases, error handling (e.g., empty states, invalid input), and performance thresholds where relevant.

**Boundary Definition:** Clearly outline what is included in the scope to prevent scope creep.

---

## Scoring

Use with [GENERAL.md](../GENERAL.md) and [SCORING.md](../SCORING.md). Produce **one 1–5** for how well this task’s **content** fits a non-UI deliverable ticket.

### What to judge

| Layer | Source |
|-------|--------|
| Description — WHAT + WHY | [GENERAL.md](../GENERAL.md) |
| Acceptance criteria | [Acceptance criteria](#acceptance-criteria) above |

### Weak vs strong (score drivers)

| Area | Weak (pulls toward 1–3) | Strong (pulls toward 4–5) |
|------|-------------------------|---------------------------|
| Description | No WHAT/WHY | Deliverable and reason are clear |
| Acceptance criteria | Missing or not verifiable | Clear done conditions for the deliverable |

### Balance and caps

- Great AC with thin or missing WHAT/WHY → **cap at 3**.
- Clear WHAT/WHY with no verifiable AC → **cap at 2–3**.

### Calibration examples

| Score | Example |
|-------|---------|
| **5** | Clear WHAT/WHY + AC states observable done state for config/report/code change. |
| **4** | Solid WHAT/WHY + AC covers main outcome; one edge case unnamed. |
| **3** | Intent clear but AC incomplete or partly untestable. |
| **2** | Description only, or AC is a task list without verifiable outcomes. |
| **1** | Empty description; summary-only. |
