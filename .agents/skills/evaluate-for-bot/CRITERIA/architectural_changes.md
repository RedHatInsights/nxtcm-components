# Architectural changes — bot suitability

Apply when evaluating criterion slug **architectural_changes** (this file).

## Criterion metadata

| Field | Value |
|-------|-------|
| **Slug** | `architectural_changes` |
| **Definition** | Whether the work can be completed **within existing architectural patterns** without requiring fundamental design decisions or structural changes to system architecture. |
| **Weight hint** | Requiring **significant architectural changes** caps holistic score at **3**. Requiring **fundamental redesign** caps at **2**. |

Requires [REPO.md](../REPO.md) research unless **ticket-only mode** ([DISCOVERY.md](../DISCOVERY.md)) — then infer cautiously from ticket text and note reduced confidence.

---

## What to look for

Use repo findings from [REPO.md](../REPO.md) plus ticket description to assess architectural impact.

| Signal | Fits existing architecture | Requires architectural changes |
|--------|----------------------------|-------------------------------|
| **Pattern usage** | Follows established patterns in codebase | Introduces new patterns or paradigms |
| **Dependencies** | Uses existing dependencies/frameworks | Requires new framework integration |
| **Data flow** | Fits current data/state management | Needs new state architecture or data modeling |
| **System boundaries** | Works within one subsystem | Crosses or creates new system boundaries |
| **Design decisions** | Clear implementation path from ticket | Multiple valid architectural approaches requiring judgment |
| **Abstraction level** | Surface-level feature or fix | Changes to core abstractions or interfaces |
| **Integration** | Extends existing integrations | Introduces new third-party service integration |

---

## Distinction from blast radius

**Blast radius** measures breadth of change (how many files/systems touched).  
**Architectural changes** measures depth of structural impact (how fundamental the design decisions are).

| Scenario | Blast radius | Architectural changes |
|----------|--------------|----------------------|
| Add validation to 20 similar forms | Large (many files) | Small (same pattern everywhere) |
| Replace authentication approach | Large (many files) | Large (fundamental design change) |
| New API endpoint following existing pattern | Small (few files) | Small (uses existing architecture) |
| Introduce new state management for one feature | Small (localized) | Large (new architectural pattern) |

A change can have **small blast radius but large architectural impact** (e.g., switching from REST to GraphQL in one isolated module) or **large blast radius but small architectural impact** (e.g., renaming a widely-used utility function).

---

## Scoring

Rate **architectural change requirement** from 1–5 (higher = **less architectural change** — better for bot success).

### Weak vs strong

| Rating | Signals |
|--------|---------|
| **5** | Purely additive work following clear existing patterns; no design decisions needed; established conventions to copy. |
| **4** | Minor pattern extension or adaptation; existing architecture accommodates the work with obvious adjustments. |
| **3** | Some architectural judgment required but bounded (e.g., choosing between 2 established patterns in codebase, or minor abstraction introduction). |
| **2** | Significant architectural decisions needed; multiple valid approaches; may introduce new patterns or require refactoring existing ones. |
| **1** | Fundamental redesign or greenfield architecture; requires cross-system design; introduces new paradigms or frameworks. |

### Calibration examples

| Rating | Example |
|--------|---------|
| **5** | Add new field to existing form using established form library patterns; add new endpoint following exact REST conventions already present. |
| **4** | Create new React component type that extends existing component library architecture; add new database table following established schema patterns. |
| **3** | Implement caching layer where similar patterns exist but require adaptation; choose between two existing state management approaches based on use case. |
| **2** | Replace synchronous process with async/queue-based architecture; introduce new authentication mechanism requiring integration design. |
| **1** | Migrate from monolith to microservices; design new real-time data sync architecture; choose and integrate new frontend framework. |

---

## Ticket-only mode

When repo was **not** searched:

- Do not rate **5** (cannot verify existing patterns exist).
- Rate from ticket cues:
  - Keywords like "redesign", "new approach", "evaluate options", "prototype" → likely **≤ 3**
  - "Following X pattern", "like we did in Y" → likely **≥ 4**
- Set `repo_confidence: none` in notes.
- Say **repo not searched** in report architectural-changes line.

---

## Reporting

When this criterion rates **≤ 3** due to architectural changes required, include in `blockers` ([REPORT.md](../REPORT.md)):
- ✓ "Requires architectural decision: choosing between REST and GraphQL for new API"
- ✓ "Introduces new pattern: event-driven architecture not currently used in codebase"
- ✓ "Needs framework integration: selecting and integrating payment processor"
- ✗ "architecture concerns" (too vague)

When this criterion rates **≥ 4**, consider including in `bot_strengths`:
- ✓ "Clear architectural fit: extends existing form validation patterns"
- ✓ "Well-established pattern: follows component library conventions"

---

## Related

- Blast radius assessment: [blast_radius.md](blast_radius.md)
- Repo search steps: [REPO.md](../REPO.md)
