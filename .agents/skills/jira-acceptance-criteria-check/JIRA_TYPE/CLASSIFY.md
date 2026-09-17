# Classify issue type

For each issue from [JIRA.md](../JIRA.md) or [DRAFT_INPUT.md](../DRAFT_INPUT.md), assign exactly one **`classified_type`** slug. The slug picks the scoring rubric — one type file under [JIRA_TYPE/](.).

**Do not assume** a fixed set of types or what any type *means*. Discover type files on every run ([README.md](README.md) § Discovery). **Definitions live only in each type file’s Type metadata** — not in this file or other skill files.

---

## 1. Discover available types

1. List `*.md` in this directory (`JIRA_TYPE/`).
2. **Exclude** `CLASSIFY.md` and `README.md`.
3. For each remaining file, read its **Type metadata** section:
   - **Slug** — normalized type id (must match filename stem rules in [README.md](README.md))
   - **Definition** — **authoritative** description of what work belongs to this type (team-specific; edit the type file to match your Jira practice)
   - **Jira issuetype aliases** — labels that map to this slug (case-insensitive)
   - **Quick signals** — tie-breaker tokens (optional)
   - **Summary prefix hints** — optional; summary tokens that suggest this slug (e.g. `Spike:`)

Hold the full set of slugs and metadata in memory for steps 2–4.

If **no** type files exist → **stop** and tell the user to add at least one type rubric under `JIRA_TYPE/`.

---

## 2. Read Jira `issuetype`

Record the raw value as **`jira_issuetype`**.

Normalize (trim, case-insensitive) and match against **Jira issuetype aliases** from every discovered type.

| Outcome | Meaning |
|---------|---------|
| **One match** | Jira type implies that slug — candidate for content comparison in step 4 |
| **Multiple matches** | Rare — prefer the alias match whose **Definition** best fits summary + description |
| **No match** | Jira type is unknown to configured rubrics — classify from **content only** in step 3; note the raw issuetype when recording mismatch or ambiguity |

---

## 3. Read summary and description

Compare ticket **content** against the **Definition** and **Quick signals** of **every** discovered type. Pick the slug whose metadata best fits summary + description.

When issuetype is missing or unknown, this step alone determines `classified_type`.

When signals are weak, prefer the type whose **Definition** best matches **what “done” looks like** for this ticket — using only the discovered definitions, not assumptions from other skill files.

**Summary prefix hints:** when a type’s metadata lists prefix hints, a matching summary token can strongly suggest that slug even when issuetype differs — still record **mismatch** when Jira issuetype does not align.

---

## 4. Decide: match or mismatch

| Outcome | Meaning |
|---------|---------|
| **Match** | Jira `issuetype` (when mappable) and content both fit the same slug per that type’s **Definition** |
| **Mismatch** | Jira `issuetype` maps to one slug, but content fits a **different** slug’s **Definition** better |

Do **not** use hardcoded cross-type rules here. Compare definitions from the discovered type files only.

When issuetype is unknown, set **`type_match`** to **match** if content clearly fits one slug; otherwise pick the best-fit slug and note ambiguity in `type_mismatch_note`.

---

## 5. Record the result (internal — for scoring and report)

For each issue, keep:

| Field | Value |
|-------|--------|
| **`jira_issuetype`** | Raw value from Jira |
| **`classified_type`** | Slug from discovered types — used for scoring and drafts |
| **`classified_type_file`** | Resolved path, e.g. `JIRA_TYPE/STORY.md` |
| **`type_match`** | `match` or `mismatch` |
| **`type_mismatch_note`** | One short phrase when `mismatch` — cite Jira type vs content-fit slug (e.g. `Jira Story; content fits task definition better`) |

**Scoring rubric:** Always use **`classified_type`** and open that type file — not Jira issuetype alone.

**Report:** When `type_match` is **mismatch**, show **Recommend change to \<classified_type\>** under the item title in [REPORT.md](../REPORT.md) (`- KEY - Summary` in Ready/Needs Refinement; `## KEY - Summary` in Needs review). Use the slug label. Omit when `type_match` is **match**.

---

## Hand off

Pass **`classified_type`**, **`classified_type_file`**, **`type_match`**, and **`jira_issuetype`** to **score** and [REPORT.md](../REPORT.md). Report buckets are by **score**, not by issue type.
