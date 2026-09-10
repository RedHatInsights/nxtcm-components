---
name: jira-epic-create
description: Use when you need a complete paste-ready Jira epic description for PMs or management — discovery-first, structured sections, optional codebase research, then ask before create or update in Jira (MCP). NOT for breaking an epic into child tickets (jira-epic-breakdown) or creating single stories/tasks (jira-create).
user-invocable: true
---

# Create epic

Draft a **paste-ready Jira epic body** for **project owners, PMs, and management** — concise, plain language, no repeat or extrapolation ([WRITING.md](WRITING.md)). **Jira access:** MCP only ([JIRA.md](JIRA.md)) — no `acli`. **No Jira writes** until §6 when the user chooses update or create new.

**§ numbers are stable step IDs — do not renumber when editing.**

---

## Companion files

| Step | File |
|------|------|
| Writing style (global) | [WRITING.md](WRITING.md) |
| Section registry + output shape | [TEMPLATE.md](TEMPLATE.md) |
| Section guides (one file per section) | [SECTIONS/](SECTIONS/) — see [SECTIONS/README.md](SECTIONS/README.md) |
| Gather input | [DISCOVERY.md](DISCOVERY.md) |
| Parent / related epics | [JIRA.md](JIRA.md) |
| Explore repos (optional) | [RESEARCH.md](RESEARCH.md) |

---

## Workflow

### 0. Discovery gate (hard stop)

**Before research, repo exploration, or drafting:** follow [DISCOVERY.md](DISCOVERY.md) § Discovery gate and § Completeness gate.

| All required facts resolved? | Allowed next step |
|-----------------------------|-------------------|
| **No** — any gap would become a placeholder, guess, or “confirm later” note in a **required** registry section | **Discovery-only response** — ask for each missing item; do **not** draft |
| **Yes** — user, Jira, or verified research supplied every fact used in required sections | Continue to §1 |

**Discovery-only response** means:

1. Briefly acknowledge what you understood (1–2 sentences).
2. Ask every **unresolved** item in one message — numbered, specific ([DISCOVERY.md](DISCOVERY.md) § Ask).
3. Prefer a **structured choice prompt** when the host supports multiple-choice UI.
4. **Do not** output any registry section heading or paste-ready epic body.
5. **Do not** run repo research until hierarchy is resolved; after research, run completeness audit before drafting.

**Mandatory asks** (when not already provided): parent epic, related epics ([DISCOVERY.md](DISCOVERY.md) § Ask — parent and related epics).

**Also ask before drafting** when research or the user’s prompt leaves gaps that would otherwise become `(add link)`, “confirm with team”, TBD rows in required sections, or vague AC ([DISCOVERY.md](DISCOVERY.md) § Completeness gate). **UI epics:** Figma link mandatory — ask if missing.

Rich context does **not** waive missing facts.

---

### 1. Discover context

Follow [DISCOVERY.md](DISCOVERY.md) — only after §0 gate passes.

Extract from conversation or ask when still blocked — use each registry section’s **Discovery** field in [SECTIONS/](SECTIONS/) plus [DISCOVERY.md](DISCOVERY.md) § Required inputs.

For other gaps, ask only when missing info would force guessing on product behavior, scope, or acceptance criteria. Prefer inferring from conversation history and open files.

---

### 2. Fetch parent and related epics

Follow [JIRA.md](JIRA.md) when the user gave issue keys.

Use fetched descriptions to align scope, WHY, and dependencies. Skip fetch when user confirmed none for both.

---

### 3. Research (when repos are named or inferable)

Follow [RESEARCH.md](RESEARCH.md) when the user names repos, packages, or paths — or when implementation notes would benefit from code evidence.

Skip research when the user only wants prose from their notes and no repo paths were given.

Record findings internally per each section guide’s **Research feeds** field.

---

### 3b. Completeness gate (before drafting)

Re-runs [DISCOVERY.md](DISCOVERY.md) § Completeness gate after research.

If any gap remains that blocks **required** registry sections → **discovery-only response** listing each open item. Do **not** draft until the user answers or explicitly defers (see [DISCOVERY.md](DISCOVERY.md) § User deferral).

---

### 4. Draft each section

1. Read [TEMPLATE.md](TEMPLATE.md) § **Section registry** in order.
2. For each row, open the **Guide** file and read **Section metadata**.
3. Apply [WRITING.md](WRITING.md) plus that guide’s rules.
4. Use the guide’s **Heading** value **verbatim**.
5. **Omit** optional sections when the guide says to omit empty content.

---

### 5. Assemble and quality-check

1. Merge sections into [TEMPLATE.md](TEMPLATE.md) § Section registry order.
2. Run [WRITING.md](WRITING.md) § Before delivering — writing pass.
3. Run the checklist in [TEMPLATE.md](TEMPLATE.md) § Quality check.
4. Deliver only when the epic is **paste-ready** — no `(add …)` placeholders in required sections ([DISCOVERY.md](DISCOVERY.md) § Completeness gate).
5. Do **not** wrap the full epic in a single outer code fence — use normal markdown so the user can paste into Jira. Section snippets may use fences when helpful.

---

### 6. Jira next step (mandatory after delivery)

After the paste-ready epic body is delivered (§5), **always** ask what the user wants to do with it. Prefer a **structured choice prompt** when the host supports multiple-choice UI.

> **What would you like to do with this epic?**
> 1. **Update an existing epic** in Jira with this description
> 2. **Create a new epic** in Jira
> 3. **Do nothing right now** — keep the draft in chat for manual paste later

Wait for the user's choice before Jira writes or other follow-up skills.

| Choice | Action |
|--------|--------|
| **Update existing** | Follow [JIRA.md](JIRA.md) § Write — **MCP only** (`mcp__jira-mcp-server__editJiraIssue`). If **target epic key** is unknown, **stop and ask** for the key — do not guess from parent/related keys. |
| **Create new** | Follow [JIRA.md](JIRA.md) § Write — **MCP only** (`mcp__jira-mcp-server__createJiraIssue`). Ask for **project key** and **summary** when not already clear from the draft. |
| **Do nothing** | Acknowledge briefly. Do not write to Jira. Optional follow-ups (jira-epic-breakdown, etc.) only if the user asks in a later turn. |

#### Target epic key (update path)

The **target** is the Jira issue that receives this draft — not the parent or related epics used for context during drafting.

| Known | Unknown → ask |
|-------|----------------|
| User named the epic key for this work (e.g. “update `<PROJECT>-500`”, “draft for `<EPIC-KEY>`”) | User chose update but never gave which epic |
| User pasted the key when picking update | |

Do **not** assume the parent epic is the update target unless the user said so.

---

## Output destination

| User request | Destination |
|--------------|-------------|
| Epic description / paste into Jira | **Chat** — full epic body **after** discovery gate passes |
| First turn, hierarchy unknown | **Chat** — discovery-only ([DISCOVERY.md](DISCOVERY.md) § Discovery-only response shape) |
| Multiple epics in one session | **Chat** per epic, separated by `---`; or one markdown file if user asks |

Default: deliver one complete epic in chat unless the user asked for a file.

---

## Optional follow-ups (only when asked — after §6 resolves)

- Break epic into child items — invoke **jira-epic-breakdown**
- Score the draft with **jira-acceptance-criteria-check** (story/epic rubric)
- Jira create/update — handled in §6 when the user chooses that path ([JIRA.md](JIRA.md) § Write)

---

## Anti-patterns

Workflow violations (drafting before discovery, skipping §6, updating without target key, using `acli`) → see §0, §6, and [JIRA.md](JIRA.md).

**Content and scope:**

- **Placeholders in required sections** — `(add link)`, `(add Jira key)`, “confirm with team” in any **Required: yes** registry section
- **Burying questions at the end** — asking for parent/related, Figma, or other gaps after delivering the epic body
- **Silent inference** — assuming “standalone”, CRD sets, parity targets, product-specific UI alignment, or links the user never stated
- **Verbose, repetitive, or extrapolated** prose ([WRITING.md](WRITING.md))
- Jargon in Description or AC that blocks PM/management readers
- Inventing product behavior, APIs, or deadlines not supported by user input or repo evidence
- Writing implementation task lists instead of epic-level acceptance criteria
- Deep technical design in Implementation notes (keep high level per [SECTIONS/IMPLEMENTATION_NOTES.md](SECTIONS/IMPLEMENTATION_NOTES.md))
- **UI epic without Figma** — delivering Mockups/Design without a link when UI changes are in scope
- Skipping a **Required: yes** registry section
- Using **More information needed** to avoid discovery for facts that block required sections
- Skipping **why not alternatives** when the user explained platform-specific rationale
- Claiming repo research was done without reading named paths
- Duplicating parent epic AC or scope instead of scoping this epic as a distinct slice

---

## Dependencies

### MCP tools

Prefer Fleet-standard `mcp__jira-mcp-server__*`; fallback to Cursor `user-atlassian-mcp-server` bare tool names — [CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) § MCP transport.

- `mcp__jira-mcp-server__getAccessibleAtlassianResources` — resolve cloud ID
- `mcp__jira-mcp-server__getJiraIssue` — fetch parent/related epics (when keys provided)
- `mcp__jira-mcp-server__editJiraIssue` — update existing epic (user consent only)
- `mcp__jira-mcp-server__createJiraIssue` — create new epic (user consent only)
- `mcp__jira-mcp-server__getJiraIssueTypeMetaWithFields` — site-specific parent/epic-link fields

### Related skills
- `jira-epic-breakdown` — optional follow-up to decompose the epic
- `jira-acceptance-criteria-check` — optional quality scoring on the draft

### Supporting files
- [TEMPLATE.md](TEMPLATE.md), [SECTIONS/](SECTIONS/README.md) — section registry and per-section guides
- [DISCOVERY.md](DISCOVERY.md), [WRITING.md](WRITING.md), [RESEARCH.md](RESEARCH.md), [JIRA.md](JIRA.md)
- [CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) — shared MCP rules
