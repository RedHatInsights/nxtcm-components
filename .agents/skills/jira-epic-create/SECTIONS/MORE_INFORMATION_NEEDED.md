# More information needed section

Apply when drafting the **More information needed** registry section ([TEMPLATE.md](../TEMPLATE.md) § Section registry).

## Section metadata

| Field | Value |
|-------|-------|
| **Heading** | `## More information needed` |
| **Required** | no — omit entire section when no open questions remain |
| **Discovery** | not used to block drafting — only for user-explicit deferrals or residual ambiguity after gates pass |
| **Breakdown trace** | `MIN` (spike candidates in jira-epic-breakdown) |
| **Owns** | Open questions after deferral or residual ambiguity |
| **Does not own** | Facts that should have blocked drafting |
| **Length target** | **0–5** items; omit section if none |

Open questions and answers that may arise during implementation — **optional** section.

**Style:** [WRITING.md](../WRITING.md) — numbered or bulleted questions; include known partial answers when the user supplied them.

---

## When to include

| Situation | Action |
|-----------|--------|
| User **explicitly deferred** ("TBD", "confirm with X team", "don't know yet") | List each deferred item as an open question |
| Genuine ambiguity remains **after** discovery and drafting | List specific questions — not vague "confirm scope" |
| **No open questions** | **Omit entire section** — do not add filler |

---

## Relationship to discovery gate

This section is **not** a workaround for skipping discovery:

- **Critical facts** needed to write any **Required: yes** registry section → still **discovery-only** turn first ([DISCOVERY.md](../DISCOVERY.md) § Completeness gate)
- **More information needed** is for items that can ship in the epic draft but need follow-up from PM, design, or another team

---

## Format

```markdown
- **Full CRD set on submit?** — User noted `ROSAControlPlane`; provisioning team to confirm companion secrets/kinds.
- **Parity reference URL?** — User asked to align with an existing prerequisites screen; design team to confirm link.
```

Or Q&A pairs when the user partially answered:

```markdown
1. **Which service account roles are required?** — Partial: ROSA installer role documented; cluster-admin on hub TBD with identity team.
```

---

## Do not

- Use `(add link)` or `(add Jira key)` — phrase as a question
- Dump a "placeholders to confirm" footer outside this section
- List questions that should have blocked drafting (missing Figma for UI epic, unknown parent epic, no idea what the feature does)
- Invent open questions for polish

---

## Section template

```markdown
## More information needed

- …
- …
```
