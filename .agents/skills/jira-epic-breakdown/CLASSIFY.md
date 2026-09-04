# Classify issue type

**Orchestration wrapper only** — all classification semantics live in **jira-acceptance-criteria-check**. Do not add type definitions here.

Assign exactly one **`classified_type`** slug per child item.

**What each type means:** read **Definition** (and **Quick signals**) from each file under [jira-acceptance-criteria-check/JIRA_TYPE/](../jira-acceptance-criteria-check/JIRA_TYPE/README.md). Do **not** use hardcoded story/task/bug/spike semantics from this file — those live in the type rubrics and are team-editable.

**How to classify:** follow [CLASSIFY.md](../jira-acceptance-criteria-check/JIRA_TYPE/CLASSIFY.md) (discover types, compare definitions, record match/mismatch).

**Ticket templates:** after classification, draft bodies from `jira-acceptance-criteria-check/JIRA_TYPE/{slug}.md` for that slug.

**WHAT + WHY** for all types: [GENERAL.md](../jira-acceptance-criteria-check/GENERAL.md).

**Epic slicing heuristics** (how big to cut work, API splits, UI journey) → [DECOMPOSE.md](DECOMPOSE.md) — separate from what a Jira issuetype *means*.

---

## Report type column

In the breakdown table, show:

- **Type** — `classified_type` slug from discovered rubrics
- Optional note when Jira issuetype differs from planning slug — e.g. `spike → Story in Jira`

### Jira issuetype when filing ([JIRA.md](JIRA.md) § Write)

Use **Jira issuetype aliases** from each type file’s **Type metadata**. When a planning slug has no alias on your site, ask the user or match the closest Jira type.

| Planning slug | Typical filing |
|---------------|------------------|
| *(any)* | `issueTypeName` from that type’s **Jira issuetype aliases**; summary rules from epic context or type **Summary prefix hints** |

---

## Hand off

Pass `classified_type` per item to [TICKETS.md](TICKETS.md) for the correct template and sections.
