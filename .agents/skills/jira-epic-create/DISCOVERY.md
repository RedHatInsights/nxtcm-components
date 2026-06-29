# Discovery — gather epic context

Collect enough context to draft without guessing. Prefer **conversation history**, **open files**, and **named repos** before asking questions.

**All facts must be resolved before drafting required registry sections.** If the user did not supply something a **Required: yes** section needs, the response is **discovery-only** — no epic draft ([SKILL.md](SKILL.md) §0).

**Section facts:** read [TEMPLATE.md](TEMPLATE.md) § **Section registry** — for each row where **Required** is **yes** (or **yes for UI changes** when UI is in scope), open the **Guide** and collect every item in that file’s **Discovery** field.

---

## Discovery gate (mandatory — hierarchy)

Run this **before** repo research, Jira fetch, or drafting when parent/related are unknown.

### Resolved?

Parent / related are **resolved** only when the user, in this thread:

- Named issue key(s), **or**
- Explicitly said **“none”**, **“no parent”**, **“standalone”**, or **“no related epics”** for that slot

**Not resolved** = user gave rich product detail but never mentioned hierarchy. **Do not** treat silence as “standalone.”

### If not resolved → discovery-only turn

| Do | Do not |
|----|--------|
| Acknowledge what you understood (1–2 sentences) | Output any registry section heading or paste-ready epic |
| Ask parent + related questions ([§ Ask — parent and related epics](#ask--parent-and-related-epics-mandatory)) | Run repo research or subagents |
| Use **AskQuestion** when the tool is available | Fetch Jira (no keys yet) |
| Ask other **unresolved** gaps in the same message if known | Use `(add …)`, `TBD`, or “confirm later” in required sections |

**Wait for the user’s reply.** Draft only on a **later turn** after hierarchy is resolved.

### If resolved → continue

Proceed with checklist below, [JIRA.md](JIRA.md) fetch (when keys exist), [RESEARCH.md](RESEARCH.md), then [§ Completeness gate](#completeness-gate-mandatory--before-drafting).

---

## Completeness gate (mandatory — before drafting)

Run **after** research and **before** writing any epic section.

### Audit

For each registry row where **Required** is **yes** (or **yes for UI changes** when the epic changes UI):

1. Open the **Guide** file.
2. List every fact that section will use (from its **Discovery** field and draft rules).
3. Confirm each fact’s source is one of:

| Source | OK? |
|--------|-----|
| User stated in this thread | Yes |
| Fetched parent/related Jira | Yes |
| Verified repo research (path, type, doc URL found in code) | Yes |
| Would require guessing or a placeholder in a **required** section | **No — ask first** |

### Common gaps — ask specifically

| If epic would say… | Ask the user (example) |
|--------------------|-------------------------|
| Parity with another UI / doc (user mentioned mirroring or alignment) | Which screen, route, or doc is the parity target? Paste link or path. |
| Submit creates CRDs / resources | Which resources are created on submit? List kinds or point to the template/team doc. |
| Existing process picks up work | What process or component provisions after submit? |
| Out of scope | What is explicitly **out** of this epic? |
| **UI changes without Figma** | Paste Figma link for this flow — required for UI epics. |
| Parent / related epic | Keys or “none” ([§ Ask — parent and related epics](#ask--parent-and-related-epics-mandatory)) |
| Product behavior unclear | What should happen when …? |

One **discovery-only** message may combine hierarchy + other gaps. Number each question.

### If any gap remains (blocks required sections)

| Do | Do not |
|----|--------|
| Stop; ask each open item by name | Deliver required registry sections with holes |
| Wait for answers | Add a “Placeholders to confirm” section after the epic |
| Re-run this gate after user replies | Guess URLs, CRD names, Figma links, or scope |

### User deferral

Only when the user **explicitly** defers in chat (“TBD”, “skip”, “don’t know yet”, “confirm with X team”):

- Record in **[More information needed](SECTIONS/MORE_INFORMATION_NEEDED.md)** — phrase as an open question
- **Mockups/Design** — if Figma deferred on UI epic, list in More information needed; do not use `(add Figma link)`
- **Implementation notes** — one bullet with their exact deferral when partial technical context is known
- **AC** — do not write vague criteria; omit or narrow until confirmed

Deferral is **user-stated**, not agent-invented. Deferred items do **not** unblock missing facts for **required** sections unless the user explicitly said to draft anyway with open questions.

---

## Required inputs (cross-section)

These span multiple registry sections — see each guide’s **Discovery** field for section-specific detail.

| Input | Registry sections |
|-------|-------------------|
| **What** | Description |
| **Why** | Description |
| **End-to-end flow** | Description |
| **Acceptance outcomes** | Acceptance criteria |
| **Out of scope items** | Out of scope |
| **Test approach** | Test Plan |
| **Figma (UI epics)** | Mockups/Design |
| **Parent epic** | Description, Implementation notes — **gate: ask if not provided** |
| **Related epics** | Out of scope, AC boundaries — **gate: ask if not provided** |

“Not provided” means the user did not name keys **and** did not explicitly say there is no parent or no related epics.

---

## Strongly recommended

| Input | Registry sections |
|-------|-------------------|
| **Why this system** (vs CLI, external tool, other product) | Description |
| **Consumer app** (e.g. ACM console) | Implementation notes |
| **Library / package** (e.g. npm wizard) | Implementation notes |
| **Auth / data boundary** (e.g. service account → API) | Description, AC, Implementation notes |
| **Submit / side effects** (CRDs, API calls, jobs) | Description, AC, Implementation notes |
| **Parity target** (**only when user mentioned**) | Mockups/Design, Description |
| **Existing vs net-new** | AC |

---

## Infer before asking

Check in order:

1. **Current conversation** — user may have already described flow, why, and scope
2. **Named workspace paths** — e.g. `console-acm`, `nxtcm-components`
3. **Open / recently viewed files**
4. **Git branch or ticket key** in prompt
5. **Parent / related epic keys** in prompt or thread — if present, gate passes for that slot

**Infer product detail freely; do not infer Jira hierarchy or Figma links.**

---

## Ask — parent and related epics (mandatory)

If the user did **not** supply parent or related epic information, **stop and ask** — do not skip silently and do not draft first.

### Prefer AskQuestion

When **AskQuestion** is available, use it for structured answers:

**Question 1 — Parent epic**

- Prompt: *Is there a parent epic (initiative or epic) this work rolls up under?*
- Options (example): `Yes — I’ll paste the key in chat` | `No — standalone epic` | `Not sure yet`

**Question 2 — Related epics**

- Prompt: *Are there related epics the team should align with (dependencies, parallel tracks, shared scope)?*
- Options (example): `Yes — I’ll paste key(s) in chat` | `No related epics` | `Not sure yet`

If the user picks “I’ll paste the key,” wait for keys in chat before drafting.

### Fallback (no AskQuestion)

One short message — **only** discovery, no epic body:

> I have enough to draft the epic once hierarchy is clear:
>
> 1. **Parent epic** — issue key, or “none / standalone”?
> 2. **Related epics** — issue key(s), or “none”?
>
> Optional: paste keys like `FCN-100` and I’ll pull context from Jira before drafting.

Proceed to [JIRA.md](JIRA.md) fetch when keys are given. Record “no parent” / “no related” when user says none.

Do **not** ask again if the user already answered in the same thread.

---

## Ask — other gaps (mandatory when unresolved)

Use **AskQuestion** or a numbered list whenever the [Completeness gate](#completeness-gate-mandatory--before-drafting) audit finds a gap. Include in the **same discovery-only message** as parent/related when both are open:

| Gap | Example question |
|-----|------------------|
| No clear **what** | What is the single sentence outcome of this epic? |
| No **why** | What user pain or release driver motivates this? |
| No **flow** | Walk through the steps from entry point to done state |
| Ambiguous **scope** | What is explicitly out of scope for this epic? |
| **UI epic, no Figma** | Paste the Figma link for this flow (required for UI changes). |
| Unknown **submit behavior** | What happens when the user finishes — which resources or APIs? |
| Unknown **downstream process** | What existing process picks up the work after submit? |
| Vague **parity target** (user asked to mirror or align, link unclear) | Which screen, route, CLI flow, or doc should we align with? Paste link or path. |
| Unconfirmed **artifacts** | Which CRDs, secrets, or other resources are created on submit? |
| No **test expectations** | Any required test levels (e2e, component, manual) or CI gates? |

Do **not** ask for information already provided in the same thread.

Do **not** draft and list these as “placeholders to confirm” — ask **before** the epic body exists.

## Discovery checklist

Before drafting, confirm internally:

- [ ] **Hierarchy gate passed** — parent and related each have keys **or** explicit “none”
- [ ] **Completeness gate passed** — no unresolved gaps in any **Required: yes** registry section
- [ ] Epic title or working name is clear (use user's wording)
- [ ] WHAT and WHY can be stated in plain language
- [ ] Flow has ordered steps (user + system)
- [ ] **Out of scope** can be listed — user confirmed or inferable from parent/related
- [ ] **Test Plan** can be drafted from user input or repo norms
- [ ] **Figma** provided or epic confirmed non-UI
- [ ] Know what exists vs must be built
- [ ] Know integration boundaries (who owns routing, API, UI shell vs library)
- [ ] **Parent epic** — key fetched or confirmed none
- [ ] **Related epics** — keys fetched or confirmed none
- [ ] **Parity** — only when user mentioned mirroring or alignment; link confirmed, not invented
- [ ] **Submit / scope** — confirmed by user or verified research, not invented

**Do not ask about parity, mirroring, or aligning with another product's UI unless the user mentioned it in this thread.** Do not default to any specific product (e.g. OCM) in discovery questions.

If any checklist item fails → **discovery-only response** with specific questions. Do not draft.

## Discovery-only response shape (example)

```markdown
I can draft the epic once a few items are clear:

1. **Parent epic** — key, or standalone?
2. **Related epics** — key(s), or none?
3. **Figma** — link for this flow (required for UI changes).
4. **Out of scope** — anything explicitly excluded beyond related epics?

Include additional questions only when the user's prompt or research already implies them — e.g. submit resources when submit behavior is in scope but kinds are unknown; parity link when the user said to mirror an existing screen but did not paste the URL.

[AskQuestion UI when available]
```

**Wrong:** full epic body with registry headings + “placeholders to confirm” at the bottom.

**Wrong:** Mockups/Design row `| Figma | (add link) |` without having asked first.
