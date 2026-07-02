---
name: jira-epic-breakdown
description: >-
  Breaks a Jira epic into logical child work items with recommended type (from
  jira-acceptance-criteria-check/JIRA_TYPE rubrics), summary, dependencies, and paste-ready
  ticket bodies. Runs jira-acceptance-criteria-check-style review on drafts before delivery and flags items
  needing human review. Always prints the full breakdown to chat before asking
  whether to create child items in Jira (MCP only) or do nothing. Spikes file as Stories with Spike in the title; all
  children set parent to the epic. Uses jira-acceptance-criteria-check type definitions
  and templates. Fetches epic from Jira or uses pasted epic text. Use when the
  user asks to break down, decompose, or split an epic into stories, tasks, spikes,
  or child tickets.
user-invocable: true
---

# Break down epic

Decompose one **epic** into child Jira items with the correct **type** (from [JIRA_TYPE/](../jira-acceptance-criteria-check/JIRA_TYPE/README.md) rubrics), **order**, and **paste-ready bodies**. **Review every draft** before showing output ([REVIEW.md](REVIEW.md)). **Jira access:** MCP only ([JIRA.md](JIRA.md)) — no `acli`. **No Jira writes** until §7 when the user chooses to create items.

**§ numbers are stable step IDs — do not renumber when editing.**

**Default:** child items are **not** assumed to exist in Jira yet — do not search for existing children unless the user asks to dedupe ([JIRA.md](JIRA.md)).

**Writing style:** [WRITING.md](WRITING.md) — same bar as **jira-epic-create** (concise, PM-readable, no repeat, no extrapolate).

**Issue types:** [CLASSIFY.md](CLASSIFY.md) → discover types and assignment rules from **jira-acceptance-criteria-check** [JIRA_TYPE/](../jira-acceptance-criteria-check/JIRA_TYPE/README.md).

---

## Companion files

| Step | File |
|------|------|
| Writing style | [WRITING.md](WRITING.md) |
| Gather epic input | [DISCOVERY.md](DISCOVERY.md) |
| Fetch epic from Jira | [JIRA.md](JIRA.md) |
| Issue type | [CLASSIFY.md](CLASSIFY.md) · [JIRA_TYPE/](../jira-acceptance-criteria-check/JIRA_TYPE/README.md) |
| Slice the epic | [DECOMPOSE.md](DECOMPOSE.md) |
| Per-type ticket bodies | [TICKETS.md](TICKETS.md) |
| Pre-delivery draft review | [REVIEW.md](REVIEW.md) |
| Output shape | [TEMPLATE.md](TEMPLATE.md) |
| Delivery rules | [REPORT.md](REPORT.md) |
| Worked example | [EXAMPLE.md](EXAMPLE.md) |

---

## Workflow

### 1. Discover epic source

Follow [DISCOVERY.md](DISCOVERY.md).

Hold: epic **key** and/or **pasted epic body**, optional repo paths, optional constraints (team split, must-use spikes, exclude bugs).

**Ask** if no epic key and no pasted description was provided.

---

### 2. Load epic content

| Source | Action |
|--------|--------|
| Jira key | [JIRA.md](JIRA.md) — fetch description, summary, AC, parent, linked issues |
| Pasted epic | Parse sections using [jira-epic-create/TEMPLATE.md](../jira-epic-create/TEMPLATE.md) § Section registry ([JIRA.md](JIRA.md) § Parse epic description) |
| Prior **jira-epic-create** session | Use epic body from same conversation |

Extract epic AC as a checklist — every child item must **trace** to at least one epic AC (`AC` trace), **Implementation notes** boundary (`IN`), or **Test Plan** item (`TP`) per the registry.

---

### 3. Decompose

Follow [DECOMPOSE.md](DECOMPOSE.md):

1. Identify logical slices (user journey, integration layer, publish, docs/tests).
2. **Split API/data-fetch work** — one task per endpoint or wizard `Resource`; add foundation task if needed ([DECOMPOSE.md](DECOMPOSE.md) § API and data-fetch splits).
3. Assign **one type** per slice ([CLASSIFY.md](CLASSIFY.md)).
4. Set **depends on** order (sequence or parallel).
5. Draft **summary** (Jira title) per item — verb + outcome, under ~80 chars when possible.

Target **right-sized** items: **completable in one sprint**; split oversized slices (especially combined API wiring).

---

### 4. Draft ticket bodies

For each child item, follow [TICKETS.md](TICKETS.md):

- Use the **Description template** from `jira-acceptance-criteria-check/JIRA_TYPE/{slug}.md` for each item’s `classified_type` ([JIRA_TYPE/README.md](../jira-acceptance-criteria-check/JIRA_TYPE/README.md)).
- Apply [WRITING.md](WRITING.md) and [GENERAL.md](../jira-acceptance-criteria-check/GENERAL.md) (WHAT + WHY).
- **Story/task AC:** 3–6 tight bullets each; user-visible or verifiable done conditions.
- **Spike:** outcomes + scope + timebox — not story-style AC.
- **Bug:** only when epic describes **broken existing behavior** — repro + expected + actual.

Do **not** create bug items for net-new feature work.

---

### 5. Review drafts (before delivery)

**Default — always run** unless the user asked for **breakdown only** ([DISCOVERY.md](DISCOVERY.md)).

Follow [REVIEW.md](REVIEW.md):

1. Classify and score each draft (jira-acceptance-criteria-check rubrics, synthetic input).
2. Revise weak drafts from epic context when possible.
3. Build the **Review flags** table — flag items needing human review.

Do **not** print the breakdown to chat until this step completes.

---

### 6. Assemble and deliver (mandatory — always show the user)

**Always post the full breakdown in chat** before any Jira question or write. The user must be able to read every suggested item — table, coverage, review flags, and ticket bodies — before deciding whether to file in Jira.

Follow [TEMPLATE.md](TEMPLATE.md) and [REPORT.md](REPORT.md):

1. **Breakdown table** — all items with type, summary, depends-on, epic AC trace.
2. **Epic AC coverage**
3. **Review flags** — ready vs needs human review ([REVIEW.md](REVIEW.md))
4. **Ticket bodies** — paste-ready section per item (revisions applied; or summary-only if user asked for titles only)

Run [TEMPLATE.md](TEMPLATE.md) § Quality check before sending.

**Do not** skip this step, summarize it away, or jump to §7 with only a count or title list. **Do not** create Jira issues in the same turn as delivery.

---

### 7. Jira next step (mandatory — only after §6 is in chat)

**Only after** the full §6 breakdown is posted in the message, ask what the user wants to do with the child items. Prefer **AskQuestion** when available — but **never** call AskQuestion (or any §7 prompt) **without** the complete §6 content in the same message above it.

> **What would you like to do with these work items?**
> 1. **Create them in Jira** under the epic (MCP)
> 2. **Do nothing right now** — keep the breakdown in chat for manual filing later

Wait for the user's choice before creating issues.

| Choice | Action |
|--------|--------|
| **Create in Jira** | Follow [JIRA.md](JIRA.md) § Write. **Epic key** must be known — if not, **stop and ask** before any create. Create each item in suggested order; set **parent** to the epic on every issue. |
| **Do nothing** | Acknowledge briefly. Do not create issues. |

#### Epic key (create path)

The epic being broken down must have a Jira **key** before creating children.

| Known | Unknown → ask |
|-------|----------------|
| User gave epic key at discovery or in prompt | Breakdown used pasted epic only — no key in thread |
| Epic key from same-thread **jira-epic-create** Jira write | User chose create but key never stated |

Do **not** create children without a confirmed epic key.

#### Spikes in Jira

Planning type **spike** → Jira **`Story`** with **`Spike`** in the summary (e.g. `Spike: Compare subnet validation APIs`). Body still uses the spike template ([TICKETS.md](TICKETS.md), [SPIKE.md](../jira-acceptance-criteria-check/JIRA_TYPE/SPIKE.md)).

---

## Optional follow-ups (only when asked — after §7 resolves)

- Run **jira-acceptance-criteria-check** on Jira keys after tickets are created
- Re-run breakdown after epic edits
- Dedupe against existing children — only when user asks ([JIRA.md](JIRA.md) § Existing children)

---

## Anti-patterns

Workflow violations (skipping §6/§7, AskQuestion without breakdown, creating without epic key, spike as Jira Spike type, using `acli`) → see §6, §7, and [JIRA.md](JIRA.md) § Write.

**Content and slicing:**

- One giant story that mirrors the entire epic
- **One task that wires all API/data fetches** when endpoints are independent or combined scope exceeds one sprint ([DECOMPOSE.md](DECOMPOSE.md) § API and data-fetch splits)
- Task items that are single-file chores with no clear deliverable
- Spikes disguising deliverable feature work
- Bug items for missing features (net-new work → story)
- Child AC that copy-pastes the full epic flow
- Items with no trace to epic AC, Test Plan, or Implementation notes
- Re-slicing work listed in epic **Out of scope**
- Inventing scope not in the epic
- Verbose ticket bodies ([WRITING.md](WRITING.md))
