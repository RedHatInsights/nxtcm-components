# Output template

Deliver in this order **in chat** — the user reads this before any “create in Jira?” prompt. Do not wrap the full breakdown in one outer code fence. Do not replace this with a summary, file path only, or a structured choice prompt without the sections below.

---

## 1. Header

```markdown
# Epic breakdown — [KEY] [Epic summary]

**Epic:** [KEY](https://redhat.atlassian.net/browse/KEY)
**Items:** N (S stories · T tasks · …)
**Suggested order:** 1 → 2 → 3 …
```

When epic was pasted (no key), omit link; use user’s working title.

---

## 2. Breakdown table

```markdown
| # | Type | Summary | Depends on | Traces epic |
|---|------|---------|------------|----------------|
| 1 | task | Publish wizard npm package | — | AC4 |
| 2 | story | Add prerequisites screen before wizard | — | AC2 |
| 3 | story | Integrate ROSA HCP wizard in ACM | 1 | AC4, AC5 |
```

**Columns:**

| Column | Content |
|--------|---------|
| # | Implementation order |
| Type | slug from [JIRA_TYPE/](../jira-acceptance-criteria-check/JIRA_TYPE/README.md) rubrics (e.g. story · task · bug · spike) |
| Summary | Jira title candidate |
| Depends on | `#` or `—` |
| Traces epic | `AC1`, `AC2`, … · `IN` (Implementation notes) · `TP` (Test Plan) · `MIN` (More information needed) |

---

## 3. Coverage check

Short bullet list:

```markdown
### Epic AC coverage

* AC1 → #2, #3
* AC2 → #2
* …
* All epic AC mapped: yes
```

If gap, fix decomposition before delivering.

---

## 4. Review flags

Include when step 5 ([REVIEW.md](REVIEW.md)) ran. Omit when user asked for **breakdown only**.

```markdown
### Review flags

**Summary:** 14 ready · 2 need human review · 1 need refinement

| # | Type | Summary | Status | Flag |
|---|------|---------|--------|------|
| 1 | task | Publish wizard npm package | Ready | score 5 |
| 3 | story | Integrate ROSA HCP wizard in ACM | Needs human review | AC vague on error states; score 3 |
| 5 | spike | Compare subnet validation APIs | Needs human review | Spike incomplete — timebox missing |
| 7 | story | Add prerequisites screen | Revised — ready for review | Filled AC from epic AC2 |
```

**Status values:** `Ready` · `Revised — ready for review` · `Needs human review` · `Needs refinement`

**Flag column:** brief reason (score, type mismatch, blocked on spike, epic MIN trace, etc.).

Every breakdown row appears in this table.

---

## 5. Ticket bodies

One block per item, in suggested order:

```markdown
---

## 1. [task] Publish wizard npm package

### Description

…

### Acceptance Criteria

* …
```

Use type-appropriate sections ([TICKETS.md](TICKETS.md)). Heading format: `## <#>. [<type>] <Summary>`.

---

## 6. Already filed (optional — user asked to dedupe only)

When the user asked to check existing children ([JIRA.md](JIRA.md) § Existing children):

```markdown
### Already filed under epic

* <PROJECT>-210 — … (story, In Progress) — overlaps #3; do not duplicate
```

**Do not** include this section by default — assume child items are not created yet.

---

## Section rules

| Part | Required? |
|------|-----------|
| Header | Yes |
| Breakdown table | Yes |
| Epic AC coverage | Yes |
| Review flags | Yes (default); omit only for **breakdown only** |
| Ticket bodies | Yes (default); omit only if user asked for **table only** |
| Already filed | Only when user asked to dedupe existing children |
| §7 Jira ask | **Yes** — only **after** §1–§5 are in the chat message ([SKILL.md](SKILL.md) §6–§7). User must read the breakdown before choosing create vs do nothing. |

---

## Quality check

- [ ] Every epic AC traced to ≥1 item; no orphan items; no items for **Out of scope** work
- [ ] Types match [CLASSIFY.md](CLASSIFY.md); no bugs for net-new features
- [ ] Dependencies acyclic and plausible
- [ ] Summaries are distinct and **sprint-sized**
- [ ] **API/data-fetch work split** per endpoint when epic implies many calls — not one mega-task ([DECOMPOSE.md](DECOMPOSE.md))
- [ ] Parallel API items noted where independent
- [ ] Ticket bodies concise ([WRITING.md](WRITING.md))
- [ ] No extrapolated scope beyond epic
- [ ] Story/task AC are outcomes, not task lists
- [ ] Spikes have outcomes + timebox; no story-style AC
- [ ] PM can read each Description without engineering translation
- [ ] Draft review completed ([REVIEW.md](REVIEW.md)) unless **breakdown only**
- [ ] Every item has a row in **Review flags** when review ran
- [ ] **Full breakdown posted in chat** before any §7 create vs do nothing ask ([SKILL.md](SKILL.md) §6–§7)
- [ ] Items flagged **Needs human review** / **Needs refinement** were not silently dropped
- [ ] Spike summaries include **`Spike`** for Jira filing ([JIRA.md](JIRA.md) § Write)

---

## User asked "titles only"

Deliver §1–§3 and table only; skip §4 ticket bodies.
