# Report output

Replace keys and summaries with real values. Do **not** wrap the whole report in a code fence.

**Inputs per issue:** `score`, `score_justification`, `classified_type`, `jira_issuetype`, `type_match` from [CLASSIFY.md](JIRA_TYPE/CLASSIFY.md) + [SCORING.md](SCORING.md); suggested content from [DRAFT.md](DRAFT.md) when applicable.

**Grouping:** One unified report — **not** split by issue type. Each issue appears in **exactly one** section below.

---

## Where to write output

| Issue count | Destination | Section headers (`# Ready`, etc.) |
|-------------|-------------|-----------------------------------|
| **1** | **Chat** — full report content | **Omit** — no `# Ready` / `# Needs review` / `# Needs Refinement` wrappers |
| **2+** | **`{workspace}/jira-acceptance-criteria-check-report.md`** (absolute path) | **Include** — see [Report shape](#report-shape) |

**Multiple issues — chat:** Post only a short pointer in chat (file path, JQL, issue count, fetch transport, one-line summary of bucket counts). Do **not** paste the full report body into chat.

**Single issue — chat:** Post the full item content (score note, mismatch line, suggested sections as applicable). Omit section bucket headers even when the item would normally land under Ready, Needs review, or Needs Refinement.

---

## Bucket rules

| Section | Score | Draft ([DRAFT.md](DRAFT.md)) |
|---------|-------|------------------------------|
| **Ready** | **4 or 5** | — |
| **Needs review** | **1–3** | Suggested description and type-specific sections **were** created |
| **Needs Refinement** | **1–3** | **Not enough information** to suggest description or other sections |

Empty section → `*None.*`

---

## Type mismatch line

When [CLASSIFY.md](JIRA_TYPE/CLASSIFY.md) sets **`type_match`** to **`mismatch`**, show **below** the item title (any section):

**Recommend change to \<classified_type\>**

Use the slug from **`classified_type`** (e.g. **Recommend change to \<slug\>**).

`<classified_type>` is the type the **content** fits — what scoring and drafts used. Omit this line when `type_match` is **match**.

---

## Suggested content (Needs review only)

Use the **Description template** from the issue’s **`classified_type`** file (`JIRA_TYPE/{slug}.md`):

1. Open that type file.
2. Draft only the `###` headings listed under **Description template** — no sections from other types.

Under each item title, after the optional type-mismatch line, paste the draft using **`###` headings** matching that template. Use `*` bullets where the template uses lists. Follow [DRAFT.md](DRAFT.md) for nesting and do-not-invent rules.

Optional: one line **Score: N** and/or **Score note:** … from `score_justification` before suggested sections.

---

## Report shape

**Multiple issues (2+)** — write `jira-acceptance-criteria-check-report.md` using this structure.

Optional metadata block at the top (when useful):

- JQL or scope used
- Issue count
- Fetch transport ([JIRA.md](JIRA.md))

Then **three sections** separated by horizontal rules (`---` on its own line):

1. `---` after metadata (before `# Ready`)
2. `---` between **Ready** and **Needs review**
3. `---` between **Needs review** and **Needs Refinement**

Section titles are **H1** (`# Ready`, `# Needs review`, `# Needs Refinement`).

The example below shows **structure only**. `###` headings and mismatch lines must come from the issue’s type file — not from this sample.

```markdown
# Acceptance criteria check report

**JQL:** `project = <PROJECT> AND …`
**Issues:** 4
**Transport:** MCP

---

# Ready

- <PROJECT>-217 - Implement data ownership handoff between wizard form and YAML review step

- <PROJECT>-999 - Backend config for feature flags
  **Recommend change to task**

---

# Needs review

## <PROJECT>-232 - Implement versions in ACM

**Recommend change to story**

**Score: 3**

### Description or User Story

<Suggested what and why.>

### Acceptance Criteria

* <Suggested verifiable outcome>
* <Suggested verifiable outcome>
  * <Nested sub-outcome if needed>

### Mock ups / Design

<Figma link or N/A>

---

## <PROJECT>-500 - Login fails after password reset

### Description

<Suggested what is broken and why.>

### How to reproduce

1. <Step>
2. <Step>

### Expected

<Correct behavior>

### Actual

<Failure behavior>

---

# Needs Refinement

- <PROJECT>-245 - Prerequisites page for ACM

- ABC-3 - Summary only ticket with no context
```

**Single issue (1)** — same item formatting as above, but **omit** `# Ready` / `# Needs review` / `# Needs Refinement`, metadata `---` separators, and the report title block unless the user asked for JQL/transport context. Post directly in chat.

---

## Formatting rules

### Ready and Needs Refinement

- Line format: `- KEY - Summary` (leading `-`, space, key, ` - `, summary).
- **Recommend change to …** on its own line directly under the item line when `type_match` is **mismatch** — bold the full phrase.
- **Needs Refinement:** optionally add nested `*` bullets naming **what is missing** (from `score_justification`) when that helps the author; keep brief.

### Needs review

- Item title: **H2** — `## KEY - Summary` (link the key when helpful: `https://redhat.atlassian.net/browse/<KEY>`).
- Place a horizontal rule (`---`) **between each** Needs review item (after the last `###` section of one item, before the next `## KEY - Summary`).
- No horizontal rule after the final Needs review item (before the `---` that precedes `# Needs Refinement`).
- **Recommend change to …** directly under the H2 when `type_match` is **mismatch** — bold the full phrase.
- Suggested `###` sections immediately under the item (after mismatch line if any). Use template heading names from the **`classified_type`** file.

### All sections

- Do **not** split the report into blocks by issue type.
- Link issues when helpful: `https://redhat.atlassian.net/browse/<KEY>`

---

## After the report

When **Needs review** items exist (score 1–3 with a draft) on real Jira keys, step 6 in [SKILL.md](SKILL.md) asks whether to post suggestions as comments. See [POST_JIRA.md](POST_JIRA.md).
