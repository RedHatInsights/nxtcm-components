# Estimate output format

Supplement to [SKILL.md](SKILL.md). Post results **in chat** unless the user asks for a markdown file.

---

## Order

Post **in this order**:

### 1. JQL

Fenced block with the exact JQL from step 2.

### 2. Summary line

One short line: issues matched and estimated.

### 3. Per-issue blocks

For **each fetched issue**, use this format (blank line between issues):

```text
KEY - summary

Issue type: <Story | Bug | Task | Spike | ...>
Estimated points: <number | n/a | cannot determine>
Estimated cycletime: <N business days (p75) | n/a | cannot determine>
```

**By issue type:**

| Type | Estimated points | Estimated cycletime |
|------|------------------|---------------------|
| **Story, Task** | Allowed point (1, 2, 3, 5, 8) or `cannot determine` | p75 for that point (or type/all fallback) |
| **Bug** | `n/a` — never assign story points | p75 from **all bugs** in the historical report, or `cannot determine` when no bug history |
| **Spike** | `n/a` | `n/a` — no time estimate |

Do not add extra sections unless the user asks.

After posting results, continue to step 6 in [SKILL.md](SKILL.md) — ask whether to update Jira or do nothing ([UPDATE_JIRA.md](UPDATE_JIRA.md)).

---

## Examples

**Story or task:**

```text
FCN-600 - Add validation to subnet step

Issue type: Story
Estimated points: 3
Estimated cycletime: 6 business days (p75)
```

**Bug:**

```text
FCN-601 - Submit button disabled after YAML edit

Issue type: Bug
Estimated points: n/a
Estimated cycletime: 4.2 business days (p75, all bugs)
```

**Spike:**

```text
FCN-602 - [SPIKE] Compare subnet validation APIs

Issue type: Spike
Estimated points: n/a
Estimated cycletime: n/a
```

When a story/task cannot be sized:

```text
Estimated points: cannot determine
Estimated cycletime: cannot determine
```
