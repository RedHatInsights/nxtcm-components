# Stats output format

Supplement to [SKILL.md](SKILL.md). Post results **in chat** unless the user asks for a file only.

---

## Order

Post **in this order**:

### 1. Source

One line: absolute path to the report file used.

### 2. Scope

Fenced block with exact JQL from the report.

One short line: fetched / included / skipped counts. Include the fetch-cap warning when present.

### 3. Date ranges

```text
Created (Jira):          YYYY-MM-DD – YYYY-MM-DD   (or "not available")
Work started (To Do→):   YYYY-MM-DD – YYYY-MM-DD
Closed:                  YYYY-MM-DD – YYYY-MM-DD
```

### 4. Issue counts

- Total, pointed, unpointed
- By type (bullets)
- Type × story points matrix (from script output)

### 5. Cycle time

- All-items distribution: min, p50, p75, p90, max (business days)
- By-type distributions when present
- Bucket counts (0–3, 4–7, 8–14, 15+ days)
- All-items and by-type p75 (all, stories, tasks)
- Per story point: all + stories + tasks (+ bugs when present)

### 6. Throughput (when data exists)

- Closed count and story points per month
- Total story points delivered

### 7. Data quality

Bullets: missing start date, missing cycle time, unpointed count.

### 8. Outliers (when present)

Top items >1.5× their group p75 — key, points, actual vs p75, ratio.

### 9. Items table

| Row count | Delivery |
|-----------|----------|
| ≤ 15 | Full markdown table from `--stdout` |
| > 15 | **Canvas** sortable table + one-line count in chat |

Columns: Key (linked), Type, Points, Created, Started, Closed, Cycle time, Outlier flag, Summary (truncated).

### 10. Saved files

```markdown
## Saved files

- [.jira-historical-stats.json](/absolute/path/to/.jira-historical-stats.json)
- [.jira-historical-report.json](/absolute/path/to/.jira-historical-report.json)
```

Paths only — do not re-paste JSON contents.

---

## Do not include unless asked

- Full `.jira-historical-stats.json` dump
- Full `.jira-historical-report.json` dump
- Per-item descriptions
