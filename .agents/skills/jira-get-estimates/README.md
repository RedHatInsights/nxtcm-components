# jira-get-estimates

A Fleet **agent skill** that recommends **story points** and **p75 cycle time** for Jira issues from `.jira-historical-report.json` — stories and tasks get both; bugs get time only; spikes get neither. After reporting, asks whether to update Jira or do nothing.

Use when you want data-backed sizing for a backlog slice — unpointed stories, epic children, or a sprint candidate list.

---

## Prerequisites

This skill **does not fetch historical data on its own**. It reads an existing `.jira-historical-report.json` produced by [jira-get-historical-items](../jira-get-historical-items/SKILL.md).

| Requirement | Details |
|-------------|---------|
| **Historical report** | `.jira-historical-report.json` — [CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) § Historical artifact read lookup; or a path you provide |
| **Target scope** | JQL, issue keys, or natural language (“unpointed stories under <PROJECT>-41”) |
| **Atlassian MCP** | Required to **fetch** target issues and **optionally update** Jira — see [JIRA.md](JIRA.md) |
| **No report yet?** | The agent stops and offers to generate one via jira-get-historical-items (with your consent) |

**Tip:** A narrow, recent historical window (one project, last 3–6 months, resolution Done) makes both point buckets and p75 cycle times more trustworthy. See [jira-get-historical-items/README.md](../jira-get-historical-items/README.md).

---

## What it does

**Report → JQL → fetch targets → size each issue → print in chat → optionally update Jira.**

1. **Resolve report** — load `.jira-historical-report.json` ([SKILL.md](SKILL.md) step 1).
2. **Build JQL** — translate your scope into exact JQL; post it before fetching ([SKILL.md](SKILL.md) step 2).
3. **Fetch targets** — MCP search for summary, description, type, comments ([JIRA.md](JIRA.md)).
4. **Estimate** — build effort profiles from historical `items`; match each issue to the closest point bucket; look up p75 cycle time ([SIZING.md](SIZING.md)).
5. **Report** — per-issue story points + cycle time in chat ([OUTPUT.md](OUTPUT.md)).
6. **Optional Jira update** — set story points and post cycle-time comments when you agree ([UPDATE_JIRA.md](UPDATE_JIRA.md)).

### How historical data drives both numbers

**Story points (stories and tasks)**

- Reads all `items` in the report — pointed and unpointed — to characterize typical effort at each allowed point value.
- Compares each target issue’s scope, complexity, and touch surface to those profiles.
- Picks the closest value on the team scale: **1, 2, 3, 5, 8** only.
- **Ignores** story points already on the Jira issue — the estimate is fresh from history + issue content.

**Estimated work time (cycle time)**

- Uses `cycleTime.percentiles` from the same report — **p75 business days** (Mon–Fri).
- **Stories/tasks:** p75 for the chosen point bucket (falls back through issue type → all items when needed).
- **Bugs:** p75 across **all historical bugs** — no story points; time only.
- **Spikes:** no story points and no time estimate.

Together, you get a **point recommendation** and a **“how long similar work took”** number grounded in the same historical baseline.

---

## Output (chat)

After each run, chat includes the exact JQL and a block per issue ([OUTPUT.md](OUTPUT.md)):

```text
<PROJECT>-600 - Add validation to subnet step

Issue type: Story
Estimated points: 3
Estimated cycletime: 6 business days (p75)
```

| Issue type | Estimated points | Estimated cycletime |
|------------|------------------|---------------------|
| Story, Task | 1, 2, 3, 5, 8 or `cannot determine` | p75 for matched bucket or `cannot determine` |
| Bug | `n/a` | p75 from bug history or `cannot determine` |
| Spike | `n/a` | `n/a` |

The agent then asks whether to **update Jira** (story points + cycle-time comments via MCP) or **do nothing**.

---

## How to use it

### Install the skill

Install per host (see [Host compatibility](../jira-acceptance-criteria-check/CONVENTIONS.md#host-compatibility)):

| Host | Install path |
|------|--------------|
| **Fleet repo** | `skills/jira-get-estimates/` — run `make install-opencode`, `make install-claude`, or `make install-cursor` from [agentic-sdlc](https://github.com/OpenShift-Fleet/agentic-sdlc) |
| **OpenCode** | `~/.config/opencode/skills/jira-get-estimates/` |
| **Cursor** | `~/.cursor/skills/jira-get-estimates/` or `.cursor/skills/jira-get-estimates/` in the project |
| **Claude Code** | Fleet plugin via `make install-claude` (skills ship in the plugin) |

Ensure **Atlassian MCP** is configured when using Jira fetch or writes (see [Requirements](#requirements) where present).

### Trigger the skill

Ask the agent — for example:

- “Estimate story points and cycle time for unpointed stories under parent <PROJECT>-41”
- “Size these keys from historical data: <PROJECT>-600, <PROJECT>-601, <PROJECT>-602”
- “Run jira-get-estimates on `project = <PROJECT> AND \"Story Points[Number]\" IS EMPTY AND type in (Story, Task)`”
- “Give me point and p75 time estimates for the open backlog in <PROJECT> phase 2 epics”

**Not this skill:** building the historical baseline → use [jira-get-historical-items](../jira-get-historical-items/SKILL.md) first; summarizing closed work stats → [jira-get-stats](../jira-get-stats/SKILL.md).

The skill is **user-invocable** (`SKILL.md` frontmatter).

### What to have ready

| Input | When |
|-------|------|
| **Historical report** path or prior jira-get-historical-items run | Always — agent stops if missing |
| **What to estimate** — keys, JQL, or natural language | Always — agent asks if unclear |
| **Atlassian MCP** authenticated | Fetch + optional Jira writes |

### After delivery

1. Review per-issue **Estimated points** and **Estimated cycletime** in chat.
2. Choose **Update Jira** to apply story points and post standardized cycle-time comments, or **do nothing** to keep estimates in chat only.
3. To refresh the baseline, re-run jira-get-historical-items with a recent window, then estimate again.

---

## Directory layout

```
jira-get-estimates/
├── README.md       # This file
├── SKILL.md        # Orchestrator — workflow, gates, report resolution
├── SIZING.md       # Effort profiles, point scale, p75 lookup rules
├── JIRA.md         # MCP fetch for target issues
├── OUTPUT.md       # Chat output format
└── UPDATE_JIRA.md  # Optional story points + cycle-time comments (MCP)

# Shared with jira-get-stats:
jira-get-historical-items/RESOLVE_REPORT.md   # Step 1 — find report file
jira-acceptance-criteria-check/CONVENTIONS.md                      # Paths, MCP, glossary
```

---

## Related skills

| Skill | Relationship |
|-------|------------|
| [jira-get-historical-items](../jira-get-historical-items/SKILL.md) | **Upstream** — produces `.jira-historical-report.json` and p75 percentiles this skill consumes |
| [jira-get-stats](../jira-get-stats/SKILL.md) | **Sibling** — readable stats summary from the same report |
| [jira-acceptance-criteria-check/CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) | Shared paths, MCP rules, skill index |
| [jira-epic-breakdown](../jira-epic-breakdown/SKILL.md) | Optional follow-on — break down epics; run estimates on child items |
| [jira-acceptance-criteria-check](../jira-acceptance-criteria-check/SKILL.md) | Separate — ticket quality review; does not size from history |

---

## Troubleshooting

| Problem | What to check |
|---------|----------------|
| No `.jira-historical-report.json` found | Generate via [jira-get-historical-items](../jira-get-historical-items/SKILL.md) or paste a report path |
| Agent asks what to estimate | Provide keys, JQL, or a filter before fetch |
| `cannot determine` on a story/task | Empty or vague description — add scope in Jira and re-run |
| Bug cycle time `cannot determine` | Historical report has no closed bugs with cycle time — widen bug history in the report JQL |
| Spike shows `n/a` for both fields | Expected — spikes get no points or time estimate |
| Estimates feel off | Tighten historical report scope (project, 3–6 months, Done) and re-run upstream skill |
| MCP auth failed | host MCP settings → Atlassian server; re-authenticate; see [JIRA.md](JIRA.md) |
| Jira not updated | Agent waits for explicit **Update Jira** choice — see [UPDATE_JIRA.md](UPDATE_JIRA.md) |
| Duplicate cycle-time comments skipped | Prior comment starting with “Estimated cycle time” — edit in Jira or delete before re-posting |

Site default: **redhat.atlassian.net**. Story points field: load `meta.storyPointsField` from the report when present.

---

*Originally created by Kim Doberstein.*
