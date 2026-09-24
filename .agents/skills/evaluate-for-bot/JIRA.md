# Jira fetch

Fetch work items for **evaluate-for-bot** via available Jira integration tools.

**Pasted-only input:** [PASTED_INPUT.md](PASTED_INPUT.md) instead of this file.

**Site:** Your Jira instance (e.g., `your-org.atlassian.net`)

**Output:** Hold issues internally for scoring — do not dump raw bodies unless the user asked.

---

## 1. Resolve scope → JQL

**Default JQL** when the user gives no filter hints (adapt project/fields to their site):

```text
project = YOUR_PROJECT AND status in ("To Do", "In Progress") AND type in (Story, Task, Bug) AND assignee = currentUser()
```

---

## 2. Fields

| User says | Fetch |
|-----------|--------|
| *(default)* | `key`, `summary`, `description`, `issuetype`, `status` |
| Names other fields | Add those fields |

Always include **`issuetype`** and **`status`** for report context.

---

## 3. Transport

Use available Jira integration tools:

1. Authenticate to Jira instance as needed.
2. Get `cloudId` or instance identifier for the target site.
3. **One key:** Fetch single issue with requested fields; prefer markdown format when available.
4. **Many / JQL:** Search with JQL query and pagination until all issues fetched or [DISCOVERY.md](DISCOVERY.md) cap reached.

**If fetch fails:** **Stop** — tell the user how to fix Jira integration; do not score without data.

---

## 4. Enrichment (optional)

When scoring **open_questions** or **description_clarity**, consider:

| Source | When |
|--------|------|
| Recent comments (last 5) | Questions, decisions, or “blocked on …” in thread |
| Parent epic summary/description | Missing WHY/WHAT in child |
| Linked PRs / docs in description | Reduces open questions |

Fetch comments only when the ticket body is thin or comments are referenced — avoid N+1 fetches for large batches unless needed.

---

## 5. Hand off

Record internally:

| Item | Use |
|------|-----|
| Resolved JQL | Report header |
| Transport | Jira integration method used |
| Issue list | Fields above + optional comments |
| Truncation | Note if cap applied |

Pass to **score** ([SCORING.md](SCORING.md)).
