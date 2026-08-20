# jira-epic-breakdown

A Fleet **agent skill** that decomposes a **Jira epic** into child work items — type, summary, dependencies, and **paste-ready ticket bodies** — with jira-acceptance-criteria-check-style review before delivery. Prints the full breakdown in chat, then asks whether to create children in Jira (MCP only) or do nothing.

Use when an epic is ready to slice into stories, tasks, spikes, or bugs — not when you still need to draft the epic.

---

## Requirements

### Atlassian Jira MCP

| Capability | MCP required? | Fallback |
|------------|---------------|----------|
| Break down from **pasted** epic text | **No** | — |
| Fetch epic from Jira | **Yes** | Paste epic manually if MCP unavailable |
| **Create** child issues under the epic (after you choose §7) | **Yes** | None — all Jira access is **MCP only** |

**Primary workflow:** discover epic → decompose → review drafts → deliver full breakdown in chat → ask whether to create in Jira or do nothing.

You can run the full breakdown flow **without MCP** if you paste the epic body and choose **do nothing** at the Jira step. MCP is **required** when you give an epic **key** (fetch) or choose **Create in Jira** at §7 — there is no `acli` fallback.

**Setup (when using Jira fetch or creates):**

1. Enable the **Atlassian MCP server** in the host's MCP settings.
2. Complete auth when prompted (re-authenticate the Atlassian MCP server).
3. Confirm Jira MCP tools are available — **prefer** Fleet-standard `mcp__jira-mcp-server__*`; on Cursor, **fallback** to bare tool names on `user-atlassian-mcp-server` (see [CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) § MCP transport).

Without MCP, the agent can still break down from pasted text; failed fetch → ask you to paste the epic or fix auth.

---

## What it does

The agent follows [SKILL.md](SKILL.md) in order:

1. **Discover epic source** — Jira key and/or pasted epic body; optional repo paths and constraints ([DISCOVERY.md](DISCOVERY.md)).
2. **Load epic content** — fetch via MCP or parse pasted markdown using [jira-epic-create/TEMPLATE.md](../jira-epic-create/TEMPLATE.md) § Section registry ([JIRA.md](JIRA.md)).
3. **Decompose** — logical slices, API/data-fetch splits, dependencies, sprint-sized items ([DECOMPOSE.md](DECOMPOSE.md)).
4. **Classify type** — one `classified_type` slug per item from [jira-acceptance-criteria-check/JIRA_TYPE/](../jira-acceptance-criteria-check/JIRA_TYPE/README.md) ([CLASSIFY.md](CLASSIFY.md)).
5. **Draft ticket bodies** — per-type templates from JIRA_TYPE guides ([TICKETS.md](TICKETS.md), [WRITING.md](WRITING.md)).
6. **Review drafts** — score and revise before delivery; flag items needing human review ([REVIEW.md](REVIEW.md)). Skipped only when you ask for **breakdown only**.
7. **Deliver** — **always** post the full breakdown in chat: table, epic AC coverage, review flags, and ticket bodies ([TEMPLATE.md](TEMPLATE.md), [REPORT.md](REPORT.md)).
8. **Jira next step** — ask: **Create in Jira** or **Do nothing**. Creates use **MCP only**; every child gets **parent** = epic key.

**Discovery-only turns** happen when no epic key and no pasted description — the agent asks and does **not** decompose until you reply.

**Hard rules:**

- Every child item must **trace** to epic AC (`AC`), Implementation notes (`IN`), or Test Plan (`TP`) — not Out of scope.
- Spikes file as Jira **`Story`** with **`Spike`** in the summary — not the Jira Spike issuetype.
- **Epic key required** before creating children — ask if unknown.
- **No Jira writes** in the same turn as delivery.

---

## How to use it

### Install the skill

Install per host (see [Host compatibility](../jira-acceptance-criteria-check/CONVENTIONS.md#host-compatibility)):

| Host | Install path |
|------|--------------|
| **Fleet repo** | `skills/jira-epic-breakdown/` — run `make install-opencode`, `make install-claude`, or `make install-cursor` from [agentic-sdlc](https://github.com/OpenShift-Fleet/agentic-sdlc) |
| **OpenCode** | `~/.config/opencode/skills/jira-epic-breakdown/` |
| **Cursor** | `~/.cursor/skills/jira-epic-breakdown/` or `.cursor/skills/jira-epic-breakdown/` in the project |
| **Claude Code** | Fleet plugin via `make install-claude` (skills ship in the plugin) |

Ensure **Atlassian MCP** is configured when using Jira fetch or writes (see [Requirements](#requirements) where present).

### Trigger the skill

Ask the agent to run the skill — for example:

- “Break down epic <PROJECT>-123 into stories and tasks”
- “Decompose this epic — [paste Description + Acceptance criteria]”
- “Split <PROJECT>-456; frontend/backend split, no spikes”
- “Break down only — table and bodies, skip review” (skips draft review step)

The skill is **user-invocable** (`SKILL.md` frontmatter). The description helps the agent auto-select it for epic decomposition tasks.

### What to have ready

| Input | When |
|-------|------|
| **Epic key** or **pasted epic** (Description + AC minimum) | Always — agent asks if neither |
| **Epic key** (confirmed) | Required before **Create in Jira** at §7 |
| **Repo paths** | Optional — sharper task boundaries |
| **Constraints** | Optional — team split, “spike first”, exclude bugs/spikes |
| **Dedupe existing children** | Only when you ask — not run by default |

### Epic from the same session

If you just ran [jira-epic-create](../jira-epic-create/SKILL.md) in the same thread, the agent uses that epic body without re-asking. If jira-epic-create also wrote to Jira, the epic key carries forward for §7 creates.

### After delivery

The agent asks what to do with the child items:

| Choice | Behavior |
|--------|----------|
| **Create in Jira** | MCP `mcp__jira-mcp-server__createJiraIssue` per item in suggested order; parent = epic |
| **Do nothing** | Breakdown stays in chat for manual filing |

Optional follow-ups (only if **you** ask in a later turn):

- [jira-acceptance-criteria-check](../jira-acceptance-criteria-check/SKILL.md) — score created tickets
- Re-run breakdown after epic edits
- Dedupe against existing children ([JIRA.md](JIRA.md) § Existing children)

---

## Output shape

Each delivery includes ([TEMPLATE.md](TEMPLATE.md)):

1. **Header** — epic key/link, item count, suggested order
2. **Breakdown table** — type, summary, depends-on, epic trace (AC1, IN, TP, …)
3. **Epic AC coverage** — every AC mapped to item numbers
4. **Review flags** — ready vs needs human review (unless **breakdown only**)
5. **Ticket bodies** — paste-ready markdown per item

---

## Directory layout

```
jira-epic-breakdown/
├── SKILL.md              # Orchestrator — workflow and gates
├── README.md             # This file
├── DISCOVERY.md          # Epic input and constraints
├── JIRA.md               # MCP-only fetch and creates; parse registry sections
├── DECOMPOSE.md          # Slicing heuristics (journeys, API splits, sizing)
├── CLASSIFY.md           # Issue type assignment → JIRA_TYPE rubrics
├── TICKETS.md            # Per-type body drafting
├── REVIEW.md             # Pre-delivery draft review (jira-acceptance-criteria-check style)
├── TEMPLATE.md           # Chat output shape + quality check
├── REPORT.md             # Delivery rules (full breakdown before §7 ask)
└── WRITING.md            # Prose rules (same bar as jira-epic-create)
```

**External dependencies** (not in this folder):

| Path | Role |
|------|------|
| [jira-epic-create/TEMPLATE.md](../jira-epic-create/TEMPLATE.md) | Epic section registry — parser for fetched/pasted epics |
| [jira-acceptance-criteria-check/JIRA_TYPE/](../jira-acceptance-criteria-check/JIRA_TYPE/README.md) | Type definitions, classify rubrics, ticket templates |
| [jira-acceptance-criteria-check/GENERAL.md](../jira-acceptance-criteria-check/GENERAL.md) | WHAT + WHY for all ticket types |

---

## How to modify it

### Orchestration (edit carefully)

These files define workflow gates and delivery order:

- `SKILL.md` — step sequence, anti-patterns, §6/§7 rules
- `REPORT.md`, `TEMPLATE.md` — mandatory delivery shape
- `DISCOVERY.md`, `JIRA.md` — input and fetch/write transport

### Customize decomposition behavior

| What to change | Where | Why |
|----------------|-------|-----|
| **Slicing rules** (API splits, sprint sizing) | [DECOMPOSE.md](DECOMPOSE.md) | How work is cut — not what Jira types mean |
| **Prose style** | [WRITING.md](WRITING.md) | Concise, PM-readable ticket bodies |
| **Draft review bar** | [REVIEW.md](REVIEW.md) | Pre-delivery scoring and flags |
| **Epic sections parsed** | [jira-epic-create/TEMPLATE.md](../jira-epic-create/TEMPLATE.md) § Section registry | Headings and **Breakdown trace** codes (`AC`, `IN`, `TP`, …) |
| **Issue type definitions** | [jira-acceptance-criteria-check/JIRA_TYPE/](../jira-acceptance-criteria-check/JIRA_TYPE/README.md) | What story/task/bug/spike mean; ticket templates |
| **Classify logic** | [jira-acceptance-criteria-check/JIRA_TYPE/CLASSIFY.md](../jira-acceptance-criteria-check/JIRA_TYPE/CLASSIFY.md) | How types are chosen |

**Example — epic adds a new traceable section:**

1. Add the section in [jira-epic-create/SECTIONS/](../jira-epic-create/SECTIONS/) and the registry with a **Breakdown trace** code.
2. **jira-epic-breakdown** picks it up automatically via [JIRA.md](JIRA.md) § Parse epic description — no parser edit unless you introduce a new trace code.

**Example — team redefines “task” vs “story”:**

Edit the type rubrics under `jira-acceptance-criteria-check/JIRA_TYPE/` — not `jira-epic-breakdown/CLASSIFY.md` (that file delegates to JIRA_TYPE).

---

## Related skills

| Skill | Relationship |
|-------|----------------|
| [jira-epic-create](../jira-epic-create/SKILL.md) | Upstream — draft epic; same-thread handoff; section registry is the parser source |
| [jira-acceptance-criteria-check](../jira-acceptance-criteria-check/SKILL.md) | Shared JIRA_TYPE rubrics; optional follow-up after tickets are filed |
| [jira-get-estimates](../jira-get-estimates/SKILL.md) | Optional — size child items from historical cycle time |
| [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) | Shared paths, MCP rules, skill index |

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| Agent asked create/do-nothing without showing items | §6 skipped — full breakdown must appear in chat first ([REPORT.md](REPORT.md)) |
| Agent tried to create without epic key | Epic key required for §7 — paste key or fetch epic first |
| Fetch or create failed | MCP required for all Jira access — no `acli` fallback; retry Atlassian MCP authentication or paste epic |
| Spike filed as wrong Jira type | Must be **Story** with `Spike` in summary ([JIRA.md](JIRA.md) § Write) |
| Bug items for missing features | Net-new work → **story**, not bug ([SKILL.md](SKILL.md) anti-patterns) |
| Child items don’t match epic sections | Registry **Heading** must match exactly — see [jira-epic-create/SECTIONS/](../jira-epic-create/SECTIONS/) |
| Out-of-scope work in breakdown | **Out of scope** has trace `—` — hard exclusion, not sliced ([JIRA.md](JIRA.md)) |
| One giant “wire all APIs” task | [DECOMPOSE.md](DECOMPOSE.md) § API and data-fetch splits |
| Epic fetch fails | MCP auth or paste epic manually |
| Wanted to skip review | Say **breakdown only** at discovery ([DISCOVERY.md](DISCOVERY.md)) |

---

*Originally created by Kim Doberstein.*
