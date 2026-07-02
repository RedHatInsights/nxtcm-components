# Discovery — epic input

Collect the epic to decompose and any constraints. Prefer **conversation history** before asking.

---

## Required

| Input | Used for |
|-------|----------|
| **Epic content** | Jira **key**, or **pasted** Description + Acceptance criteria (minimum) |

If neither key nor pasted epic → **ask**:

> Which epic should I break down? Provide a Jira key (e.g. `FCN-123`) or paste the epic Description and Acceptance criteria.

---

## Optional

| Input | Used for |
|-------|----------|
| Repo paths | Sharper task boundaries ([DECOMPOSE.md](DECOMPOSE.md)) |
| Team constraints | "Frontend vs backend split", "spike first for X" |
| Output depth | Summary table only vs full ticket bodies (default: **both**) |
| Skip draft review | User says **breakdown only** — skip [REVIEW.md](REVIEW.md); deliver table + bodies without review flags |
| Exclude types | e.g. "no spikes" — honor unless epic has genuine research unknowns |
| Existing child issues | **Only when user asks** to dedupe — not by default ([JIRA.md](JIRA.md) § Existing children) |

---

## Infer before asking

1. **Same thread** — epic body from **jira-epic-create** in this conversation
2. **Jira key** in prompt or branch name (`FCN-123`, `FCN-1234-rosa-hcp`)
3. **User pasted** markdown with registry section headings from [jira-epic-create/TEMPLATE.md](../jira-epic-create/TEMPLATE.md) — at minimum **Description** and **Acceptance criteria**

---

## Discovery checklist

Before decomposing:

- [ ] Epic Description and AC are available (fetched or pasted)
- [ ] Epic AC extracted as a traceable checklist
- [ ] All registry sections with **Breakdown trace** ≠ `—` parsed when present ([JIRA.md](JIRA.md) § Parse epic description)
- [ ] **Out of scope** (trace `—`) honored — exclusions not re-sliced
- [ ] User constraints noted (if any)
- [ ] Draft review: **on** (default) unless user asked for **breakdown only**
- [ ] **Epic key** recorded when known — required before §7 Jira create ([SKILL.md](SKILL.md) §7)

If epic AC is missing or empty, ask whether to decompose from Description only or wait for AC.

---

## Do not

- Break down without epic text or key
- Assume epic key from branch without user confirmation when ambiguous
