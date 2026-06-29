# Draft review (pre-delivery)

Run **after** ticket bodies are drafted (step 4) and **before** anything is shown to the user (step 6).

Uses the same classify → score → draft rubrics as **jira-acceptance-criteria-check** steps 2–4 on **synthetic** draft items — **do not invoke** the acceptance-criteria-check skill or fetch Jira. **No Jira writes.**

**Input mode:** [jira-acceptance-criteria-check/DRAFT_INPUT.md](../jira-acceptance-criteria-check/DRAFT_INPUT.md)

---

## Hard rules

| Do | Do not |
|----|--------|
| Review **every** child draft before delivery | Print the breakdown before review finishes |
| Revise drafts when epic context fills gaps (scores 1–3) | Invent scope beyond the epic |
| Flag items that still need **human review** after revision | Create, update, or comment on Jira issues |
| Include **Review flags** in the delivered output ([TEMPLATE.md](TEMPLATE.md)) | Skip review because drafts “look fine” |
| Skip this step only when user asked for **breakdown only** ([DISCOVERY.md](DISCOVERY.md)) | Run jira-acceptance-criteria-check against Jira keys during breakdown |

---

## Workflow

```
Review progress (internal — not shown to user):
- [ ] Build synthetic issue list from drafts
- [ ] Classify each item
- [ ] Score each item
- [ ] Revise weak drafts from epic context
- [ ] Build review flags table
- [ ] Proceed to assemble and deliver
```

---

## 1. Build synthetic issue list

For each child item from decomposition, hold:

| Field | Source |
|-------|--------|
| `draft_id` | Breakdown `#` (1, 2, 3, …) |
| `summary` | Draft summary / Jira title |
| `description` | Full pasted-ready body from step 4 (all `###` sections) |
| `declared_type` | Type slug from breakdown table (from discovered rubrics) |

Treat `declared_type` as the planning slug. For spikes filed as Jira **Story** with `Spike` in the summary, set `jira_issuetype` accordingly ([JIRA.md](JIRA.md) § Write). For custom types, use **Jira issuetype aliases** from that type’s metadata.

---

## 2. Classify

For each synthetic issue:

1. Discover types per [jira-acceptance-criteria-check/JIRA_TYPE/README.md](../jira-acceptance-criteria-check/JIRA_TYPE/README.md).
2. Follow [CLASSIFY.md](../jira-acceptance-criteria-check/JIRA_TYPE/CLASSIFY.md):

- Set `jira_issuetype` from `declared_type`
- Set `classified_type` from **content** (summary + description)
- Record `type_match`: **match** or **mismatch**

---

## 3. Score

For each synthetic issue, follow [jira-acceptance-criteria-check/SCORING.md](../jira-acceptance-criteria-check/SCORING.md) and the **Scoring** section in the type file for `classified_type`.

Record `score` (1–5) and `score_justification`.

---

## 4. Revise weak drafts

For each item with **score 1–3**, try to improve the draft **before delivery**:

1. Re-read epic Description, AC, Mockups/Design, Implementation notes, Test Plan.
2. Follow [jira-acceptance-criteria-check/DRAFT.md](../jira-acceptance-criteria-check/DRAFT.md) — fill gaps only from epic (and repo paths from discovery when provided).
3. **Do not extrapolate** — if epic context cannot honestly fix the gap, leave the draft as-is and flag for human review.

After revision, optionally re-score. If revision clearly fixes the gap, treat as improved for the flags table.

### Type mismatch

When `type_match` is **mismatch**:

- If content clearly fits `classified_type` better → update **Type** in the breakdown table and ticket heading.
- If ambiguous → keep declared type and flag **Type mismatch — human review**.

### Breakdown-specific flags (always check)

Also flag when:

| Condition | Flag |
|-----------|------|
| Item **depends on** a spike that has not run | **Blocked on spike** |
| Traces epic **MIN** (More information needed) | **Epic gap — human review** |
| Spike missing **timebox** or **outcomes** | **Spike incomplete** |
| Story/task AC reads like a task list, not outcomes | **AC needs human review** |

---

## 5. Build review flags table

Map each item to one **status** for [TEMPLATE.md](TEMPLATE.md) § Review flags:

| Status | When |
|--------|------|
| **Ready** | Score **4–5** after revision; no breakdown-specific flags |
| **Revised — ready for review** | Was 1–3; revised from epic context; now 4–5 or clearly improved |
| **Needs human review** | Score 1–3 after revision attempt; type mismatch unresolved; AC quality flags; **Blocked on spike** |
| **Needs refinement** | Score 1–3; not enough epic context to draft or revise honestly |

**Flag column** — short reason (score, mismatch, blocked-on-spike, epic gap, etc.).

Items in **Needs human review** or **Needs refinement** must **not** be silently dropped — they stay in the breakdown with flags visible.

---

## 6. Hand off to delivery

Pass to step 6 ([TEMPLATE.md](TEMPLATE.md)):

- Updated breakdown table (types fixed when clear)
- Updated ticket bodies (revisions applied)
- **Review flags** table
- Counts: `N ready · M need human review · K need refinement`

Do **not** post ticket bodies until this step completes. After delivery ([TEMPLATE.md](TEMPLATE.md)), the user must see the full breakdown in chat before any §7 Jira ask ([SKILL.md](SKILL.md) §7).
