# Story point sizing

Supplement to [SKILL.md](SKILL.md). Read after resolving the historical report and fetching target issues.

**Allowed story points:** `1`, `2`, `3`, `5`, `8` only — never 4, 6, 7, or other values.

Report schema and `items` / `cycleTime` fields: [jira-get-historical-items/REPORT.md](../jira-get-historical-items/REPORT.md).

---

## Build effort profiles (once per run)

Before estimating individual issues, read all `items` in the report and characterize **typical effort** for each story-point value on the allowed scale.

**Pointed items** (positive `storyPoints` on the allowed scale) are the primary source for each bucket. For each point value that appears in history, note:

- Typical scope and complexity from summaries and descriptions
- Touch surface (single file vs backend + frontend vs cross-cutting)
- Issue types commonly seen at that size
- Actual `cycleTime` on sample items when available

**Unpointed items** still inform effort calibration — use them to understand what small/medium work looks like for bugs and stories in this team, even though they do not define a point bucket on their own.

### Incomplete historical data

Historical reports are often sparse — some point values may have **no** (or very few) examples. That is expected. Do **not** skip those values on the scale.

1. Build profiles for every point value that **does** appear in history.
2. For **missing** buckets, infer effort boundaries from neighboring values that do have data, plus the team point scale below.
3. Treat the scale as **ordered effort levels**: 1 < 2 < 3 < 5 < 8.

### Team point scale

Use to anchor missing buckets and bound effort:

| Points | Typical effort |
|-------:|----------------|
| **1** | Tiny docs, typing, CI-doc, trivial fix |
| **2** | Focused helper, single field, narrow refactor, port existing behavior |
| **3** | Single step/substep, one API proxy + hook, wrapper extension, moderate research spike |
| **5** | Multi-endpoint or multi-step feature, full page/flow, large spike, props contract refactor, comprehensive UX |
| **8** | Epic-scale slice, major cross-cutting refactor, multi-flow feature with heavy unknowns |

**Example — sparse data for 2:** History has strong examples at **1** and **3** but nothing at **2**. A new item whose effort is clearly **more than a 1** but **less than a 3** should be estimated as **2**, even with no historical 2-point tickets.

Apply the same logic between other neighbors (e.g. effort above 3 but below 5 → weigh **3** vs **5**; above 5 but below 8 → weigh **5** vs **8**).

---

## Estimate each fetched issue

Branch on **issue type** first. **Never assign story points to bugs or spikes.**

### Spikes — no estimate

If the issue is a **spike** (Jira type Spike or content is timeboxed research only):

- Do **not** assign story points.
- Do **not** assign estimated cycle time.
- Output **Estimated points:** `n/a` and **Estimated cycletime:** `n/a` (see [OUTPUT.md](OUTPUT.md)).

Skip effort profiling and point matching for spikes.

### Bugs — cycle time only

If the issue is a **bug**:

- Do **not** assign story points — output **Estimated points:** `n/a`.
- Do **not** match effort to the story-point scale.
- Assign **estimated cycle time** from historical **bugs only** (see [Assign estimated cycle time](#assign-estimated-cycle-time) below).
- When the report has no closed bugs with measurable cycle time, **Estimated cycletime:** `cannot determine`.

### Stories and tasks — story points + cycle time

#### Ignore existing story points

If the issue **already has story points** in Jira, **ignore that value**. Still estimate from effort profiling. Do not skip the issue and do not treat the Jira value as the answer.

#### Assess effort on the target issue

Read **summary + full description** (including acceptance criteria when present). Judge:

- Scope breadth (one endpoint vs many, one UI area vs full page)
- Complexity (data transforms, auth flow, parallel queries, dependencies)
- Ambiguity (spike/research vs well-defined implementation)

Use summary + issue type only when description is missing but summary is specific enough to judge effort.

#### Match to closest point on the scale

Compare the target issue's assessed effort to the profiles above and the ordered scale **1 < 2 < 3 < 5 < 8**.

1. Decide where the issue's effort sits relative to calibrated anchors (from history and the team scale).
2. Pick the **single allowed value** that best fits that effort level.
3. When effort falls **between two neighbors** and the middle value lacks historical examples, still assign the middle value when effort belongs there (e.g. above 1, below 3 → **2**).
4. When effort is closer to one neighbor than another, pick that neighbor (e.g. clearly a large 3, not quite a 5 → **3**).

- Imperfect history is expected — choose the best-fit value and proceed.
- Report **cannot determine** only when description is empty/missing **and** summary is too vague to judge scope (e.g. title-only with no context).

Then assign cycle time from the chosen point value (below).

---

## Assign estimated cycle time

### Bugs

Look up `cycleTime.percentiles` for **all historical bugs** (see [REPORT.md](../jira-get-historical-items/REPORT.md)):

1. Prefer `group: "issueType"` where `issueType` is `bug` (case-insensitive)
2. If no bug group exists, **Estimated cycletime:** `cannot determine`

Use `p75Days` from the match. Format as `{p75Days} business days (p75, all bugs)`.

Do **not** fall back to story-point groups or `group: "all"` for bugs — the estimate must reflect bug history only.

### Stories and tasks

Look up `cycleTime.percentiles` for the **chosen story points**:

1. Prefer `group: "issueTypeAndStoryPoints"` matching issue type + points
2. Else `group: "storyPoints"` for that point value
3. Else `group: "issueType"` for the issue type
4. Else `group: "all"`

Use `p75Days` from the best match. Format as `{p75Days} business days (p75)`.

When points are **cannot determine**, estimated cycle time is **cannot determine**.

When `cycleTime` is `null` in the report, estimated cycle time is **cannot determine** for stories and tasks (and for bugs when no bug percentile exists).

---

## Pitfalls

| Problem | Fix |
|---------|-----|
| Historical report missing some point values | Use ordered scale + neighbors; assign gap values (e.g. **2**) when effort falls between known buckets |
| Empty description, vague summary | Report **cannot determine** for that story/task only |
| Bug in scope | Points **n/a**; cycle time from `issueType: bug` percentile only |
| Spike in scope | Points and cycle time both **n/a** |
| No bug history in report | Bug cycle time **cannot determine** |
| Sparse history | Still estimate stories/tasks — imperfect match is expected |
