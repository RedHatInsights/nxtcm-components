# jira-acceptance-criteria-check

A Fleet **agent skill** that classifies Jira work items by type, scores description and type-specific content 1–5, drafts suggested ticket content for low scores, and reports **Ready** / **Needs review** / **Needs Refinement**. One issue → chat; two or more → markdown file. Optionally posts Needs review drafts to Jira via MCP.

Use before sprint planning or backlog grooming — not a one-off “looks fine” pass.

## Requirements

### Atlassian Jira MCP (required)

This skill **requires** the **Atlassian MCP server** (Atlassian MCP server) to be enabled and authenticated in the agent host.

| Capability | MCP required? |
|------------|---------------|
| Fetch issues (keys or JQL) | **Yes** ([JIRA.md](JIRA.md)) |
| Post suggestion comments after the report | **Yes** ([POST_JIRA.md](POST_JIRA.md)) |
| Classify, score, draft, report | Works on fetched or pasted data once issues are in scope |

**Setup:**

1. Enable the **Atlassian MCP server** in the host's MCP settings.
2. Complete auth when prompted (re-authenticate the Atlassian MCP server).
3. Confirm Jira MCP tools are available — **prefer** Fleet-standard `mcp__jira-mcp-server__*`; on Cursor, **fallback** to bare tool names on `user-atlassian-mcp-server` (see [CONVENTIONS.md](CONVENTIONS.md) § MCP transport).

Without MCP, the skill **cannot** fetch Jira issues or post suggestions. Pasted draft bodies ([DRAFT_INPUT.md](DRAFT_INPUT.md)) can still be scored in isolation, but that is not the primary workflow.

---

## What it does

The agent follows [SKILL.md](SKILL.md) in order:

1. **Get issues** — Jira keys or JQL via **MCP only**, or synthetic/pasted drafts without Jira
2. **Classify** — discover work types from `JIRA_TYPE/` and assign the best-fit slug per ticket
3. **Score** — one holistic **1–5** per issue (description WHAT/WHY + type-specific rubric)
4. **Draft** (scores 1–3 only) — suggested ticket body sections when enough context exists; skip guessing
5. **Report** — bucket into Ready (4–5), Needs review (1–3 with draft), Needs Refinement (1–3 without draft)
6. **Post suggestions** (optional) — ask once; post Needs review drafts as Jira comments via MCP if you agree

**One issue** → full report in chat. **Two or more** → writes `jira-acceptance-criteria-check-report.md` in the workspace; chat gets a short pointer.

Type mismatch (Jira issuetype vs ticket content) is flagged as **Recommend change to \<slug\>** — scoring and drafts use the content-fit type.

---

## How to use it

### Install the skill

Install per host (see [Host compatibility](../jira-acceptance-criteria-check/CONVENTIONS.md#host-compatibility)):

| Host | Install path |
|------|--------------|
| **Fleet repo** | `skills/jira-acceptance-criteria-check/` — run `make install-opencode`, `make install-claude`, or `make install-cursor` from [agentic-sdlc](https://github.com/OpenShift-Fleet/agentic-sdlc) |
| **OpenCode** | `~/.config/opencode/skills/jira-acceptance-criteria-check/` |
| **Cursor** | `~/.cursor/skills/jira-acceptance-criteria-check/` or `.cursor/skills/jira-acceptance-criteria-check/` in the project |
| **Claude Code** | Fleet plugin via `make install-claude` (skills ship in the plugin) |

Ensure **Atlassian MCP** is configured when using Jira fetch or writes (see [Requirements](#requirements) where present).

### Trigger the skill

Ask the agent to run the skill — for example:

- “Run jira-acceptance-criteria-check on `<PROJECT>-232`”
- “Check acceptance criteria for my open stories in <PROJECT>”
- “Score these draft tickets before I create them in Jira” (paste bodies — no fetch)
- “JQL: `parent = <PROJECT>-100 AND status != Done` — acceptance criteria check”

The skill is **user-invocable** (`SKILL.md` frontmatter). The description helps the agent auto-select it for ticket-quality tasks.

### Input options

| Input | Behavior |
|-------|----------|
| Issue keys | `key in (…)` search |
| JQL | Use as-is (sanity-checked) |
| Natural language | Agent translates to JQL |
| Pasted draft bodies | Synthetic mode — no Jira fetch ([DRAFT_INPUT.md](DRAFT_INPUT.md)) |
| **jira-epic-breakdown** output | Internal review uses the same rubrics before Jira create |

After the report, if there are **Needs review** items on real Jira keys, the agent asks whether to post suggestions as comments (**yes** / **no**).

---

## Directory layout

```
jira-acceptance-criteria-check/
├── SKILL.md              # Orchestrator — workflow and companion index
├── README.md             # This file
├── JIRA.md               # Fetch issues (MCP only)
├── DRAFT_INPUT.md        # Synthetic / pasted drafts (no Jira)
├── GENERAL.md            # Cross-type description bar (WHAT + WHY)
├── SCORING.md            # How to combine into one 1–5 score
├── DRAFT.md              # Draft rules for scores 1–3
├── REPORT.md             # Output shape and buckets
├── POST_JIRA.md          # Optional MCP comment posts
└── JIRA_TYPE/            # ← customize: one rubric file per work type
    ├── README.md         # Discovery, adding types, authoritative Definition
    ├── CLASSIFY.md       # Classify orchestration (no type semantics here)
    ├── STORY.md          # Bundled default
    ├── TASK.md           # Bundled default
    ├── BUG.md            # Bundled default
    └── SPIKE.md          # Bundled default
```

---

## How to modify it

### Do not edit (orchestration)

These files are **type-agnostic**. They discover `JIRA_TYPE/` rubrics and delegate — they do **not** define what Story, Task, Bug, or Spike mean:

- `SKILL.md`
- `JIRA.md`, `DRAFT_INPUT.md`
- `GENERAL.md`, `SCORING.md`, `DRAFT.md`, `REPORT.md`, `POST_JIRA.md`
- `JIRA_TYPE/CLASSIFY.md`, `JIRA_TYPE/README.md` (orchestration within the type folder)

### Customize (your Jira practice)

| What to change | Where | Why |
|----------------|-------|-----|
| **What each type means** | `JIRA_TYPE/{TYPE}.md` → **Type metadata** → **Definition** | Teams use Story/Task differently (e.g. Story = any non-routine work, Task = routine ops). This is the **only** authoritative source for type meaning. |
| **Jira issuetype mapping** | Same file → **Jira issuetype aliases** | Map your site’s labels to each slug |
| **Ticket template & scoring** | Same file → **Description template**, **Scoring** | Section headings, rubric, calibration examples |
| **Add a type** | New `JIRA_TYPE/SUB_TASK.md` (etc.) | See [JIRA_TYPE/README.md](JIRA_TYPE/README.md) — no `SKILL.md` edit needed |
| **Remove a type** | Delete the type file | Discovery picks up the remaining set on the next run |

**Example — another team’s Story definition:** edit `JIRA_TYPE/STORY.md`:

```markdown
| **Definition** | Any non-routine deliverable work (frontend, backend, or cross-cutting). Routine maintenance belongs in Task. |
```

Orchestration files stay unchanged.

### Bundled defaults

This install ships **STORY**, **TASK**, **BUG**, and **SPIKE** rubrics tuned for one team’s practice (e.g. Story ≈ user-facing change, Task ≈ non-UI deliverable). Treat them as **starting templates** — edit **Definition** and rubrics to match your Jira project.

---

## Score scale (summary)

| Score | Bucket | Meaning |
|-------|--------|---------|
| **4–5** | Ready | Description and type-specific content are strong |
| **1–3** + draft | Needs review | Gaps identified; suggested sections provided |
| **1–3** no draft | Needs Refinement | Not enough context to suggest honestly |

Full scale and combination rules → [SCORING.md](SCORING.md). Per-type weak/strong signals live **only** in the matching `JIRA_TYPE/*.md` file.

---

## Related skills

| Skill | Relationship |
|-------|----------------|
| [jira-epic-breakdown](../jira-epic-breakdown/SKILL.md) | Decomposes epics; runs this skill’s rubrics on drafts before delivery |
| [CONVENTIONS.md](CONVENTIONS.md) | Shared paths, MCP rules, skill index |

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| Fetch fails | Atlassian MCP enabled and authenticated; retry Atlassian MCP authentication |
| No issues returned | JQL too narrow; verify keys exist and you have access |
| Post step skipped | No Needs review items, draft-only ids, or duplicate suggestion comment already on issue |
| Wrong type assigned | Edit **Definition** / **Quick signals** in the relevant `JIRA_TYPE/*.md` file |
| Comment post fails | Fix Atlassian MCP auth and retry |

---

*Originally created by Kim Doberstein.*
