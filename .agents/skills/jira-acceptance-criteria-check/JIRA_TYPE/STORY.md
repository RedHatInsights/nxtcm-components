# Story — evaluation criteria

Apply when `classified_type` is **story** (this file).

## Type metadata

| Field | Value |
|-------|-------|
| **Slug** | `story` |
| **Definition** | **End-user changes.** Work impacts the user interface or how users (or other systems) interact with the application. Usually feature changes or additions; rarely removal of user-facing features. *(Bundled default for this skill install — edit to match your team, e.g. if Story means any non-routine work.)* |
| **Jira issuetype aliases** | Story, User Story |
| **Quick signals** | user, UI, screen, flow, wizard, button, display, feature, integration visible to user |
| **Comment prefix** | Suggested Acceptance Criteria |

Description **WHAT** and **WHY** → [GENERAL.md](../GENERAL.md). This file adds the **description template**, story-specific checks, and **acceptance criteria** rubric for scoring ([SCORING.md](../SCORING.md)).

---

## Description template

A well-formed story description in Jira uses these sections (markdown `###` headings or equivalent in the ticket body):

### Description or User Story

Describes the **what** and **why** ([GENERAL.md](../GENERAL.md)).

### Acceptance Criteria

The full acceptance criteria — testable bullets judged against the rubric in [Acceptance criteria](#acceptance-criteria) below.

### Mockups / Design

Description and/or a link to design docs — for example a Figma link, prototype, or spec. Required for large or complex UI (see [Description (story-specific)](#description-story-specific)); may be brief or **N/A** for trivial UI tweaks.

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

### Mockups / Design

<Figma link, screenshot reference, or N/A — small UI tweak>
```

---

## Description (story-specific)

**UI complexity and design references:** For **large or complex** user interface changes (new flows, new screens, major layout or interaction shifts), the ticket links to **mockups, prototypes, or design specs** (Figma, screenshots, design-system references, or similar). Trivial UI tweaks may not need them; ambiguous or broad UI work without a visual or spec anchor should be flagged.

When scoring UI design refs in the report: **`Met`** · **`Partial`** · **`Missing`** · **`N/A`** (non-UI or trivial tweak).

---

## Acceptance criteria

**Testability:** Each criterion must be verifiably clear, allowing QA to create specific, objective pass/fail test cases.

**User-Centricity:** Focus on what the user experiences or achieves, not how the code is written.

**What vs how (outcomes vs implementation):** AC should specify **what** must be true when the work is accepted—observable outcomes, user-visible behavior, and constraints on experience. Avoid prescribing **how** to implement (specific layers, refactors, internal APIs, file moves) except where the ticket defines an explicit integration **contract**; then state that contract as the **what** at the boundary (e.g. what data the host provides), not arbitrary engineering steps.

**Clarity, conciseness & length:** One **verifiable outcome** per bullet, as a **tight line** (not a paragraph). Prefer precise pass/fail wording over narrative; keep background, rationale, and long edge-case notes in the story body or linked docs. Plain language so the list stays **scannable** for QA, product, and engineering.

**Grouping & nesting:** **Related** criteria can sit under one **parent** bullet so readers see structure (e.g. one flow: loading state → error/retry → success branches; or one integration contract with sub-bullets for each observable rule). Each nested line stays a **separate** testable outcome; nesting shows **relationship**, not one long run-on sentence.

**Completeness:** Cover functional requirements, edge cases, error handling (e.g., empty states, invalid input), and performance thresholds where relevant.

**Happy path vs error coverage:** AC should not stop at “it works when everything goes right.” For anything that can fail (validation, permissions, network/API errors, empty lists, timeouts), the AC should state the **expected user-visible outcome**—not only on success.

**Boundary Definition:** Clearly outline what is included in the scope to prevent scope creep.

**Functional Precision:** Does the AC specify UI interactions (e.g., "On click," "On hover," "Upon form submission")?

**Visual/Responsive Requirements:** Does it mention specific states (Active, Disabled, Loading) if applicable?

**Validation & Error Handling:** Does it define what happens when a user enters invalid data into a web form or if an API call fails? Are error messages, inline field feedback, and disabled/submit states specified where relevant?

**Navigation:** Is the "Success Path" clear (e.g., "User is redirected to the Dashboard")? If a step can fail, is it clear whether the user stays on the page, sees an error region, or gets a retry path?

---

## Scoring

Use with [GENERAL.md](../GENERAL.md) and [SCORING.md](../SCORING.md). Produce **one 1–5** for how well this story’s **content** fits a deliverable user-facing ticket.

### What to judge

| Layer | Source |
|-------|--------|
| Description — WHAT + WHY | [GENERAL.md](../GENERAL.md) |
| Acceptance criteria | [Acceptance criteria](#acceptance-criteria) above |
| UI design refs | [Description (story-specific)](#description-story-specific) — **only** for large or complex UI |

### Weak vs strong (score drivers)

| Area | Weak (pulls toward 1–3) | Strong (pulls toward 4–5) |
|------|-------------------------|---------------------------|
| Description | No WHAT/WHY | Problem and change are clear |
| Acceptance criteria | Missing, vague, or implementation-only | Testable, user-visible outcomes; errors and key states covered |
| UI design (large/complex UI only) | No mockup/Figma/spec when UI work is broad | Link or spec anchor present |

### Balance and caps

- Great AC with thin or missing WHAT/WHY → **cap at 3**.
- Clear WHAT/WHY with no testable AC → **cap at 2–3**.
- Large/complex UI with no design anchor → unlikely above **3** until link or spec exists.

### Calibration examples

| Score | Example |
|-------|---------|
| **5** | Clear WHY/WHAT + AC covers happy path, loading, and errors; Figma linked for a new wizard step. |
| **4** | Solid WHY/WHAT + testable AC; one edge case or error path unnamed. |
| **3** | WHY present but AC stops at happy path only; or WHAT clear but AC is thin. |
| **2** | Bullets are implementation tasks, not testable outcomes; or summary-only with vague AC. |
| **1** | Empty description; no usable AC. |
