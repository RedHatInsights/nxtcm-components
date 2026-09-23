# Jira — fetch epic

Fetch the **parent epic** for decomposition via **Atlassian MCP only** — no CLI fallback (same bar as **jira-acceptance-criteria-check** [JIRA.md](../jira-acceptance-criteria-check/JIRA.md)).

**Site:** `redhat.atlassian.net`

**No Jira writes** during decomposition, review, or delivery. Creates happen only after §7 when the user chooses **Create in Jira** ([SKILL.md](SKILL.md) §7, § Write below).

**Default:** do **not** search for existing child issues — assume children are **not** filed yet unless the user asks to dedupe (§ Existing children).

---

## Fields to fetch

| Field | Use |
|-------|-----|
| `key` | Report header, child epic link |
| `summary` | Context line |
| `description` | All epic sections (see § Parse epic description) |
| `issuetype` | Confirm issue is an epic (note if not) |
| `parent` | Parent initiative — context only |

---

## Transport — MCP only

Use Fleet-standard Jira MCP tools (`mcp__jira-mcp-server__*`). If unavailable, fall back to Cursor's `user-atlassian-mcp-server` equivalents — see [CONVENTIONS.md](../jira-acceptance-criteria-check/CONVENTIONS.md) § MCP transport.

1. Read MCP tool schemas — prefer `mcp__jira-mcp-server__*` (Claude Code, OpenCode); else `user-atlassian-mcp-server` (Cursor).
2. If only `mcp_auth` is exposed → call `mcp_auth` for the Atlassian server with `{}`, then re-check tools.
3. `mcp__jira-mcp-server__getAccessibleAtlassianResources` (or `getAccessibleAtlassianResources`) → `cloudId` for `redhat.atlassian.net`.
4. `mcp__jira-mcp-server__getJiraIssue` (or `getJiraIssue`) with `responseContentFormat: "markdown"`.

**If MCP fails** (server missing, tools unavailable after auth, or fetch error):

- Ask the user to paste the epic body **or** fix MCP (enable the Atlassian MCP server in the host's MCP settings and complete authentication).
- Do **not** use `acli`, Jira REST, or curl.

There is **no** acli or other CLI fallback for this skill.

---

## Existing children (only when user asks)

When the user wants to **dedupe** against work already filed, search:

```text
parent = <EPIC_KEY> OR "Epic Link" = <EPIC_KEY>
```

**MCP:** `mcp__jira-mcp-server__searchJiraIssuesUsingJql` (or `searchJiraIssuesUsingJql`) with the JQL above.

List matches in **Already filed** ([TEMPLATE.md](TEMPLATE.md) §6). Do **not** run this search by default.

---

## Parse epic description

Read [jira-epic-create/TEMPLATE.md](../jira-epic-create/TEMPLATE.md) § **Section registry** — extract sections in **Order** sequence using each guide’s **Heading** value.

For each registry row:

| Step | Action |
|------|--------|
| 1 | Read the **Guide** file’s **Section metadata** |
| 2 | Parse content after that **Heading** until the next registry **Heading** or `---` |
| 3 | Apply **Breakdown trace** (below) |

### Breakdown trace codes

| Trace | Registry sections (default) | Used for |
|-------|----------------------------|----------|
| `—` | Description, Mockups/Design, Out of scope | Context, Figma links, **hard exclusions** — do not create child items for Out of scope bullets |
| `AC` | Acceptance criteria | Primary trace target — each `- [ ]` or `*` line → AC1, AC2, … |
| `IN` | Implementation notes | API/repo boundaries; trace as `IN` |
| `TP` | Test Plan | Test/docs tasks; trace as `TP` |
| `MIN` | More information needed | Spike candidates; trace as `MIN` |

When the team adds a registry section, read its **Breakdown trace** from the guide metadata — no parser edit required unless a new trace code is introduced.

### Legacy headings (backward compatible)

When an older epic lacks registry sections, also parse:

| Legacy section | Maps to |
|----------------|---------|
| `## References` | Implementation notes context (repos, packages, Jira links) |
| `## Technical notes` | Implementation notes |
| `## Targeted due date` | Context only — not a trace target |

If sections use headings not in the registry, best-effort parse; note ambiguity in report.

---

## Hand off

Pass to [DECOMPOSE.md](DECOMPOSE.md):

- Epic key, summary, link
- Parsed AC list (numbered for traceability: AC1, AC2, …)
- Parsed content for each registry section by **Breakdown trace** — especially **Out of scope** (hard exclusions), **Implementation notes**, **Test Plan**, **Mockups/Design**, **More information needed**

---

## Write — create child issues (after §7)

Run only when the user chose **Create in Jira** in [SKILL.md](SKILL.md) §7.

**MCP only** — Atlassian MCP server. Do **not** use `acli`, Jira REST, or curl.

| Do | Do not |
|----|--------|
| `mcp__jira-mcp-server__createJiraIssue` (or `createJiraIssue`) per breakdown item via MCP | `acli`, Jira REST, or curl for any Jira call |
| Set **parent** to the **epic key** on every child | Create without parent |
| Read MCP tool schemas before calling | Fall back to another transport when MCP fails |

**Prerequisites**

1. **Epic key** is known — if not, ask the user ([SKILL.md](SKILL.md) §7).
2. re-authenticate the Atlassian MCP server on **401**, retry once; if still failing, **stop** and leave breakdown in chat.

**Cloud ID:** `<cloud-id>` or `redhat.atlassian.net`

### Per-item create

Create in **suggested order** from the breakdown table. For each row:

| Planning type | Jira `issueTypeName` | Summary |
|---------------|----------------------|---------|
| story | `Story` | Breakdown summary as drafted |
| task | `Task` | Breakdown summary as drafted |
| bug | `Bug` | Breakdown summary as drafted |
| spike | **`Story`** | **Must include `Spike`** — e.g. `Spike: <summary>` if not already present |

**Project key:** prefix from epic key (e.g. `<PROJECT>-100` → `<PROJECT>`).

```text
mcp__jira-mcp-server__createJiraIssue
  cloudId, projectKey, issueTypeName: <Story|Task|Bug>
  summary: "<title — Spike prefix for spikes>"
  description: "<paste-ready ticket body from breakdown>"
  contentFormat: "markdown"
  additional_fields: { "parent": { "key": "<EPIC_KEY>" } }
```

If `parent` fails (site-specific epic link), use `mcp__jira-mcp-server__getJiraIssueTypeMetaWithFields` (or `getJiraIssueTypeMetaWithFields`) for the correct parent/epic-link field.

### After create

Post a table in chat:

| # | Key | Type | Summary |
|---|-----|------|---------|
| 1 | <PROJECT>-501 | Task | … |

Link each key to `https://redhat.atlassian.net/browse/<KEY>`.

- Note any items that were **Needs human review** in the breakdown — user may want to edit in Jira.
- **Do not** auto-invoke jira-acceptance-criteria-check — wait for the user.
- On partial failure, report which keys succeeded and which failed; do not silently skip.
