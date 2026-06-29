# Writing style — all sections

Apply to **every registry section** ([TEMPLATE.md](TEMPLATE.md) § Section registry) unless that section’s guide says otherwise.

**Primary audience:** project owners, project managers, and management — plus engineers who need a clear epic summary. Write so a non-technical reader understands **what**, **why**, and **done means what** without reading code or architecture docs.

**Per-section rules:** each guide in [SECTIONS/](SECTIONS/) defines **Owns**, **Does not own**, and **Length target** in **Section metadata** — use those to avoid duplication across sections.

---

## Core rules

| Rule | Meaning |
|------|---------|
| **Concise** | Short sentences. No filler. Cut anything that does not add clarity. |
| **Do not repeat** | Each fact lives in **one** section. If the flow is in Description, AC states outcomes — not the same steps again. |
| **Do not expand** | Use only what the user said, parent/related epics, and verified research. No invented scope, risks, or nice-to-haves. |
| **Do not extrapolate** | No guessing future phases, edge cases, or implementation the user did not mention. Unknowns → ask in discovery ([DISCOVERY.md](DISCOVERY.md) § Completeness gate) or **More information needed** when user explicitly defers. |
| **Plain language** | Prefer user and product terms over engineering jargon in Description and AC. |

---

## Plain language (Description & AC)

**Use:**

- "Users can create a cluster in the console" not "host implements onSubmit handler"
- "Required setup is explained before the wizard starts" not "prerequisites gate component"
- "Cluster creation is submitted and processing begins" not "CRDs are applied to the hub"

**OK to name products and surfaces** the user used (e.g. ACM, ROSA HCP, service account, wizard). **Do not introduce** product or parity targets (e.g. another team's UI) the user did not mention.

**Keep in Implementation notes / Mockups/Design:** npm package names, file paths, CRD kinds, API hosts, Figma URLs, type names — not in Description or AC unless the user explicitly used that term for a business reason.

---

## Before delivering — writing pass

1. Remove sentences that repeat another section (check each guide’s **Owns** / **Does not own**)
2. Replace jargon in Description and AC with plain language
3. Delete anything not traceable to user input, Jira parent/related, or verified research
4. Trim adjectives and hedge words ("comprehensive", "robust", "seamlessly")
5. Confirm a PM could read Description + AC and explain the epic without engineering help
6. Confirm each section’s content fits its **Length target**

---

## Do not

- Pad length to look thorough
- Copy parent epic prose into this epic
- Restate the flow as acceptance criteria line-by-line
- Add AC for quality areas the user never implied (e.g. performance) unless they asked
- Use Implementation notes as a second Description
