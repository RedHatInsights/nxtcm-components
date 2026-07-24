# Open questions — bot suitability

Apply when evaluating criterion slug **open_questions** (this file).

## Criterion metadata

| Field | Value |
|-------|-------|
| **Slug** | `open_questions` |
| **Definition** | Whether **lingering questions** or **missing required information** must be resolved before a bot can move forward autonomously — product, design, architecture choices not settled, or deliverable content (URLs, copy, commands) not supplied. |
| **Weight hint** | **Critical** unanswered questions or **missing required information** cap holistic score at **3**. |

---

## What to look for

| Source | Questions that block bots |
|--------|---------------------------|
| **Ticket body** | “TBD”, “need PM input”, “which approach?”, multiple valid implementations |
| **Comments** | Open threads, unanswered @mentions, “blocked on design” |
| **AC gaps** | Conflicting requirements; “or” branches with no default |
| **External deps** | Missing API contract, feature flag name, config value, or credentials |
| **External references** | “Use URL from [external system] / match [design tool] / see [chat tool]” without URL, key, screenshot, or pasted content in ticket or thread |
| **Deliverable content** | Required URL, copy, CLI command, or message text not in ticket when expected outcome depends on it |
| **Design** | UI change with no mockup when layout/flow is non-obvious |
| **Repo** | Ticket assumes behavior that code does not support — needs decision |
| **Ticket gaps** | Explicit “Gaps”, “TBD”, “not confirmed”, or “look at X for Y” without Y supplied |

**Resolved in thread:** If comments **answer** the question with a clear decision, do **not** count it as open.

**Implicit questions:** Flag when a bot would **stop and ask a human** mid-implementation — even if the ticket never literally says “?”.

---

## Scoring

Rate **open questions only** from 1–5 (higher = **fewer** blocking questions — better for bot success).

### Weak vs strong

| Rating | Signals |
|--------|---------|
| **5** | No material open questions; decisions documented in ticket or resolved comments. |
| **4** | No **required** inputs missing; at most optional polish or internal detail unclear |
| **3** | One **required** value absent (URL, copy, command, parity source) — bot may guess wrong |
| **2** | Multiple open decisions or an explicit blocker in comments. |
| **1** | Work is blocked pending PM/design/architecture; ticket is a placeholder. |

### Question severity (for notes)

| Severity | Treat as |
|----------|----------|
| **Critical — missing information** | Required URL, copy, command, design ref, or parity source absent — **caps holistic score ≤ 3**; bot must not guess |
| **Critical — decision** | Product/design/architecture choice with no documented default — **caps holistic score ≤ 3** |
| **Minor** | Optional polish, internal naming, or logging — note but may still score 4–5 **only if** all **required** deliverable content is present |

**Always list specific open questions and missing information in the `blockers` field** ([REPORT.md](../REPORT.md)) when this criterion rates ≤ 3. Be concrete:
- ✓ "Missing: URL for learn more link from system X"  
- ✓ "Open: which validation rules apply?"  
- ✗ "needs more information" (too vague)

### Missing information (required for done)

Treat as **critical** when the **expected outcome** requires facts not present in the ticket, enriched comments, or repo evidence — where a bot would **guess, invent, or pull from an unstated external source**:

| Missing input | Examples | This criterion rating | Holistic cap |
|---------------|----------|----------------------|--------------|
| **External reference not supplied** | “Use URL from system X”, “match design Y”, “see discussion in Z”, “same as prod” with no link, path, or pasted content | **≤ 3** | **≤ 3** |
| **Deliverable content not specified** | Required URL, user-facing copy, CLI command, error message, config value, API field name | **≤ 3** | **≤ 3** |
| **Correctness unverified** | Ticket flags command/copy as uncertain; parity source not provided | **≤ 3** | **≤ 3** |
| **Explicit gap in ticket** | “Gaps”, “TBD”, “need PM”, “not confirmed” on something needed for done | **≤ 3** | **≤ 3** |
| **Product/design choice** | Multiple valid UX or architecture paths with no default | **≤ 2** | **≤ 3** (often **2**) |
| **Remediation undefined** | Error state with no command or steps | **≤ 2** | **≤ 2** |

**Does not count as missing** (may still rate 4–5 on this criterion):

- Boilerplate wiring when ticket fully specifies behavior and values
- Test/lint commands from repo standards
- File paths discoverable by search when behavior is fully specified
- Naming/style when ticket says “follow existing pattern” and a clear neighbor exists **for the same kind of content** (not a different deliverable)

**Common mistake:** “Repo has `ExternalLink` + `links.ts`” does **not** mean a **specific** URL from another system (external portal, prod, design doc) is present. Structural clarity ≠ complete information.

**Rating 4** on this criterion means the bot can finish with **light review**, not “one URL left to confirm.” If a human must supply a missing URL, copy block, or command before merge, rate this criterion **3 or lower**.

### Calibration examples

| Rating | Example |
|--------|---------|
| **5** | AC specifies behavior; Figma linked; comment thread confirms API field mapping. |
| **4** | All URLs, copy, and commands needed for done are in ticket or repo; only optional wording tweak possible. |
| **3** | “Use Learn more link — get URL from system X” — link text clear, **URL missing**. |
| **3** | “Use new validation rules” — rules not specified. |
| **3** | “Clarify help text” — intent clear, **proposed copy not supplied**. |
| **2** | Comment: “Waiting on UX for empty state.” |
| **2** | Missing error remediation — no command or procedure provided. |
| **1** | “Spike outcome: pick approach A or B” with no decision. |

---

## Related

Ticket enrichment: [JIRA.md](../JIRA.md) § Enrichment.
