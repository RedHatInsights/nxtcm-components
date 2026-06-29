# Jira — parent and related epics

Fetch **parent** and **related** epics for context before drafting via **Atlassian MCP only** — no CLI fallback (same bar as **jira-acceptance-criteria-check** [JIRA.md](../jira-acceptance-criteria-check/JIRA.md)).

**Site:** `redhat.atlassian.net`

**No Jira writes** during discovery, research, or drafting. Writes happen only after §6 when the user chooses update or create new ([SKILL.md](SKILL.md) §6, § Write below).

---

## Prerequisite: discovery gate

Do **not** fetch or draft until [DISCOVERY.md](DISCOVERY.md) § Discovery gate passes:

- User named keys **or** explicitly said “none” / “standalone” for **each** of parent and related
- If not → **discovery-only** response; no Jira calls

Fetching Jira does not replace asking when the user never stated hierarchy.

---

## When to fetch

After the discovery gate passes:

| User provided | Action |
|---------------|--------|
| Parent epic key(s) | Fetch each parent |
| Related epic key(s) | Fetch each related epic |
| “No parent” / “standalone” | Skip parent fetch; note in internal context |
| “No related epics” | Skip related fetch; note in internal context |

Do **not** add `(add Jira key)` — ask in discovery ([DISCOVERY.md](DISCOVERY.md) § Completeness gate).

---

## Fields to fetch

Per issue:

| Field | Use |
|-------|-----|
| `key` | Implementation notes, chat context, Out of scope |
| `summary` | Chat context line |
| `description` | WHAT/WHY, scope, AC hints |
| `issuetype` | Confirm epic vs initiative vs story |

Optional when useful: `status`, parent link field (if MCP exposes it).

Use `responseContentFormat: "markdown"` for descriptions when MCP supports it.

---

## Transport — MCP only

1. Read MCP tool schemas under `user-atlassian-mcp-server` before calling.
2. If only `mcp_auth` is listed → authenticate, re-check tools.
3. `getAccessibleAtlassianResources` → `cloudId` for `redhat.atlassian.net`.
4. `getJiraIssue` per key with `responseContentFormat: "markdown"` when available.

**If MCP fails** for a **user-supplied key** (server missing, tools unavailable after auth, or fetch error):

- Tell the user how to fix MCP (Cursor → **Settings → MCP** → enable Atlassian; `mcp_auth` for `user-atlassian-mcp-server`).
- Continue drafting from conversation only — note unfetched keys in **More information needed**.
- Do **not** use `acli`, Jira REST, or curl.
- Do **not** stop the whole skill unless the user said drafting depends on Jira.

There is **no** acli or other CLI fallback for this skill.

---

## How to use fetched content

| Source | Apply to |
|--------|----------|
| **Parent epic** description | Align WHY and release context; narrow this epic’s scope to its slice of the parent |
| **Parent epic** AC | Avoid duplicating parent-level outcomes; ensure this epic’s AC are a coherent subset or parallel track |
| **Related epic** description | Note dependencies, shared components, sequencing |
| **Related epic** scope | De-dupe AC; list in **Out of scope** when overlap risk — “covered by KEY” |

Do **not** paste parent/related descriptions verbatim into the draft. Synthesize **briefly** ([WRITING.md](WRITING.md)).

---

## Chat context line (optional)

Before the epic body, one line when hierarchy exists:

```markdown
**Context:** Parent [FCN-100](https://redhat.atlassian.net/browse/FCN-100); related [FCN-200](https://redhat.atlassian.net/browse/FCN-200), [FCN-201](https://redhat.atlassian.net/browse/FCN-201).
```

Omit when standalone with no related epics.

Parent/related links may also appear in **Implementation notes** when coordination matters for implementers.

---

## Write — create or update epic (after §6)

Run only when the user chose **update existing** or **create new** in [SKILL.md](SKILL.md) §6.

**MCP only** — `user-atlassian-mcp-server`. Do **not** use `acli`, Jira REST, or curl.

| Do | Do not |
|----|--------|
| `editJiraIssue` / `createJiraIssue` via MCP | `acli`, Jira REST, or curl for any Jira call |
| Read MCP tool schemas before calling | Fall back to another transport when MCP fails |
| `mcp_auth` on **401**, retry once | Silent switch to another transport |

**Cloud ID:** `2b9e35e3-6bd3-4cec-b838-f4249ee02432` or `redhat.atlassian.net`

1. Read MCP tool schemas under `user-atlassian-mcp-server`.
2. If only `mcp_auth` is listed → authenticate, re-check tools.
3. `getAccessibleAtlassianResources` → `cloudId` when needed.

### Update existing epic

**Prerequisite:** **Target epic key** is known ([SKILL.md](SKILL.md) §6 — if not, ask the user; do not use parent/related keys by default).

1. Optionally `getJiraIssue` to confirm type is Epic (or note if not).
2. Post the full draft body (all registry sections) as the issue **description** — markdown, same order as [TEMPLATE.md](TEMPLATE.md) § Section registry.
3. Confirm success in chat with issue link: `https://redhat.atlassian.net/browse/<KEY>`.

```text
editJiraIssue
  cloudId, issueIdOrKey: <TARGET_KEY>
  fields: { "description": "<full epic markdown>" }
  contentFormat: "markdown"
```

Do **not** change summary, parent, or other fields unless the user asked.

### Create new epic

Gather if missing:

| Field | Source |
|-------|--------|
| **Project key** | User stated, or prefix from parent epic key (e.g. FCN-100 → `FCN`), or ask |
| **Summary** | Working title from draft, or ask |
| **Description** | Full paste-ready epic body from §5 |
| **Parent** (optional) | Parent epic key from discovery, if user wants hierarchy set on create |

```text
createJiraIssue
  cloudId, projectKey, issueTypeName: "Epic"
  summary: "<title>"
  description: "<full epic markdown>"
  contentFormat: "markdown"
  additional_fields: { "parent": { "key": "<PARENT_KEY>" } }  # only when user confirmed parent on create
```

Epic parent/link field names vary by site — use `getJiraIssueTypeMetaWithFields` when `additional_fields` fails.

Confirm created key in chat with browse link.

### MCP errors (writes)

| Situation | Action |
|-----------|--------|
| **401** | `mcp_auth` for `user-atlassian-mcp-server`, retry once |
| Still failing after auth | **Stop** — report error; paste-ready draft stays in chat |
| **-32601** | Wrong tool name — re-read MCP schema |
| Create/update rejected | Show MCP error; ask user to fix fields or paste manually |

### After write

- **Do not** auto-invoke jira-epic-breakdown or other skills — wait for the user.
- On failure, show the error; leave the paste-ready draft in chat.
