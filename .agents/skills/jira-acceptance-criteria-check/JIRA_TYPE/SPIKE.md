# Spike — evaluation criteria

Apply when `classified_type` is **spike** (this file).

## Type metadata

| Field | Value |
|-------|-------|
| **Slug** | `spike` |
| **Definition** | **Pure research.** No deliverable beyond a recommendation or learning output. Usually informs follow-up tasks or stories — not shippable product behavior as the main “done.” |
| **Jira issuetype aliases** | Spike |
| **Quick signals** | spike, research, POC, investigate, compare options, feasibility, timebox, recommendation |
| **Summary prefix hints** | Spike:, [Spike] |
| **Comment prefix** | Suggested Spike Goals |

Spikes are **research work**: investigating approaches, new knowledge, proofs of concept, comparing options, or reducing uncertainty. They are **not** a substitute for a delivery story unless the ticket explicitly frames **learning** as the main “done,” not production feature behavior.

This file adds the **description template** and rubric for **outcomes**, **scope and boundaries**, and **timebox** ([SCORING.md](../SCORING.md)). Spikes do **not** use acceptance criteria — completion is **bounded research + stated outcomes delivered**.

---

## Description template

A well-formed spike in Jira uses these sections (markdown `###` headings or equivalent in the ticket body):

### Description

What will be **learned or done** during the spike, and **why** it matters — what risk, gap, or decision this unblocks and why now ([GENERAL.md](../GENERAL.md) applies to the **why**; the **what** here is the investigation or exploration, not a user-facing feature).

### Outcomes

What the team will **get out of the work** — artifacts, answers, or decisions that help the project move forward (e.g. recommendation, comparison matrix, ADR, feasibility verdict, list of follow-up stories). Not story-style “user can click…” acceptance tests.

### Scope and boundaries

What is **in scope** and **out of scope** for this spike — explicit limits so the work does not drift into unscoped build or production delivery.

### Timebox

How much **time** will be spent (hours, days, end of sprint, or calendar cap). A bounded window sets depth expectations and defines when to stop and hand off.

**Example skeleton** (paste into Jira; replace placeholders):

```markdown
### Description

<What we will learn or explore, and why it matters now.>

### Outcomes

* <Decision, artifact, or answer the team will have when the spike ends>
* <How this unblocks the next story, task, or architectural choice>

### Scope and boundaries

**In scope:** <Questions, systems, or options we will investigate>
**Out of scope:** <Production features, full implementation, unrelated areas>

### Timebox

<e.g. 2 days, 8 hours, complete by end of sprint 42>
```

---

## Description (evaluation)

| Criterion | Good | Weak |
|-----------|------|------|
| **What will be learned/done** | Names the investigation, comparison, or unknown being closed | “Look into X” with no concrete activity |
| **Why** | Clear driver — blocks roadmap, reduces risk, answers architecture choice | No reason to prioritize now |
| **Why now** | Urgency or dependency stated when relevant | Could be deferred with no loss |
| **Not a disguised story** | Framed as research and learning | Only user-facing AC with no research outputs |

---

## Outcomes (evaluation)

Judge what the team will **get** when the spike ends — how it helps the project move forward.

| Criterion | Good | Weak |
|-----------|------|------|
| **Named deliverables** | Written findings, ADR, comparison, POC notes, demo branch, benchmarks | Activity only (“meetings,” “read docs”) with no handoff |
| **Decisions enabled** | States which choices or stories can start after the spike | Vague “we’ll know more” |
| **Verifiable complete** | Reviewer can tell the spike is done without shipped product behavior | Same bullets as a story’s acceptance criteria |
| **Actionable handoff** | Follow-up work is identifiable (even if tickets are filed later) | No link to what happens next |
| **Clarity** | One outcome per bullet; tight lines | Long narrative paragraphs |

**Missing outcomes:** If the ticket only lists implementation tasks or UI AC, score outcomes as **Missing** — reframe toward research outputs ([DRAFT.md](../DRAFT.md)).

---

## Scope and boundaries (evaluation)

| Criterion | Good | Weak |
|-----------|------|------|
| **In scope** | Specific questions, systems, APIs, or options under investigation | “Everything about X” |
| **Out of scope** | Explicit exclusions (production code, full UI build, unrelated teams) | No limits — spike can grow without bound |
| **Depth vs breadth** | Fits the timebox — focused slice | Too large for stated time |
| **Build guardrails** | POC/throwaway code allowed; production delivery called out as follow-up | Spike hides a full feature build |

Where comparison is relevant, scope should hint **how** options will be judged (constraints, success signals) without turning into implementation AC.

---

## Timebox (evaluation)

| Criterion | Good | Weak |
|-----------|------|------|
| **Explicit limit** | Hours, days, sprint boundary, or calendar date | Open-ended |
| **Realistic** | Matches scope and outcomes | Two hours for a multi-system POC |
| **Stop rule** | Implied or stated — what “done enough” means at timebox end | No stopping point |
| **Handoff on inconclusive** | Acceptable to document “no clear winner” and next steps | Only success path defined |

---

## Scoring

Use with [GENERAL.md](../GENERAL.md) and [SCORING.md](../SCORING.md). Produce **one 1–5** for how well this spike’s **content** defines bounded research.

### What to judge

| Layer | Source |
|-------|--------|
| Description — what will be learned/done + why | [Description (evaluation)](#description-evaluation) |
| Outcomes | [Outcomes (evaluation)](#outcomes-evaluation) |
| Scope and boundaries | [Scope and boundaries (evaluation)](#scope-and-boundaries-evaluation) |
| Timebox | [Timebox (evaluation)](#timebox-evaluation) |

### Weak vs strong (score drivers)

| Area | Weak (pulls toward 1–3) | Strong (pulls toward 4–5) |
|------|-------------------------|---------------------------|
| Description | “Look into X” | What will be learned and why now |
| Outcomes | Story-style UI AC only | Artifacts, decisions, or answers that unblock next work |
| Scope and boundaries | Unbounded | Clear in/out of scope |
| Timebox | Open-ended | Explicit time limit |

### Balance and caps

- **Disguised story/task** (only shippable feature AC, no research outputs) → **cap at 2–3** until reframed.
- Description + timebox but no outcomes → **cap at 3**.
- Outcomes + description but no timebox → **cap at 3–4** depending on scope clarity.

### Calibration examples

| Score | Example |
|-------|---------|
| **5** | Clear learn/done + why, named outcomes, in/out scope, explicit timebox. |
| **4** | Solid on all four; timebox or scope slightly soft. |
| **3** | Good description but missing timebox or vague outcomes. |
| **2** | Description only; no outcomes or timebox. |
| **1** | Empty or indistinguishable from a delivery story with no research framing. |

---

## Completion (not a Jira section)

When drafting suggestions ([DRAFT.md](../DRAFT.md)) or closing a spike, verification is:

1. **Timebox** respected (or explicitly extended with reason).
2. **Outcomes** listed in the ticket are delivered or documented as partial with gaps named.
3. **Scope** was honored — no unscoped production feature shipped as “spike complete.”
4. Team can file or refine **follow-up stories/tasks** from the findings.

Do not replace missing outcomes or timebox with story-style acceptance criteria unless the ticket was misclassified.
