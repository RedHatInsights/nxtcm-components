# Pasted input (no Jira fetch)

Use when the user pasted ticket text or described work items **without** Jira keys.

**Skip [JIRA.md](JIRA.md)** when pasted content is already in scope.

---

## When to use

| Source | Action |
|--------|--------|
| Pasted Jira bodies | Parse summary + description per item |
| Bullet list of work | One synthetic item per bullet or numbered block |
| “Evaluate these for a bot” + text | Synthetic mode |
| User also gave keys | [JIRA.md](JIRA.md) for keys; pasted blocks stay synthetic |

---

## Synthetic issue shape

| Field | Required | Notes |
|-------|----------|-------|
| `summary` | Yes | Title line |
| `description` | Yes | Full body; may be thin — score honestly |
| `declared_type` | Optional | Story, Task, Bug, etc. — for report label |
| `synthetic_id` | Yes | `PASTED-1`, `PASTED-2`, … |

---

## Report labels

- Use `PASTED-<n> - Summary` when no Jira key exists.
- Do **not** create Jira browse links for synthetic ids.

---

## Hard rules

| Do | Do not |
|----|--------|
| Score substance in pasted text | Require Jira keys |
| Note when pasted text is too thin for confident blast-radius scoring | Invent missing ticket details |
| Run [REPO.md](REPO.md) when repo scope is set | Update Jira |
