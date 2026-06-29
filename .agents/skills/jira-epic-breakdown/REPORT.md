# Report delivery

---

## Destination

| Request | Output |
|---------|--------|
| Default | **Chat** — full [TEMPLATE.md](TEMPLATE.md) (header, table, coverage, **review flags**, ticket bodies) |
| Titles / table only | Chat — header + table + coverage + review flags (when review ran) |
| **breakdown only** | Skip [REVIEW.md](REVIEW.md); no review flags section |
| Many epics in one session | One breakdown per epic, separated by `---` |
| User asks for file | Write `jira-epic-breakdown-<KEY>.md` in workspace; chat gets path + summary |

---

## Chat intro (optional)

One sentence:

> Breakdown for [KEY]: N items in suggested order below.

Do not dump raw Jira fetch unless user asked.

**Review summary** (when step 5 ran): one line after the intro, e.g. `Review: 14 ready · 2 need human review · 1 need refinement`.

---

## Before delivery (internal)

Step 5 ([REVIEW.md](REVIEW.md)) runs **before** any breakdown content appears in chat. Never create issues during review or delivery.

---

## Delivery order (mandatory)

In **one chat message**, in this order:

1. **Post the full breakdown** — [TEMPLATE.md](TEMPLATE.md) header, table, epic AC coverage, review flags (when review ran), and ticket bodies (unless user asked for titles only).
2. **Then** ask §7 — **Create in Jira** vs **Do nothing right now** ([SKILL.md](SKILL.md) §7).

The user must see every suggested item before choosing. **Never** ask §7 in a message that does not include the breakdown. **Never** use **AskQuestion** as a shortcut that hides the item list — the breakdown text comes **first** in the message; the ask comes **after**.

Do not create issues in the same turn as delivery.

Optional brief notes (when useful) — **after** the §7 ask, or in the breakdown body, not instead of it:

- Items that could merge if one team owns them
- Epic **Out of scope** items explicitly excluded from breakdown
- Related epic scope listed in Out of scope — not duplicated
- Spikes that might become tasks after research

Do not add a second full breakdown.

---

## Optional follow-ups (after §7)

| User asks | Action |
|-----------|--------|
| Re-check filed tickets | **jira-acceptance-criteria-check** on created keys |
| Adjust types | Re-run classification for named items only |
| Dedupe existing children | [JIRA.md](JIRA.md) § Existing children |

---

## Formatting

- Use markdown headings for ticket bodies — not one giant code fence
- Link epic and related keys: `https://redhat.atlassian.net/browse/<KEY>`
- Keep table columns aligned for readability
