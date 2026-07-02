# jira-epic-create

A [Cursor Agent Skill](https://cursor.com/docs/agent/skills) that drafts **paste-ready Jira epic descriptions** for project owners and management — from conversation, parent/related epics, and optional codebase research. Stops for discovery first; no placeholders in required sections. After delivery, asks whether to create or update in Jira (MCP only) or do nothing.

Use when you need a complete epic body — not a rough outline you still have to fill in.

---

## Requirements

### Atlassian Jira MCP

| Capability | MCP required? | Fallback |
|------------|---------------|----------|
| Draft epic in chat from your notes | **No** | — |
| Optional repo research | **No** | — |
| Fetch **parent** / **related** epics for context | **Yes** (when keys provided) | Draft from conversation; note unfetched keys in **More information needed** |
| **Create** or **update** epic in Jira (after you choose §6) | **Yes** | None — all Jira access is **MCP only** |

**Primary workflow:** discovery → draft in chat → ask whether to update Jira, create new, or do nothing.

You can run the full drafting flow **without MCP** if you supply context in chat and choose **do nothing** at the Jira step. MCP is **required** when you provide parent/related **keys** (fetch) or choose **create/update** at §6 — there is no `acli` fallback.

**Setup (when using Jira fetch or writes):**

1. Cursor → **Settings → MCP** — enable the **Atlassian** server (`user-atlassian-mcp-server`).
2. Complete auth when prompted (`mcp_auth` for `user-atlassian-mcp-server`).
3. Confirm tools such as `getJiraIssue`, `editJiraIssue`, and `createJiraIssue` are available.

Without MCP, the agent can still draft from conversation; unfetched parent/related keys are noted in **More information needed** if fetch was attempted and failed.

---

## What it does

The agent follows [SKILL.md](SKILL.md) in order (§0–§6). The README step list below groups quality-check and deliver for readability — both map to SKILL §5.

1. **Discovery gate** — ask for missing facts **before** drafting (parent/related epics, Figma for UI, scope, submit behavior, etc.). No placeholders in required sections.
2. **Context** — extract what/why/flow from conversation; optional Jira fetch for parent and related epics ([JIRA.md](JIRA.md)).
3. **Research** (optional) — explore named repos/packages when paths are given ([RESEARCH.md](RESEARCH.md)).
4. **Completeness gate** — re-check that every **Required: yes** registry section can be written without guessing.
5. **Draft** — one section at a time using [SECTIONS/](SECTIONS/) guides; assemble in [TEMPLATE.md](TEMPLATE.md) § Section registry order.
6. **Quality check** — concise, plain language, no repeat, no extrapolate ([WRITING.md](WRITING.md)).
7. **Deliver** — full epic body in chat (paste-ready markdown).
8. **Jira next step** — ask: update existing epic, create new, or do nothing. Writes use **MCP only** when you choose create/update.

**Discovery-only turns** happen when hierarchy or other required facts are missing — the agent asks questions and does **not** output an epic body until you reply.

---

## How to use it

### Install the skill

Copy this folder into a skills location Cursor reads:

| Location | Scope |
|----------|-------|
| `~/.cursor/skills/jira-epic-create/` | Personal — all projects |
| `.cursor/skills/jira-epic-create/` | Project — shared with the repo |

Enable **Atlassian MCP** when you want Jira fetch or create/update (see [Requirements](#requirements)).

### Trigger in Cursor

Ask the agent to run the skill — for example:

- “Create an epic for integrating the ROSA HCP wizard into ACM”
- “Draft a Jira epic — parent FCN-100, related FCN-200”
- “Write an epic description for [feature]; I’ll paste into Jira myself”
- “Update epic FCN-500 with this draft” (after delivery, choose update at §6)

The skill is **user-invocable** (`SKILL.md` frontmatter). The description helps the agent auto-select it for epic-drafting tasks.

### What to have ready

| Input | When |
|-------|------|
| **What** and **why** | Always — outcome and motivation |
| **End-to-end flow** | Always — entry point through done state |
| **Parent epic** key or “standalone” | Always — agent asks if not provided |
| **Related epics** keys or “none” | Always — agent asks if not provided |
| **Figma link** | UI epics — mandatory for UI changes |
| **Out of scope** | When boundaries matter — agent asks if unclear |
| **Repo paths** | Optional — sharper Implementation notes |
| **Target epic key** | When choosing **update existing** at §6 |

### After delivery

The agent asks what to do with the draft:

| Choice | Behavior |
|--------|----------|
| **Update existing** | MCP `editJiraIssue` — asks for target key if unknown |
| **Create new** | MCP `createJiraIssue` — asks for project key and summary if needed |
| **Do nothing** | Draft stays in chat for manual paste |

Optional follow-ups (only if **you** ask in a later turn):

- [jira-epic-breakdown](../jira-epic-breakdown/SKILL.md) — decompose into child stories/tasks
- [jira-acceptance-criteria-check](../jira-acceptance-criteria-check/SKILL.md) — score the draft

---

## Directory layout

```
jira-epic-create/
├── SKILL.md              # Orchestrator — workflow and gates
├── README.md             # This file
├── TEMPLATE.md           # Section registry + paste skeleton + quality check
├── WRITING.md            # Global prose rules (concise, no repeat, plain language)
├── DISCOVERY.md          # Discovery and completeness gates
├── JIRA.md               # MCP-only fetch (parent/related) and writes
├── RESEARCH.md           # Optional codebase research
├── EXAMPLE.md            # Worked two-turn example (ROSA HCP wizard)
└── SECTIONS/             # ← customize: one guide file per epic section
    ├── README.md         # Add/remove/rename sections
    ├── SECTION_SKELETON.md
    ├── DESCRIPTION.md
    ├── ACCEPTANCE_CRITERIA.md
    ├── MOCKUPS_DESIGN.md
    ├── OUT_OF_SCOPE.md
    ├── TEST_PLAN.md
    ├── IMPLEMENTATION_NOTES.md
    └── MORE_INFORMATION_NEEDED.md
```

---

## How to modify it

### Do not edit (orchestration)

These files discover sections from the registry and delegate — they do **not** define section content or headings:

- `SKILL.md`
- `DISCOVERY.md`, `WRITING.md`, `RESEARCH.md`, `JIRA.md`, `EXAMPLE.md`
- `SECTIONS/README.md` (orchestration within the section folder)

### Customize (your epic template)

| What to change | Where | Why |
|----------------|-------|-----|
| **Section order and headings** | [TEMPLATE.md](TEMPLATE.md) § **Section registry** | Authoritative list of epic sections |
| **What belongs in a section** | [SECTIONS/{NAME}.md](SECTIONS/) | Rules, discovery facts, length, breakdown trace |
| **Add a section** | New `SECTIONS/*.md` + registry row | See [SECTIONS/README.md](SECTIONS/README.md) — no `SKILL.md` edit |
| **Remove a section** | Delete registry row + guide file | Same |
| **Rename a heading** | Update **Heading** in guide metadata + registry | **jira-epic-breakdown** follows the registry automatically |
| **Required vs optional** | Registry **Required** column + guide **Required** metadata | Controls completeness gate blocking |

**Example — add a Risks section:**

1. Copy [SECTIONS/SECTION_SKELETON.md](SECTIONS/SECTION_SKELETON.md) → `SECTIONS/RISKS.md`
2. Set **Heading** to `## Risks`, **Required** to `no`, **Breakdown trace** to `—`
3. Add a row to [TEMPLATE.md](TEMPLATE.md) § Section registry
4. Add `## Risks` to the template skeleton in [TEMPLATE.md](TEMPLATE.md)

### Bundled defaults

This install ships seven sections tuned for product epics with UI, scope boundaries, and test planning. Treat them as **starting templates** — edit guides and the registry to match your team’s epic format.

Section customization details → [SECTIONS/README.md](SECTIONS/README.md).

---

## Default section registry (summary)

| Order | Heading | Required |
|-------|---------|----------|
| 1 | Description | yes |
| 2 | Acceptance criteria | yes |
| 3 | Mockups/Design | yes for UI changes |
| 4 | Out of scope | yes |
| 5 | Test Plan | yes |
| 6 | Implementation notes | no |
| 7 | More information needed | no |

Full registry and paste skeleton → [TEMPLATE.md](TEMPLATE.md).

---

## Related skills

| Skill | Relationship |
|-------|----------------|
| [jira-epic-breakdown](../jira-epic-breakdown/SKILL.md) | Parses epic bodies using this skill’s section registry; optional follow-up after delivery |
| [jira-acceptance-criteria-check](../jira-acceptance-criteria-check/SKILL.md) | Optional follow-up to score draft quality |
| [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) | Shared paths, MCP rules, skill index |

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| Agent drafted with `(add link)` placeholders | Discovery gate skipped — required facts were missing; reply to discovery questions first |
| Agent asks for parent/related before every draft | Expected — hierarchy is mandatory unless you said “standalone” / “none” |
| Parent epic fetch fails | Atlassian MCP auth; or paste parent description manually and continue |
| Fetch or create/update fails | MCP required for all Jira access — no `acli` fallback; retry `mcp_auth` |
| Agent used wrong epic key on update | Target key must be explicit — parent/related keys are context only ([SKILL.md](SKILL.md) §6) |
| **jira-epic-breakdown** missed a section | Heading must match registry exactly; see [SECTIONS/](SECTIONS/) metadata |
| UI epic blocked on Figma | Required for UI changes — paste link or confirm non-UI scope |

---

*Originally created by Kim Doberstein.*
