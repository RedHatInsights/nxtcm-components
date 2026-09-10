# Discovery

Resolve **what to evaluate** and **where to look in code** before fetch or scoring.

---

## Input modes

| User gives | Action |
|------------|--------|
| Issue keys (`PROJ-232`, list) | Jira fetch → [JIRA.md](JIRA.md) |
| JQL string | Use as-is after sanity check → [JIRA.md](JIRA.md) |
| Natural language (“my open tasks in PROJECT”, “children of PROJ-100”) | Translate to JQL → [JIRA.md](JIRA.md) |
| Pasted ticket bodies (no keys) | [PASTED_INPUT.md](PASTED_INPUT.md) — no Jira fetch |
| Mixed keys + pasted blocks | Fetch keys; parse pasted blocks as synthetic items |

When both keys and filters appear in one message, **keys win** for those items; use JQL for the rest.

---

## Repo scope

| User says | Repo path |
|-----------|-----------|
| *(default)* | Current **working directory** (absolute path) |
| Names a directory or repo | That path for the whole run |
| “Ticket only” / “no repo” / “Jira only” | **Ticket-only mode** — skip [REPO.md](REPO.md) deep search; note in report |

If the current directory is unrelated to the tickets and the user did not name a repo, **ask once** which codebase to use for blast-radius research — or confirm ticket-only mode.

---

## Thin or ambiguous scope

| Situation | Action |
|-----------|--------|
| Zero parseable items | **Stop** — ask for keys, JQL, or pasted tickets |
| Ambiguous Jira scope (“team backlog”) with no project | **One** short clarifying question before search |
| Huge JQL result (50+ issues) | Confirm cap or narrow filter before scoring all |

Default cap when user does not specify: score up to **25** issues per run; say if truncated.

---

## Optional context (use when provided)

| Field | Use |
|-------|-----|
| Parent epic key / summary | Scope and blast-radius context |
| Target branch or package | Narrow repo search in [REPO.md](REPO.md) |
| Bot constraints (“UI only”, “backend only”) | Filter which items are in scope |

---

## Record for downstream steps

| Field | Content |
|-------|---------|
| `input_mode` | `jira` · `pasted` · `mixed` |
| `resolved_jql` | When Jira search ran |
| `repo_path` | Absolute path or `none` (ticket-only) |
| `issue_cap` | Max items scored this run |
