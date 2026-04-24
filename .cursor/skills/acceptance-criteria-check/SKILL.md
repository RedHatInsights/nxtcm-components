---
name: acceptance-criteria-check
description: >-
  Checks how strong acceptance criteria are and drafts suggested AC or spike
  goals in chat (no Jira writes). To post Ready for review to Jira, the user
  must explicitly invoke the acceptance-criteria-write skill separately.
user-invocable: true
---

# Acceptance criteria check

## Steps

### 1. Confirm Jira CLI (`acli`) is authenticated

Run:

```bash
acli jira auth status
```

**Continue only if** the output includes **`✓ Authenticated`**.

**If it does not** (errors, unauthenticated, or no success line): stop and tell the user to install the [Atlassian CLI (acli)](https://developer.atlassian.com/cloud/acli/guides/how-to-get-started/) and sign in with a [Jira API token](https://id.atlassian.com/manage-profile/security/api-tokens) via `acli jira auth login` as described in the acli docs (site URL, email, token). Do not continue with Jira fetch steps until auth succeeds.

---

### 2. Resolve JQL, then fetch the work items to evaluate

**Input (same turn or immediate follow-up):** The user may give a full `--jql "..."` string (use after a quick sanity check), or **natural language** (e.g. only tickets assigned to me, subtree under epic FCN-100, keys FCN-1 FCN-2, my open stories in fcn). **Translate** that into a single JQL string for `acli jira workitem search --jql "..."`.

**Default JQL** when the user gives no filter hints:

`project=fcn AND status in ('To Do') AND type in (Story, Task, Spike) AND 'Story Points' is empty`

**Common fragments** (combine with `AND`; rename fields if acli/Jira errors—sites differ):

| Intent | JQL (examples) |
|--------|----------------|
| Assigned to me | `assignee = currentUser()` |
| Assigned to someone | `assignee = "user.name"` (or account id) |
| Direct parent | `parent = FCN-100` |
| Epic link (classic) | `"Epic Link" = FCN-100` |
| Hierarchy (some sites) | `issue in childIssuesOf("FCN-100")` or your site’s parent field |

If the ask is **ambiguous** (e.g. “my team’s tickets” with no project), ask **one** short clarifying question before searching.

**Fetch list:**

```bash
acli jira workitem search --jql "<RESOLVED_JQL>" --limit 200 --fields "key,type,summary,description"
```

Add `--json` when you need structured parsing. Use the returned issues as the list to evaluate in later steps.

---

### 3. Classify each issue: spike or deliverable

**Default rule:** Anything that is **not** a spike is a **deliverable** (story/task/bug-style work with shippable outcomes).

**Call it a spike** when any of these is true (use `type`, `summary`, and `description` from the search):

1. **Issue type** is Spike (or the same idea under your site’s type name).
2. **Summary** clearly signals a spike—typically the word **spike** as its own token (e.g. `Spike: …`, `[Spike] …`, “… spike for …”), not incidental substring matches in unrelated words.
3. **Description** frames the work as **timeboxed research** or exploration: investigation, proof of concept, comparing options, feasibility, or answering an unknown—where the intended outcome is **learning or a decision artifact**, not production feature behavior as the main “done.”

If signals **conflict** (e.g. type Story but reads like research), lean on **description + summary** intent; say which rule you used in one short phrase when you report the issue.

Later scoring uses **`SPIKE.md`** for spikes and **`DELIVERY.md`** for deliverables.

---

### 4. Score each issue (1–5)

**Read the rubric** (same folder as this skill) **before** scoring:

| Classification | Rubric file |
|----------------|-------------|
| Deliverable | `DELIVERY.md` |
| Spike | `SPIKE.md` |

For **each** issue, judge it against **every** criterion in the matching file (description/context and AC-style rows for deliverables; spike goals, timebox, artifacts, etc. for spikes).

**Score /5:** **5** = all rubric criteria are **clearly met** for that ticket. Use lower scores when important dimensions are missing, vague, or wrong; use the full range (1–5) so results sort meaningfully.

Briefly **justify** the score: main **gaps** (if below 5) or why it’s strong (if 4–5)—a short paragraph or a few bullets per issue.

---

### 5. Enrich low scores before drafting AC (scores 1–3)

For issues scored **1, 2, or 3** (anything **below 4**), you will draft **suggested acceptance criteria** (deliverables) or **suggested spike goals** (spikes). **First**, pull parent and comment threads so suggestions match epic context and do not ignore existing discussion.

For **each** such issue key:

```bash
acli jira workitem view <KEY> --json -f "parent, comment"
```

Use **`parent`** and **`comment`** together with the issue description when you write suggestions in the next step. Skip re-fetching if you already have equivalent JSON from an earlier step for that key.

---

### 6. Draft suggested AC or spike goals (scores 1–3 only)

For **each** issue still scored **1–3** after step 4, attempt **suggested acceptance criteria** (deliverables) or **suggested spike goals** (spikes), aligned with **`DELIVERY.md`** or **`SPIKE.md`** (concise, testable bullets for delivery; goals, timebox, artifacts flavor for spikes).

**Prior “Suggested …” Jira comments:** From the **`comment`** payload (step 5), check whether any comment body **after trim** starts with **`Suggested Acceptance Criteria`** (deliverables) or **`Suggested Goals`** / **`Suggested Spike Goals`** (spikes). If so, count them and **use those comments as context** (they are part of the story, not a reason to stop). You **still** produce a **new, updated** set of AC or goals in this run, reconciled with description, parent, and repo. In step 7, you **always call out** when such comments already exist (see that step).

**Sources (in order):** the issue **description**, **comments** (including prior suggested AC/goals as above), **parent** (from step 5), and the **workspace repo**—search or read only files that plausibly relate to the ticket (same feature area, config, docs). Use the repo to ground behavior, naming, and edge cases when Jira text is thin.

**Nesting:** Group **related** AC or goals under a parent line when it clarifies structure (loading → errors → success; contract line → sub-outcomes). Follow **`DELIVERY.md` — Grouping & nesting**; each line stays one verifiable outcome—indent with **2 spaces per level**, `*` bullets (see step 7 example).

**Keep suggested AC separable in Ready for review:** In **step 7** output, do **not** mix testable AC with the context lines. After **Why / motivation**, **UI design refs** (and optional Jira disclosure), use **one** parent bullet: * **Suggested acceptance criteria** (deliverables) or * **Suggested spike goals** (spikes), each as a line starting with `*` and bold label. Put **all** new draft acceptance criteria (and their own nested sub-bullets) **only** under that parent, as **sub-bullets** (indented with two more spaces and `*`). Optional coaching (“tighten the story…”, “add parent link…”) is **not** an acceptance criterion—put it in a separate bullet before the parent, e.g. * **Gaps to fix in the story (not AC):** plus a short paragraph or sub-bullets, or omit if redundant with Why/UI lines.

**Do not invent** product behavior. If there is **not enough information** to draft honest, testable AC or credible spike goals, **skip drafting** for that issue and instead state **what is missing** (e.g. unknown user flow, no error strategy, no scope boundary)—one or two bullets so the team can fix the ticket.

---

### 7. Report findings (deliverables, then spikes)

Write the report **in the chat as normal markdown** (do **not** wrap the whole report in a code fence). **Deliverables block first**, then **spikes**. Replace keys and summaries with real values.

**Bucket rules:** Each issue appears in **exactly one** list.

- **Ready for pointing:** score **4 or 5**.
- **Ready for review (1–3):** step 6 produced a draft of suggested AC or goals (or would have, but for missing info). Under the `KEY - Summary` line: (1) context * bullets — **Why / motivation**, **UI design refs** (and spikes: **Why / why now**); (2) optional **disclosure** if prior Jira `Suggested …` comments exist; (3) optional `* **Gaps to fix in the story (not AC):**` for narrative coaching; (4) **one** parent `* **Suggested acceptance criteria**` (deliverables) or `* **Suggested spike goals**` (spikes), then **all** testable AC as **child** * bullets only under that parent. **Do not** put AC as top-level * items beside **Why** or **UI design** (see step 6).
- **Needs review (1–3):** no usable draft in step 6 because of **insufficient information** (not because of a prior Jira comment)— explain what is missing (nested bullets).

Empty subsections: `*None.*`.

**Context checks in the report (not only AC):** These mirror **`DELIVERY.md`** / **`SPIKE.md`**. For **Ready for review**, they go under `KEY - Summary` **before** the `* **Suggested acceptance criteria**` (or `* **Suggested spike goals**`) parent; do **not** interleave them with AC. Optional prior-Jira disclosure and `* **Gaps to fix in the story (not AC):**` sit **after** context lines and **before** the suggested AC / goals parent.

**Deliverables** — two lines, each a nested `*` bullet with **`Met` · `Partial` · `Missing`** (use **`N/A`** only where noted):

1. **Why / motivation** — Is **what** and **why** (problem, driver, why now) clear in the description, per *Description and context* in `DELIVERY.md`? One short clause of evidence or gap.
2. **UI design links** — For **large or complex UI** (new flows, screens, major layout/interaction shifts), is there a **mockup / Figma / prototype / spec** link? Use **`N/A`** when the ticket is **not** that kind of UI work (small tweak, backend-only, copy-only, etc.).

**Spikes** — one line (same style): **Why / why now** from `SPIKE.md` — `Met` · `Partial` · `Missing`, plus a short clause. Add **UI design links** on the same rules as deliverables **only** if the spike is clearly UI-heavy; otherwise **`N/A`** in one line or omit the UI line entirely.

**Shape to reproduce** (headings and italics as shown):

```markdown
## DELIVERABLES

### Ready for pointing/implementation (items scoring 4 or 5)
 - ABC-1 Summary line here
   * **Why / motivation:** Met — problem and driver stated in description
   * **UI design refs:** N/A — not large/complex UI

### Ready for review (items scoring 1–3 with suggested acceptance criteria)
 - FCN-232 - Implement versions in ACM
   * **Why / motivation:** Partial — goal clear; “why now” thin
   * **UI design refs:** Missing — wizard/version control work, no mockup or Figma link
   * **Suggested acceptance criteria**
     * When the Details step is shown, a request is made to load OpenShift version data via the host-provided `versions.fetch` contract.
     * While version data is loading, the OpenShift version control shows a loading or pending state to the user.
       * If loading version data fails, the user sees a clear error state and a way to retry, not a silent empty control.
       * When version data has loaded successfully:
         * The latest version appears only under the Latest grouping in the version control.
         * The default version appears only under the Default grouping in the version control.
         * Other releases appear under the Releases grouping.
         * The default version does not also appear under Releases.
         * The latest version does not also appear under Releases.
     * The wizard does not filter, sort, or drop versions on its own; it renders what the ACM host passes in the `versions` prop (same integration pattern as the related host–wizard contract).

### Needs review (no acceptance criteria)
 - ABC-3 Summary line here
   * **Why / motivation:** Missing — no problem statement or why
   * **UI design refs:** N/A — non-UI ticket
   * Description of what is missing …

## SPIKES

### Ready for implementation (items scoring 4 or 5)
 - SPIKE-99 - Spike summary here
   * **Why / why now:** Met — blocks release decision next sprint

### Ready for review (items scoring 1–3 with suggested spike goals)
 - SPIKE-KEY - Summary line here
   * **Why / why now:** Partial — motivation present, timebox weak
   * **Suggested spike goals**
     * What will be determined: …
     * What will be delivered: …
     * Timebox: …

### Needs review (no spike goals / insufficient spike definition)
 - SPIKE-12 - Another summary
   * **Why / why now:** Missing — cannot tell what decision this unblocks
   * Description of what is missing …
```

**Formatting:** `KEY - Summary` → context * lines → optional * **Gaps to fix in the story (not AC):** → optional Jira **disclosure** * line → **one** parent * **Suggested acceptance criteria** or * **Suggested spike goals** → **only** under that parent, the testable * AC or goals (plus deeper nesting as needed, see FCN-232). **Do not** list AC as * siblings of **Why** or **UI design**. Match **spike vs deliverable** from step 3 in the correct block.

## Posting to Jira (separate skill)

This skill **never** creates Jira comments. After you review the report, if you want **Ready for review** content posted to tickets, **explicitly invoke** the **`acceptance-criteria-write`** skill in a new message (that skill is manual-only and will not run on its own).

