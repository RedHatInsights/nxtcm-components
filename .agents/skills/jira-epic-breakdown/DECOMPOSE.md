# Decompose — slice the epic

Turn one epic into **multiple child items** that together cover epic AC without overlap or gaps.

---

## Principles

| Principle | Meaning |
|-----------|---------|
| **Cover the epic** | Every epic AC maps to ≥1 child item |
| **Respect Out of scope** | Never slice work the epic explicitly excluded ([JIRA.md](JIRA.md)) |
| **No gaps** | Union of child scopes completes the epic |
| **Minimal overlap** | One owner per slice; use **depends on** instead of duplicating AC |
| **Right size** | **One sprint or less per item** — split anything larger ([§ Sprint-sized items](#sprint-sized-items)) |
| **Parallel when independent** | Separate items when chunks can be built or merged without blocking each other |
| **Sequence honestly** | Publish package before integrate; prerequisites before wizard; submit before confirmation |

---

## Slicing strategies

Use one or combine — pick what matches the epic:

### 1. User journey (common for UI epics)

One story per major step:

- Entry / navigation
- Prerequisites gate
- Account or credential selection
- Main experience (wizard, form)
- Submit / handoff
- Confirmation / completion

Merge tiny adjacent steps (e.g. entry + nav) when one story is cleaner.

Use **Mockups/Design** links in child story bodies when the epic supplies Figma for that slice.

### 2. Layer (common for integration epics)

| Layer | Typical type |
|-------|----------------|
| Shell UI (routes, layout, gates) | story |
| Shared library publish / version | task |
| Integration foundation (shared client, auth, callback shape) | task — one small item when many endpoints follow |
| **Per API / data source** | task — **one item per endpoint** ([§ API and data-fetch splits](#api-and-data-fetch-splits)) |
| Submit / persistence | task |
| Docs / E2E harness | task — trace to **Test Plan** when epic lists them |

### 2b. API and data-fetch splits

When the epic wires **multiple backend calls** (REST, GraphQL, fetches, etc.):

**Do not** combine all API wiring into one task if:

- The combined work would **not finish in one sprint**, or
- **Independent chunks** can be implemented and merged separately (different endpoints, wizard fields, or domains)

**Do:**

1. Identify each **distinct fetch or API** from epic AC, **Implementation notes**, or integration contract (e.g. OpenAPI, props types).
2. Create **one task per fetch/API** (or per tight group only when truly inseparable in one PR).
3. Add a **foundation task** first when shared code is needed (auth header, base client, `Resource` wrapper, error mapping) — keep it sprint-sized; do not hide endpoint work in foundation.
4. Mark **depends on** only for real ordering — parallel API tasks after foundation when safe.
5. Trace each API task to the same epic AC (e.g. AC5) — coverage is by **union** of items.

**Naming:** `Wire <data> for <feature>` — e.g. `Wire regions OCM API for ROSA HCP wizard`.

**Anti-pattern:** One task titled “Wire all OCM API data” covering 8+ endpoints.

**Research:** When repo paths are named in **Implementation notes**, read the integration contract ([RESEARCH.md](../jira-epic-create/RESEARCH.md)) for the full fetch list before decomposing.

### 3. Out-of-scope boundary

When epic **Out of scope** lists related work or exclusions, **do not** re-slice owned scope:

- Skip child items for excluded work entirely
- Note `Excluded — epic Out of scope (FCN-200)` in report optional notes when helpful
- This epic’s items only cover its AC

### 4. Test Plan → tasks

When epic **Test Plan** lists verification areas not fully covered by feature stories/tasks:

- One integration/e2e **task** at end when epic implies harness or automated coverage
- Trace as `TP` (Test Plan) in breakdown table
- Do not duplicate every Test Plan bullet as its own ticket — group by test layer

### 5. Spike first (only when needed)

Add a spike **only** when **More information needed**, **Implementation notes**, or AC block estimation:

- Place **before** dependent stories/tasks in suggested order
- Spike outcomes name the follow-up tickets it unblocks
- Trace as `MIN` when driven by open questions

---

## Sprint-sized items

Every child item should be **completable within one sprint** by a developer (or pair).

| Signal to split | Action |
|-----------------|--------|
| More than **~3–5 verifiable AC bullets** and multiple subsystems | Split by journey step, layer, or API |
| Epic AC says “wire all X” but lists **many data sources** | One task **per API/fetch** ([§ API and data-fetch splits](#api-and-data-fetch-splits)) |
| Description would need “and also … and also …” for unrelated deliverables | Separate items |
| Item mixes UI + many backend integrations | Story for UI; tasks for each integration chunk |
| Two engineers could work in parallel without conflict | Should usually be two items |

**Merge** only when pieces are tiny, inseparable, or ship as one atomic UX step (e.g. entry route + page title).

---

## What not to split out

| Avoid | Instead |
|-------|---------|
| One AC per microscopic ticket | Group related AC into one shippable item |
| **One mega-task for all API calls** | **One task per endpoint/fetch** when sprint-sized or parallel ([§ API and data-fetch splits](#api-and-data-fetch-splits)) |
| "Write unit tests" alone | Fold into story/task AC as one bullet, or one integration test task traced to Test Plan |
| Per-component file tickets | One integration task per **API/resource**, not per source file |
| Duplicate prerequisites + wizard if one team ships both | Single story with nested AC |
| Tickets for **Out of scope** items | Skip — note exclusion in report |

---

## Dependencies

Record **depends on** as item numbers or summaries:

- Hard: B cannot start until A merges (package published, API module exists)
- Soft: B should follow A (confirmation after submit) — note in order, optional depends-on

Parallel when no shared blocker (e.g. docs task + UI story after integration API exists; **multiple API tasks** after foundation lands).

---

## Summary line (Jira title)

Pattern: **`<Verb> <outcome> [context]`**

Examples:

- `Add ROSA HCP cluster creation route in ACM`
- `Publish nxtcm-rosa-hcp-wizard for ACM consumption`
- `Wire regions OCM API for ROSA HCP wizard`

Avoid: `ROSA HCP work`, `Wizard part 2`, `Implement ticket`, **`Wire all OCM API data`** (split per [DECOMPOSE.md](DECOMPOSE.md) § API and data-fetch splits).

**Spikes:** summary **must include** `Spike` — e.g. `Spike: Confirm CRD set with platform team`. Jira type is **Story**, not Spike ([CLASSIFY.md](CLASSIFY.md), [JIRA.md](JIRA.md) § Write).

---

## Trace to epic

For each child item, list trace codes in the breakdown table:

| Code | Source |
|------|--------|
| `AC1`, `AC2`, … | Epic acceptance criteria |
| `IN` | Implementation notes (release coordination, repo boundary) |
| `TP` | Test Plan |
| `MIN` | More information needed → spike only |

Every epic **AC#** must appear on ≥1 row. **Out of scope** items must **not** appear.

---

## Item count guidance

| Epic size | Typical child count |
|-----------|---------------------|
| Narrow (single screen) | 2–4 |
| Medium (integration + UI) | 5–10 |
| Large (multi-team, **or per-API split**) | 10–20 |

More than 20 → confirm epic scope or move work to related epics. **Per-API splits intentionally exceed 12** when the integration contract lists many fetches.

---

## Hand off

Produce ordered list with: `#`, `type`, `summary`, `depends on`, `traces`, one-line **why this slice** (internal, optional in table).

Pass to [TICKETS.md](TICKETS.md) for full bodies.
