# Report output

Replace keys and summaries with real values. Do **not** wrap the whole report in a code fence.

**Inputs per issue:** `key`, `summary` from [JIRA.md](JIRA.md); `bot_confidence_score`, `score_justification`, `blockers`, `bot_strengths` from [SCORING.md](SCORING.md); `blast_radius`, `likely_files` from [REPO.md](REPO.md); `issuetype`, `status` from [JIRA.md](JIRA.md).

**Grouping:** One unified report — each issue in **exactly one** bucket.

---

## Where to write output

| Issue count | Destination | Section headers (`# Good candidates`, etc.) |
|-------------|-------------|---------------------------------------------|
| **1** | **Response** — full report content | **Omit** bucket headers |
| **2+** | **File: `evaluate-for-bot-report.md`** — see [File location](#file-location) | **Include** — see [Report shape](#report-shape) |

**Multiple issues — response:** Path, scope (JQL or input mode), repo path, issue count, bucket counts only. Do **not** paste the full report body.

**Single issue — response:** Full item block per [Item block](#item-block). Omit bucket headers and report title.

### File location

When writing `evaluate-for-bot-report.md` for 2+ items:

| Mode | Write to |
|------|----------|
| **With repo research** | The `repo_path` directory (from [DISCOVERY.md](DISCOVERY.md)) — same directory being researched |
| **Ticket-only mode** | Current working directory |

**Example:** If `repo_path = /Users/dev/my-project`, write `/Users/dev/my-project/evaluate-for-bot-report.md`

---

## Bucket rules

| Section | Score |
|---------|-------|
| **Good candidates** | **4 or 5** |
| **Marginal** | **3** |
| **Poor fit** | **1 or 2** |

Empty section → `*None.*`

Sort within each bucket: **descending score**, then key.

---

## Item block

Use for every issue in the report file; use the same block (without bucket wrapper) for a single-issue response.

```markdown
## KEY - Summary

**Score:** N/5 · **Type:** Story · **Status:** To Do
**Blast radius:** small · **Repo:** /path/to/repo (searched) | ticket-only (repo not searched)

**Why this score:** <score_justification — 2–4 sentences>

**Blockers:** *(what prevents bot from getting score ≥ 4)*
* <specific blocker: "Missing: URL for learn more link" | "Open: which error message format?" | "Large blast radius: touches auth middleware" | *None.*>

**Likely touch points:** `path/to/file.tsx`, `path/to/other.ts` — or *Not locatable*

**Bot strengths:** *(scores 4–5 only)*
* <strength>
```

For synthetic ids use `PASTED-1` (or `DRAFT-1`) instead of KEY. Link real keys: `https://{jira-instance}/browse/<KEY>` (e.g., `your-org.atlassian.net/browse/PROJ-123`).

Omit **Bot strengths** when score ≤ 3.

### Blockers examples

**Score 3 (marginal):**
```markdown
**Blockers:**
* Missing: URL for "Learn more" link (from external system)
* Missing: billing account help text to display
```

**Score 2 (poor fit):**
```markdown
**Blockers:**
* Open: which of 3 proposed UX flows to implement?
* Large blast radius: changes auth middleware affecting all routes
* Missing: API contract for new integration endpoint
```

**Score 5 (high confidence):**
```markdown
**Blockers:**
* *None.*
```

---

## Report shape

**Multiple issues (2+)** — write `evaluate-for-bot-report.md`:

```markdown
# Evaluate for bot report

**Scope:** `project = YOUR_PROJECT AND …` · **Issues:** 12 · **Repo:** /Users/dev/my-project · **Transport:** Jira API

| Bucket | Count |
|--------|-------|
| Good candidates (4–5) | 3 |
| Marginal (3) | 5 |
| Poor fit (1–2) | 4 |

---

# Good candidates

## PROJ-100 - Fix validation message on login form

**Score:** 5/5 · …

…

---

# Marginal

…

---

# Poor fit

…
```

Horizontal rules (`---`) between bucket sections. Horizontal rule **between each item** within Marginal and Poor fit when those sections have multiple items.

---

## Detail mode

When the user asks for **detailed** or **per-criterion** breakdown, add under **Why this score:**

```markdown
**Criteria:**
| Criterion | Rating | Notes |
|-----------|--------|-------|
| description_clarity | 4 | … |
| open_questions | 5 | … |
| blast_radius | 4 | … |
```

Use slugs from discovered [CRITERIA/](CRITERIA/README.md) files.

---

## Formatting rules

- Item titles: **H2** — `## KEY - Summary`
- **Score** line bold label
- **Blockers** always present:
  - `*None.*` when score ≥ 4 and nothing prevents autonomous bot work
  - **Specific bullets** when score ≤ 3 — list open questions, missing information (which URL/copy/command), blast radius concerns
  - Be concrete: "Missing: billing account help text" not "needs more detail"
- Do not split report by Jira issuetype — only by bot-confidence buckets

---

## After the report

This skill is **read-only**. Do not offer Jira updates unless the user asks separately.

Optional follow-ups when the user asks:

- Re-run after ticket edits
- Narrow JQL to Good candidates only
- Add a new criterion file under `CRITERIA/` and re-score
