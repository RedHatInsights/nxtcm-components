# Out of scope section

Apply when drafting the **Out of scope** registry section ([TEMPLATE.md](../TEMPLATE.md) § Section registry).

## Section metadata

| Field | Value |
|-------|-------|
| **Heading** | `## Out of scope` |
| **Required** | yes |
| **Discovery** | explicit exclusions — user-stated, parent/related de-dupe, or inferable boundaries |
| **Breakdown trace** | `—` (hard exclusions — jira-epic-breakdown must not slice listed work) |
| **Owns** | Explicit exclusions |
| **Does not own** | In-scope AC restatement |
| **Length target** | **1–8** bullets |
| **Research feeds** | Existing backend/process boundaries verified in code |

What should be **excluded** for this feature — explicit boundaries so implementers and PMs do not assume work belongs here.

**Style:** [WRITING.md](../WRITING.md) — plain language bullets. Ask in discovery when scope boundaries are unclear ([DISCOVERY.md](../DISCOVERY.md) § Completeness gate).

---

## Format

- Bullet list: `- …`
- One exclusion per bullet
- **3–8 items** typical for a large epic; **1–3** for a narrow epic

---

## What to include

| Include | Example |
|---------|---------|
| Work owned by **related epics** | Wizard npm publish (FCN-200); service account UX (FCN-201) |
| **Parent epic** scope handled elsewhere | Full ROSA HCP backend provisioning — existing ACM process |
| **Future phases** user named but deferred | Multi-cloud support; edit-in-place after create |
| **Alternative surfaces** | CLI-only path; same flow in another product the user named |
| **Non-goals** user stated | Performance tuning; redesign of unrelated cluster list |

Phrase as **what is excluded**, not what is included.

---

## Sources

- User-stated exclusions
- Parent/related epic scope from [JIRA.md](../JIRA.md) fetch — de-dupe against this epic's AC
- Verified research (e.g. "provisioning after CRD is existing backend")

---

## Do not

- Repeat acceptance criteria as negated items ("not failing tests")
- Use vague exclusions ("nice-to-haves", "low-priority items")
- Invent out-of-scope items the user never implied
- Hide scope boundaries only in Description — they belong here

---

## Section template

```markdown
## Out of scope

- …
- …
```
