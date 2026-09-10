# Writing style — child tickets

Same rules as **jira-epic-create** [WRITING.md](../jira-epic-create/WRITING.md):

- **Concise** — tight lines, no filler
- **Do not repeat** — epic flow lives in epic; child ticket covers **this slice only**
- **Do not expand or extrapolate** — only epic content + necessary slice detail
- **Plain language** — PM-readable Description; jargon in Implementation notes only when needed

---

## Child ticket vs epic

| Epic owns | Child ticket owns |
|-----------|-------------------|
| Full journey, full AC set, Out of scope, Test Plan | One slice WHAT/WHY + slice AC |
| Platform rationale | One-line link to epic in Description ("Part of `<EPIC-KEY>`") |
| Mockups/Design (Figma) | Figma link only when this slice needs it |
| Implementation notes (repos, packages) | Only references **this slice** needs |

Do **not** paste the epic Description into every child.

---

## Length targets (per child)

| Section | Target |
|---------|--------|
| Description (WHAT + WHY) | **2–4 sentences** |
| Acceptance criteria (story/task) | **3–6** bullets |
| Spike outcomes | **2–4** bullets + timebox line |
| Bug repro | **3–6** numbered steps |

---

## Epic link line

Start each child Description with one line when epic key is known:

```markdown
Part of epic [<PROJECT>-123 Summary](https://<JIRA-SITE>/browse/<PROJECT>-123).
```

---

## Before delivering

1. Each ticket readable alone without the others
2. No duplicate bullets across sibling tickets
3. AC verifiable for **this slice only**
4. PM can explain each item in one sentence

See also [GENERAL.md](../jira-acceptance-criteria-check/GENERAL.md).
