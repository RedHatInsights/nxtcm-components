# Acceptance criteria section

Apply when drafting the **Acceptance criteria** registry section ([TEMPLATE.md](../TEMPLATE.md) § Section registry).

## Section metadata

| Field | Value |
|-------|-------|
| **Heading** | `## Acceptance criteria` |
| **Required** | yes |
| **Discovery** | each in-scope piece/item — verifiable outcomes required to close the epic |
| **Breakdown trace** | `AC` (primary trace target — AC1, AC2, …) |
| **Owns** | Each in-scope piece/item — verifiable done conditions |
| **Does not own** | Full narrative, step-by-step flow, link lists |
| **Length target** | **5–10** items for a large epic; **3–6** for a narrow epic |
| **Research feeds** | CRD kinds and apiVersion; existing vs net-new surfaces |

Detail description of each **in-scope individual piece / item** — high-level, **verifiable outcomes** required to **close the epic**, not a sprint task breakdown.

**Audience & style:** [WRITING.md](../WRITING.md) — plain language a PM can verify. Concise. **Do not restate** the Description flow step-for-step.

---

## Format

- Markdown checkbox list: `- [ ] …`
- One in-scope piece or item per checkbox — enough detail to identify the work, not a story title alone
- **5–10 items** for a large epic; **3–6** for a narrow epic
- Nest only when necessary — prefer flat list

---

## What belongs at epic level

| Include | Example |
|---------|---------|
| New navigation / entry point | Route and discoverability from cluster creation flows |
| User-facing screens | Prerequisites, confirmation, error states |
| Integration of shared library | Wizard runs in ACM; required data is loaded and shown |
| Data / auth wiring | Service account is used to load regions, accounts, and other wizard options |
| Submit side effects | Submitted cluster is queued for creation on the hub |
| Non-functional gates | RBAC, error handling, tests at appropriate level |
| Documentation | Operator/admin or team docs updated |

| Exclude (child stories) | Example |
|-------------------------|---------|
| Individual wizard step UI tweaks | "Fix machine pool validation message" |
| Single API endpoint implementation detail | "Add retry with exponential backoff" |
| Per-file refactors | "Extract hook to utils" |

When in doubt, phrase as **observable user or system outcome** with enough specificity to identify the in-scope piece.

---

## AC writing rules

1. **Verifiable** — reviewer can confirm yes/no
2. **Outcome-focused** — "User can …", "Team can …", "Flow handles …"
3. **Plain language** — same terms as Description; technical names only in **Implementation notes** / **Mockups/Design**
4. **Existing vs new** — call out reuse vs net-new when it affects done-ness
5. **Error and auth** — one AC for failures and one for authorization when applicable
6. **Testing & docs** — one AC each only when the user implied them; detailed test approach goes in **Test Plan**
7. **Parent alignment** — this epic’s slice only; no duplicate parent outcomes ([JIRA.md](../JIRA.md))
8. **Related epics** — boundary in **Out of scope** or **Implementation notes**, not a long AC, unless user stated a hard dependency

---

## Categories checklist

Ensure coverage across these when relevant to the epic (not every epic needs every row):

| Category | Prompt |
|----------|--------|
| Discoverability | Can users find and start the flow? |
| Prerequisites | Are preconditions explained before main work? |
| Credential / account | Can user select or create required identity? |
| Core experience | Does the main feature/integration work end-to-end? |
| Data integration | Is external data fetched and shown correctly? |
| Submit / persistence | Are artifacts created and processed downstream? |
| Completion UX | Does user get clear post-submit state? |
| Errors | Are fetch/submit/auth failures handled? |
| Security / RBAC | Are unauthorized users blocked? |
| Quality | Are tests and docs updated? |

---

## Do not

- Duplicate the Description flow — AC are **done conditions** for each in-scope piece, not a second walkthrough
- Use vague criteria ("works well", "is performant")
- Invent scope, CRDs, APIs, or RBAC not from user or research
- Extrapolate extra AC for "best practices" the user did not mention

---

## Section template

```markdown
## Acceptance criteria

- [ ] …
- [ ] …
- [ ] …
```
