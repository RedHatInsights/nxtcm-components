# Ticket bodies — per type

Draft paste-ready Jira bodies for each child item. Section headings must match **jira-acceptance-criteria-check** type templates (`###` headings).

---

## Common steps

For each item from [DECOMPOSE.md](DECOMPOSE.md):

1. Confirm **classified_type** ([CLASSIFY.md](CLASSIFY.md)).
2. Open `jira-acceptance-criteria-check/JIRA_TYPE/{slug}.md` for that slug — **Description template** ([JIRA_TYPE/README.md](../jira-acceptance-criteria-check/JIRA_TYPE/README.md)).
3. Apply [WRITING.md](WRITING.md) + [GENERAL.md](../jira-acceptance-criteria-check/GENERAL.md).
4. Include only sections with real content — omit empty optional sections (Out of Scope, Implementation Notes, Mock ups).

---

## Story

**Template:** [STORY.md](../jira-acceptance-criteria-check/JIRA_TYPE/STORY.md)

**Required sections:**

### Description or User Story

- Epic link line ([WRITING.md](WRITING.md))
- WHAT + WHY for **this slice** only

### Acceptance Criteria

- 3–6 testable, user-visible outcomes ([STORY.md](../jira-acceptance-criteria-check/JIRA_TYPE/STORY.md) § Acceptance criteria)
- Cover happy path + errors for **this slice**

**Optional:**

### Mock ups / Design

- Include when slice is large/complex UI; link Figma from epic **Mockups/Design** when relevant; otherwise omit or `N/A`

**Omit unless needed:** Out of Scope, Implementation Notes

---

## Task

**Template:** [TASK.md](../jira-acceptance-criteria-check/JIRA_TYPE/TASK.md)

**Required sections:**

### Description

- Epic link line
- WHAT + WHY — deliverable and reason

### Acceptance Criteria

- 3–6 verifiable done conditions ([TASK.md](../jira-acceptance-criteria-check/JIRA_TYPE/TASK.md) § Acceptance criteria)
- Observable artifacts: package version, module exists, resources created, tests pass for module

**Omit unless needed:** Out of Scope, Implementation Notes

---

## Bug

**Template:** [BUG.md](../jira-acceptance-criteria-check/JIRA_TYPE/BUG.md)

**Use rarely** in epic breakdown — only for broken **existing** behavior.

**Required sections:**

### Description

### How to reproduce

### Expected

### Actual

**No** Acceptance Criteria section for bugs ([BUG.md](../jira-acceptance-criteria-check/JIRA_TYPE/BUG.md)).

---

## Spike

**Template:** [SPIKE.md](../jira-acceptance-criteria-check/JIRA_TYPE/SPIKE.md)

**Required sections:**

### Description

- What will be learned and why now

### Outcomes

- Artifacts/decisions that unblock follow-up stories/tasks — **not** user-facing AC

### Scope and boundaries

- **In scope:** / **Out of scope:**

### Timebox

- Explicit limit (e.g. 2 days, 8 hours)

**No** Acceptance Criteria section for spikes.

**Jira filing:** planning type **spike** → create as **Story** with **`Spike`** in the summary ([JIRA.md](JIRA.md) § Write). Draft the spike body here; prefix the summary line when decomposing if needed ([DECOMPOSE.md](DECOMPOSE.md) § Summary line).

---

## Formatting

- Use `*` bullets for lists; nest with 2 spaces when grouping related AC ([DRAFT.md](../jira-acceptance-criteria-check/DRAFT.md))
- Match template **`###` heading** text exactly for Jira paste consistency
- Do not wrap entire ticket in an outer code fence in chat delivery — use headings in normal markdown

---

## Do not

- Copy epic AC wholesale into every child
- Add story AC to spikes or bugs
- Invent mockups, repro steps, or timeboxes not implied by epic
