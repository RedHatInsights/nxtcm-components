# Mockups/Design section

Apply when drafting the **Mockups/Design** registry section ([TEMPLATE.md](../TEMPLATE.md) § Section registry).

## Section metadata

| Field | Value |
|-------|-------|
| **Heading** | `## Mockups/Design` |
| **Required** | yes for UI changes — Figma link mandatory when the epic changes UI; N/A or omit for backend-only |
| **Discovery** | Figma link for UI epics; parity reference URL only when user mentioned alignment |
| **Breakdown trace** | `—` (Figma/parity links passed to UI child stories) |
| **Owns** | Figma and design/parity links |
| **Does not own** | Prose design spec, user journey |
| **Length target** | Links + short labels — **1–5** entries |
| **Research feeds** | Doc URLs from code constants (parity) |

Design references for UI work. Official template note: **FIGMA DESIGNS MANDATORY!!!(for UI changes at discretion)**.

**Style:** [WRITING.md](../WRITING.md) — links and brief labels only; no design spec prose.

---

## When required

| Epic type | Action |
|-----------|--------|
| **UI changes** (new screens, flows, layout, visual behavior) | **Figma link required** — ask in discovery if missing ([DISCOVERY.md](../DISCOVERY.md) § Completeness gate) |
| Backend-only, config, docs, or non-visual integration | State **N/A — no UI changes** or omit section with one line: "No UI changes in this epic." |

Use team discretion for borderline cases (e.g. error text only) — when in doubt, ask whether Figma exists.

---

## Format

**Preferred — bullet list with links:**

```markdown
- **Figma — [flow or screen name]:** [link](https://www.figma.com/…)
- **Parity reference — [screen or doc name]:** [link](https://…) — only when user confirmed mirroring an existing UI or doc
```

**When multiple artifacts:**

```markdown
| Artifact | Link |
|----------|------|
| Figma — Create cluster flow | [link](https://www.figma.com/…) |
| Parity — prerequisites screen | [link](https://…) |
```

---

## What to include

| Priority | Reference type |
|----------|----------------|
| 1 | **Figma** — primary design for this epic's UI |
| 2 | Parity references (existing screen, CLI, or doc) — **only when user mentioned alignment** and URL is confirmed |
| 3 | Parent or related epic design links when fetched from Jira and relevant |

---

## Link rules

- Use **full URLs** — only when user provided or research verified
- **Missing Figma for a UI epic** → ask in discovery; do **not** deliver `(add Figma link)` in the epic
- Do not invent design links

---

## Do not

- Describe pixel-level or component-level design in prose — point to Figma
- Duplicate Description flow as a design walkthrough
- List every mockup frame — link to the epic-relevant file or page

---

## Section template

```markdown
## Mockups/Design

[FIGMA DESIGNS MANDATORY!!!(for UI changes at discretion)]
```
