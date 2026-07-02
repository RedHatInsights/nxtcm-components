# Description section

Apply when drafting the **Description** registry section ([TEMPLATE.md](../TEMPLATE.md) § Section registry).

## Section metadata

| Field | Value |
|-------|-------|
| **Heading** | `## Description` |
| **Required** | yes |
| **Discovery** | what (outcome), why (motivation), end-to-end flow (ordered user/system steps); parent slice when parent exists |
| **Breakdown trace** | `—` (context only — journey slicing) |
| **Owns** | What, why, user journey, business/platform rationale |
| **Does not own** | Checkbox outcomes, repo paths, design links, test steps |
| **Length target** | ~3–5 short paragraphs + flow list (**5–9** numbered steps) |
| **Research feeds** | Existing vs net-new pages (for AC alignment); entry points and routes |

Summarize **what**, **why**, and **how users move through the work** — not implementation tasks.

**Audience & style:** [WRITING.md](../WRITING.md) — plain language for project owners, PMs, and management. Concise. Do not repeat content that belongs in other registry sections.

---

## Structure

Use this order inside Description:

1. **Opening paragraph** — one or two sentences: integrate/build X so users can Y without Z
2. **Problem / today state** — what happens now and why it is painful
3. **Proposed solution** — what the epic delivers at a high level
4. **Platform rationale** (when relevant) — why this product/system vs alternatives the user named (e.g. console vs CLI)
5. **Relationship to parent epic** (when parent exists) — one short paragraph: this epic’s slice of the parent initiative; do not repeat the full parent description
6. **End-to-end flow** — numbered list of user + system steps

Optional short subheading before the flow: `### End-to-end flow`

---

## WHAT (opening + solution)

State clearly:

- The **outcome** (feature, integration, capability)
- **Where** it lives (which app, route, or surface)
- **What replaces or improves** current behavior (CLI, docs-only, manual steps)

**Weak:** "Integrate the wizard."

**Strong:** "Integrate the ROSA HCP cluster creation wizard into the ACM console so users can create AWS ROSA Hosted Control Plane clusters entirely within the UI."

---

## WHY (problem + platform rationale)

Include:

- **User pain** — leaving the UI, missing guidance, error-prone manual steps
- **Product benefit** — faster creation, validation, preselected options, fewer support issues
- **Why this system** — when user explained it (e.g. auto-connect to hub, governance, lifecycle)

Use a dedicated paragraph or bullets for "why ACM" / "why not alternative" when the user provided that reasoning.

---

## Parent and related epics ([JIRA.md](../JIRA.md))

When a **parent epic** was fetched:

- Align opening and WHY with the parent’s intent — this epic should read as a coherent **slice**, not a duplicate
- Prefer the parent’s release or customer framing when this epic did not restate it
- Optional one paragraph under proposed solution: how this epic contributes to the parent outcome

When **related epics** exist:

- Do not claim scope owned by a related epic
- Mention coordination in flow or a brief note only when dependency affects this epic’s narrative (e.g. “wizard package publish tracked in FCN-200”)

Do **not** paste parent or related descriptions verbatim.

---

## End-to-end flow

Numbered steps in **user terms** (see [WRITING.md](../WRITING.md) § Plain language):

- Entry point (where the user starts — note if new)
- Preconditions (setup, account, permissions)
- Main experience (wizard, form, configuration)
- What data the user sees and where it comes from (plain terms — e.g. "account credentials", not callback names)
- What happens when they submit
- How they know it succeeded

Each step: **who** + **what** + **new vs existing** when known. **5–9 steps** typical; combine steps before adding more.

Example pattern:

```markdown
1. User opens Create cluster in ACM (new entry for ROSA HCP).
2. User reviews prerequisites and confirms setup is complete.
3. User selects or creates a service account.
4. User completes the cluster creation wizard.
5. The console loads account and region options using that service account.
6. User submits; cluster creation is queued on the hub.
7. User sees a confirmation that the cluster was submitted.
```

---

## Tone and length

- Complete sentences; **plain language** ([WRITING.md](../WRITING.md))
- No file paths, component names, or API details — those go in **Implementation notes**
- **3–5 short paragraphs** plus flow list; cut before you expand

---

## Do not

- Paste acceptance criteria into Description
- List child stories or sprint tasks
- Speculate or extrapolate beyond user input or research
- Repeat parent epic text or related epic scope

---

## Section template

```markdown
## Description

[Overall high-level description — what, why, where]

[Problem / today state]

[Proposed solution]

[Platform rationale — when applicable]

### End-to-end flow

1. …
2. …
3. …
```
