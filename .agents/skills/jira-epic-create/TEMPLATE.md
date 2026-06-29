# Epic output template

Assemble sections in **Section registry** order. Use each guide file’s **Heading** value **verbatim** so Jira paste and **jira-epic-breakdown** parsing stay consistent.

---

## Section registry

**Authoritative list of epic sections.** To add or remove a section, edit this table and the matching file in [SECTIONS/](SECTIONS/) — see [SECTIONS/README.md](SECTIONS/README.md). No changes to [SKILL.md](SKILL.md) are required.

| Order | Heading | Guide | Required |
|-------|---------|-------|----------|
| 1 | Description | [SECTIONS/DESCRIPTION.md](SECTIONS/DESCRIPTION.md) | yes |
| 2 | Acceptance criteria | [SECTIONS/ACCEPTANCE_CRITERIA.md](SECTIONS/ACCEPTANCE_CRITERIA.md) | yes |
| 3 | Mockups/Design | [SECTIONS/MOCKUPS_DESIGN.md](SECTIONS/MOCKUPS_DESIGN.md) | yes for UI changes |
| 4 | Out of scope | [SECTIONS/OUT_OF_SCOPE.md](SECTIONS/OUT_OF_SCOPE.md) | yes |
| 5 | Test Plan | [SECTIONS/TEST_PLAN.md](SECTIONS/TEST_PLAN.md) | yes |
| 6 | Implementation notes | [SECTIONS/IMPLEMENTATION_NOTES.md](SECTIONS/IMPLEMENTATION_NOTES.md) | no |
| 7 | More information needed | [SECTIONS/MORE_INFORMATION_NEEDED.md](SECTIONS/MORE_INFORMATION_NEEDED.md) | no |

**Required** meanings:

| Value | Completeness gate |
|-------|-------------------|
| **yes** | All facts for this section must be resolved before drafting — no placeholders |
| **yes for UI changes** | Required when the epic changes UI; otherwise N/A or omit |
| **no** | Omit the section when empty; deferrals go here only per [SECTIONS/MORE_INFORMATION_NEEDED.md](SECTIONS/MORE_INFORMATION_NEEDED.md) |

Each guide’s **Section metadata** defines **Discovery**, **Breakdown trace**, **Owns**, and **Length target**.

---

## Template

Paste-ready skeleton — headings must match the registry:

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

---

## Acceptance criteria

- [ ] …
- [ ] …
- [ ] …

---

## Mockups/Design

[FIGMA DESIGNS MANDATORY!!!(for UI changes at discretion)]

---

## Out of scope

- …
- …

---

## Test Plan

- …
- …

---

## Implementation notes

- …
- …

---

## More information needed

- …
- …
```

Use horizontal rule `---` between major sections when pasting into Jira improves readability (optional).

---

## Quality check

### Gate (before any epic delivery)

- [ ] **Discovery gate passed** — parent and related each resolved (keys or explicit “none”) **in this thread**
- [ ] **Completeness gate passed** — every fact in each **Required: yes** registry section traced to user, Jira, or verified research ([DISCOVERY.md](DISCOVERY.md) § Completeness gate)
- [ ] If any gate failed, response was **discovery-only** — no registry section headings in that turn
- [ ] **No placeholders** in required sections — no `(add …)`, no invented URLs or CRD lists

### Content (after gate passes)

Before delivering, verify [WRITING.md](WRITING.md) § Before delivering — writing pass, then:

- [ ] **Concise** — no filler; length within each section’s **Length target**
- [ ] **No repeat** — each fact in one section only (see each guide’s **Owns** / **Does not own**)
- [ ] **No extrapolate** — only user input, Jira hierarchy, verified research
- [ ] **PM-readable** — Description and AC understandable without engineering context
- [ ] Description answers **what**, **why**, and **why this system** (if applicable)
- [ ] Parent/related resolved in discovery; fetched content synthesized (not pasted)
- [ ] Scope does not duplicate parent or related epics without explicit boundaries
- [ ] **Out of scope** lists exclusions explicitly — not buried in Description
- [ ] **UI epics** include Figma link in Mockups/Design or were flagged in discovery
- [ ] Flow is numbered and covers entry → submit → terminal state
- [ ] AC describes each in-scope piece/item — outcomes, not a second flow
- [ ] **Test Plan** covers user flows, integration, errors, and auth when applicable
- [ ] **Implementation notes** stay high level when present
- [ ] **More information needed** lists only genuine open questions — not a substitute for skipping discovery
- [ ] No invented behavior, APIs, or dates
- [ ] Prose is **paste-ready** — user can copy into Jira without filling gaps in required sections

---

## Chat delivery

**Discovery-only turn** (gate not passed):

- No registry section headings in the response
- Acknowledge + questions only ([DISCOVERY.md](DISCOVERY.md) § Discovery-only response shape)

**Draft turn** (all gates passed):

- Deliver the full template body in chat (not wrapped in an outer code fence)
- Optional brief intro: "Epic description for [working title]:"
- Optional **context line** when parent/related epics exist ([JIRA.md](JIRA.md))
- **No** trailing “placeholders to confirm” footer — unresolved items belong in **More information needed** only when the user explicitly deferred or a question remains after drafting
- **Then** mandatory §6 Jira next-step ask ([SKILL.md](SKILL.md) §6) — update existing, create new, or do nothing
