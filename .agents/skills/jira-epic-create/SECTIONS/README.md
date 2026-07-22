# SECTIONS — epic section guides

One markdown file per epic section. The skill discovers sections from [TEMPLATE.md](../TEMPLATE.md) § **Section registry** — it does **not** assume a fixed set of headings beyond what the registry lists.

**Bundled defaults:** `DESCRIPTION.md`, `ACCEPTANCE_CRITERIA.md`, `MOCKUPS_DESIGN.md`, `OUT_OF_SCOPE.md`, `TEST_PLAN.md`, `IMPLEMENTATION_NOTES.md`, `MORE_INFORMATION_NEEDED.md`. Teams may add, rename, or remove sections to match their epic template.

---

## What each section file defines (authoritative source)

Each section file’s **Section metadata** and body rules define:

- **Heading** — exact Jira `##` line used in the assembled epic
- **Required** — whether missing facts block drafting ([DISCOVERY.md](../DISCOVERY.md) § Completeness gate)
- **Discovery** — facts this section needs before drafting
- **Breakdown trace** — code used by **jira-epic-breakdown** (`AC`, `IN`, `TP`, `MIN`, or `—`)
- **Owns / Does not own** — duplication boundaries ([WRITING.md](../WRITING.md))
- **Length target** — typical size
- **Research feeds** (optional) — repo findings that belong in this section

Orchestration files (`SKILL.md`, `DISCOVERY.md`, `WRITING.md`, etc.) **delegate** to the registry and section files — they do not hard-code section names.

---

## Discovery

Before draft, assemble, or quality-check:

1. Read [TEMPLATE.md](../TEMPLATE.md) § **Section registry** in **Order** column sequence.
2. For each registry row, open the **Guide** file.
3. Read **Section metadata** at the top of each guide.
4. Draft using that file’s rules; omit optional sections when metadata says to omit empty sections.

**Exclude** `README.md` from section discovery — it is orchestration docs, not a section.

---

## Adding a section

1. Copy [SECTION_SKELETON.md](SECTION_SKELETON.md) to a new file (e.g. `RISKS.md`).
2. Fill in **Section metadata** and section body rules.
3. Add a row to [TEMPLATE.md](../TEMPLATE.md) § **Section registry** (set **Order**, **Heading**, **Guide**, **Required**).
4. Add the heading block to [TEMPLATE.md](../TEMPLATE.md) § **Template** skeleton (optional but recommended for paste preview).
5. No changes to [SKILL.md](../SKILL.md) are required — the skill picks up the new section on the next run.

**jira-epic-breakdown:** If **Breakdown trace** is not `—`, decomposition will parse and trace that section automatically via the same registry.

---

## Removing a section

1. Delete the registry row from [TEMPLATE.md](../TEMPLATE.md) § **Section registry**.
2. Remove the heading from [TEMPLATE.md](../TEMPLATE.md) § **Template** skeleton if present.
3. Delete the guide file from `SECTIONS/`.
4. No changes to [SKILL.md](../SKILL.md) are required.

---

## Renaming a heading

1. Update **Heading** in the section file’s metadata.
2. Update **Heading** in the registry row.
3. Update the skeleton in [TEMPLATE.md](../TEMPLATE.md) § **Template**.

**jira-epic-breakdown** follows the registry — no separate parser edit needed when headings change.

---

*Originally created by Kim Doberstein.*
