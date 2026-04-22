# Acceptance criteria check report

**Date:** 2026-04-22  
**JQL (default):** `project=fcn AND status in ('To Do') AND type in (Story, Task, Spike) AND 'Story Points' is empty`  
**Issues found:** 31

**Fetch notes:** Use `acli jira workitem search` with `--fields issuetype,...` (not `type`) for this site. `acli jira auth status` may need network access if the CLI cannot reach Jira. No Jira `Suggested …` comments were present on fetched parent/comment payloads (empty comment threads).

**Classification (spike vs deliverable):** Treated as **spikes** — FCN-218 (summary **SPIKE**), FCN-96 (**[SPIKE]** in title), FCN-227 (description says “Spike” and frames timeboxed research). Treated as **deliverables** — everything else, including FCN-231 / FCN-229 (strategic “define / plan” work with product outcomes, not a Spike issue type or spike phrasing in the title).

**Scoring:** Judged each issue against `DELIVERY.md` or `SPIKE.md`. Suggested AC for empty tickets are grounded in epic parents and sibling stories (e.g. FCN-232/233) and are not verified against application code in this workspace.

To post **Ready for review** content to Jira, use the `acceptance-criteria-write` skill in a new message; this file is documentation only.

---

## DELIVERABLES

### Ready for pointing/implementation (items scoring 4 or 5)

- FCN-217 - Implement data ownership handoff between wizard form and YAML review step
- FCN-336 - Integrate Cost Management widget
- FCN-335 - Integrate Clusters by Provider widget
- FCN-233 - Implement versions in OCM
- FCN-232 - Implement versions in ACM
- FCN-208 - Update react-form-wizard WizSelect component
- FCN-45 - [UXD] Create final approved UXD designs
- FCN-54 - [Research/Documentation] Determine expirations around support, SLA etc

**Rationale (4s):** Solid **context + testable** AC, or a clear process AC set; main gaps are **Figma/placeholder links** stripped in export (208), or **open implementation questions** left unresolved (232/233). FCN-217 is the only **5** here: ownership, error handling, and merge loop are specced end to end with dependencies called out.

---

### Ready for review (items scoring 1–3 with suggested acceptance criteria)

- FCN-245 - Prerequisites page for ACM
  * **Why / motivation:** Missing — no description; parent epic is **[Phase 4] Integration of wizard into ACM (FCN-43).**
  * **UI design refs:** Missing — if this is a new wizard page, a mockup or Figma is needed before implementation.
  * * **Suggested acceptance criteria**
    * A **Prerequisites** step (or page) in the ACM-hosted wizard is reachable in the same navigation pattern as the other install/create steps, and the user can move **next/back** per existing wizard rules.
    * The step surfaces prerequisite content **driven by the host** (e.g. copy, links, optional checklist) so ACM can supply org-specific or environment-specific text without a hard fork of the module.
    * If prerequisite data (or a host callback) is loading, the user sees a **clear loading** state; on failure, a **clear error** and a **retry** or path back (aligned with the host’s error pattern).
    * When prerequisites are not satisfied, the user **cannot** proceed to cluster creation, with messaging that states **what** is missing or **where** to fix it, without silent failure.
    * E2E or high-level test (or agreed CT) proves the step appears in flow and gating/validation behaves as above.

- FCN-246 - AWS infrastructure account and billing account api calls
  * **Why / motivation:** Missing — no description; parent **FCN-43** (Phase 4 ACM wizard).
  * **UI design refs:** N/A — **contract/API** slice unless PM confirms a dedicated sub-step UI.
  * * **Suggested acceptance criteria**
    * **Infrastructure account:** a fetch module calls the OCM/ACM-appropriate API(s) to resolve the infrastructure account the wizard needs, with **search/limit** query params as required so the response set stays bounded.
    * **Billing account:** a fetch module resolves the billing account (or list for selection) per the same integration rules as OCM/ACM today.
    * The wizard (or host) can surface **loading**, **empty**, and **error** for each call, with a **retry** that re-invokes the fetch.
    * Returned values are **mapped** into the wizard’s existing form/contract shape (field names, ids) and stay **in sync** when the user changes account inputs upstream.
    * The implementation does not invent new API shapes on the client without an agreed **OpenAPI/contract** link in the story or a pointer to the backend design doc.
    * Automated tests cover success and a representative error path for at least one of the two fetches (where the test harness can mock).

- FCN-247 - Regions api call
  * **Why / motivation:** Missing — no description; parent **FCN-43**.
  * **UI design refs:** N/A — data slice for region dropdown/selector (unless a new region UI is in scope).
  * * **Suggested acceptance criteria**
    * A **regions** data loader returns the set of regions available for the current subscription/account context, with correct **filtering** (e.g. only regions valid for the cluster type) per backend rules.
    * The UI shows **loading** and **error**; on error the user can **retry** or is clearly blocked with an explanation.
    * **Empty** region set is not presented as a silent blank control; the user sees an explicit “no regions available” state.
    * The selected region is stored in wizard state in the shape **FCN-248** (and related stories) can consume for downstream API calls.
    * Tests or mocks assert at least one happy path and one failure path for the fetch.

- FCN-248 - Cluster name validation api call
  * **Why / motivation:** Missing — no description; parent **FCN-43**.
  * **UI design refs:** N/A — field validation.
  * * **Suggested acceptance criteria**
    * **Validation** is triggered per UX rules (e.g. on **blur** and/or on **submit**), and invalid names show **inline** feedback; the form **cannot** submit on invalid name.
    * While validation is in flight, the field (or form) is in a **validating/loading** state; concurrent validation requests are **deduplicated** or cancelled so the latest input wins.
    * Server-side errors (4xx/5xx) are surfaced to the user with a **message** and, where applicable, **retry**.
    * Acceptable name rules (length, charset, reserved names) are whatever the **API** returns, reflected in the message, not re-hardcoded in conflict with the service.
    * A test covers success, a known **invalid** name, and a **server error** response.

- FCN-249 - Versions api call
  * **Why / motivation:** Partial — FCN-232/233 give full intent; this ticket is only the **fetch** slice, but the body is empty; parent **FCN-43**.
  * **UI design refs:** N/A — or link the same Figma as the version step if PM treats this as the same design surface.
  * * **Gaps to fix in the story (not AC):** De-dupe with **FCN-232** or narrow this to “**API client only** that 232 wires up.”
  * * **Suggested acceptance criteria**
    * A `versions` fetch (or service module) calls the version endpoint with a **search/limit** so a huge history is not pulled at once, matching the note on **FCN-232/233**.
    * Response data maps to the `versions` prop contract (default, latest, releases) including **exclusions** (default/latest not duplicated in `releases`, support channel, minor/patch window as in **FCN-232/233** or as agreed in this ticket).
    * **isFetching** / **error** / `fetch` retry behavior matches the version dropdown UX on the Details step.
    * Unit or integration test covers at least a filtered response and an error.

- FCN-250 - VPCs api call
  * **Why / motivation:** Missing; parent **FCN-43**.
  * **UI design refs:** N/A — data for VPC selection unless design says otherwise.
  * * **Suggested acceptance criteria**
    * Lists VPCs (and subnets if in scope) for the selected **region** and **account** context, with the correct **query** parameters the backend requires.
    * **Loading** / **error** / **empty** states are explicit; user can **retry** on error.
    * If the list is **paginated**, the loader follows the same pagination pattern as other org-wide lists in the feature (e.g. Expired Trials card) until all relevant pages for the wizard are loaded, or a documented cap is applied.
    * **Tests** for happy path, empty VPC list, and API failure.

- FCN-251 - OIDC api call
  * **Why / motivation:** Missing; parent **FCN-43**.
  * **UI design refs:** N/A — unless the OIDC step is a new screen (then add design link).
  * * **Suggested acceptance criteria**
    * Fetches and validates OIDC/IdP data required by the wizard (per integration spec) with clear **error** and **empty** states.
    * If validation is two-phase (e.g. resolve IdP, then test), the UI reflects **in-progress** and **per-field** errors from the server.
    * **Secrets** and redirect URIs are not logged in the browser console in production.
    * Tests (mocked) for success, validation failure, and service error.

- FCN-252 - Machine types api call
  * **Why / motivation:** Missing; parent **FCN-43**.
  * **UI design refs:** N/A.
  * * **Suggested acceptance criteria**
    * Loads **machine types** (and GPU/accelerated variants if applicable) for the current region/AZ/role selection.
    * **Deselect/invalid** if the user changes region: previously selected type is cleared or revalidated with a visible message.
    * **Loading** / **error** / **empty**; **retry** for failures.
    * **Tests** for a filtered set and a failure.

- FCN-253 - Security groups api call
  * **Why / motivation:** Missing; parent **FCN-43**.
  * **UI design refs:** N/A.
  * * **Suggested acceptance criteria**
    * Loads **security groups** in the right VPC/region context (query params per backend contract).
    * User-visible **error** and **retry**; empty list is explained (e.g. need different VPC) where the API does not return SGs.
    * Selection maps into wizard state for the **Review/YAML** step and does not get lost on navigation **back/forward** within the wizard.
    * Tests for list load, empty, and error.

- FCN-254 - Cluster updates api call
  * **Why / motivation:** Missing; parent **FCN-43**.
  * **UI design refs:** N/A.
  * * **Suggested acceptance criteria**
    * Fetches **update channel / available updates** (or what your API names this) for the target cluster in context, with the correct product/version filters.
    * Respects any **entitlement** or “no updates” cases with a user-visible state.
    * **Loading** / **error** / **retry**; no silent empty list when the API errored.
    * Documented handoff to **FCN-218** / long-term “cluster update strategy” (this ticket is the **wiring** only, not full strategy).
    * Tests: success, no updates, API failure.

- FCN-243 - Add unit test coverage
  * **Why / motivation:** Partial — title only; parent **FCN-224 (react-form-wizard)**; **FCN-238** uses **FCN-41** — confirm which **package** this story targets in the body.
  * **UI design refs:** N/A.
  * * **Suggested acceptance criteria**
    * **Target module(s)** are named (e.g. which directories under the wizard library) and a **minimum bar** is agreed (e.g. lines/branches, or “all public `exports` with smoke tests”).
    * New or expanded tests run in **CI** and fail the pipeline on missing coverage or flaky runs (per team norm).
    * A short **summary** in the PR of what was untested before and what now has coverage.
    * No **drop** in existing test pass rate; known gaps are **listed** in the story or a linked doc.
    * If the scope is **nxtcm vs upstream** (see **FCN-205/206**), the story points to a single **source of truth** branch so the same tests apply after port.

- FCN-238 - Refactor drawer for roles creation commands
  * **Why / motivation:** Missing — no description; parent **FCN-41 ([Phase 1] ROSA HCP wizard module)**.
  * **UI design refs:** Missing — if the drawer changes layout or flows, add design reference.
  * * **Gaps to fix in the story (not AC):** Add problem statement: what is wrong with the current **roles** drawer and what user/dev pain is removed.
  * * **Suggested acceptance criteria**
    * **Roles/creation** commands are exposed in the refactored drawer in a way that matches the **agreed** UX (structure, order, and discoverability) from design or a linked wireframe.
    * **No regression** in existing create-flow behavior covered by current tests; new or updated **CT/E2E** for the main paths.
    * **A11y:** focus order, **keyboard** use, and **labels** meet the same bar as the rest of the wizard.
    * **Code split / bundle impact** is neutral or **documented** if the drawer is lazy-loaded.
    * Clean-up: dead code from the pre-refactor drawer is **removed** or ticketed with keys.

- FCN-320 - Implement coderabbit config
  * **Why / motivation:** Partial — value of **CodeRabbit** and extending **Red Hat Insights** org config is stated, but the repo, base file, and “done” are not.
  * **UI design refs:** N/A.
  * * **Gaps to fix in the story (not AC):** Add link to the **“good config file”** repo and target **this** repo’s path (e.g. `.coderabbit.yaml`); confirm with Security who may edit the config.
  * * **Suggested acceptance criteria**
    * A **CodeRabbit** config file is added at the path your team standard uses and **extends** the Insights org base without breaking inherited rules, or documents **explicit** overrides and why.
    * **Path/instructions** for changing rules (CODEOWNERS, team process) are one paragraph in the **README** or internal doc linked from the ticket.
    * A **test PR** shows CodeRabbit runs with the new config (or equivalent verification the config is **valid** and picked up).
    * **Scope** is clear: e.g. languages, `paths` filters, and **exclude** `vendor`/generated if applicable.
    * If CodeRabbit can be **disabled** in emergencies, that process is one line in the doc (or N/A is stated with reason).

- FCN-317 - Update YAML Editor from Split-View Editor to Review Step
  * **Why / motivation:** Partial — structural change to match **moves**; **“match the mocks”** has no link.
  * **UI design refs:** Missing — layout change, should reference **Figma/mocks** (or attach).
  * * **Suggested acceptance criteria**
    * The YAML experience is a **dedicated Review** step, not a persistent **split** view, and step order/navigation match the **mocks** (link in ticket).
    * On non-review steps, YAML is **read-only preview**; on **Review**, editing follows **FCN-217** once that lands (or the story is blocked on **FCN-217** explicitly).
    * **Back/Next** and **Cancel** from Review restore state per **FCN-217** / FCN-158 design.
    * **E2E/CT** show the new step in the **happy path** and a **back navigation** case.
    * If this ships before **FCN-217**, the ticket states the **interim** merge behavior; otherwise is **dependent** on **FCN-217** with a checkmark in DoD.

- FCN-231 - Define console lifecycle management on xKS
  * **Why / motivation:** Met — OCP (CVO/operator) vs xKS (Helm only) gap and upgrade alignment are clear; parent **FCN-219** (xKS spike) gives strategic frame.
  * **UI design refs:** N/A — **architecture/ops** outcome, not a UI build.
  * * **Gaps to fix in the story (not AC):** This reads like a **one-shot design** deliverable, not a spike; if the intent is a **timeboxed** spike, say so; else keep as story with AC below.
  * * **Suggested acceptance criteria**
    * A **published** doc (Confluence, ADR collection, or repo) describes **install**, **upgrade**, and **day-2** operations of the console on xKS, including **Helm** vs **operator-like** options and a **recommendation** (or **options** with pick criteria).
    * The doc covers **version mapping** to **MCE** and behavior in **air-gapped/disconnected** environments, with an explicit “unknowns” section if anything is still open.
    * **Rollback / failure** operations (e.g. failed upgrade) have at least a **stated** approach or a clear “out of scope” with a follow-up ticket.
    * **Sign-off** is listed: who must review (SRE, MCE, console) or a team decision record is linked.
    * A **table** of differences vs OCP (CVO) for traceability; no new **unsourced** product promises.

- FCN-229 - Plan CI coverage for console on non-OpenShift K8s
  * **Why / motivation:** Met — no coverage today, cost, and OCP assumptions in tests are stated; parent **FCN-219.**
  * **UI design refs:** N/A — process/infrastructure.
  * * **Suggested acceptance criteria**
    * A **written** plan (doc or design issue) names the **test matrix** (e.g. kind vs managed cloud), which **test suites** run in each, and which tests are **skip** on vanilla K8s and why.
    * **Cost and infra** estimates for xKS CI (rough order of magnitude, owner for budget) and a **minimal** bar vs **full** parity.
    * A **CI pipeline** proposal (e.g. GitHub Actions or your standard) with **entry/exit** criteria to promote from experimental to default.
    * **Risks** (flakiness, creds, cluster lifecycle) and mitigations; **open questions** listed with **owners** or a single follow-up epic.
    * **Backlink** to **FCN-219** and any **MCE** dependencies.

- FCN-122 - Add widgets to console.redhat.com's landing page
  * **Why / motivation:** Partial — unification and **analytics** are implied; not why **now** or which widgets.
  * **UI design refs:** Missing — landing page = **Figma/PatternFly** pattern or marketing layout link.
  * * **Gaps to fix in the story (not AC):** List **which** widgets and whether this duplicates **FCN-336/335/144** work; align with product.
  * * **Suggested acceptance criteria**
    * **Named** widgets (or a single umbrella card with a list) appear on **console.redhat.com** landing in the **approved** layout, per linked design.
    * **Segment/analytics** events (names, PII policy) are defined and **verified** in a staging or dev environment; events fire on **impression** and key **clicks** as per analytics spec.
    * **Empty/error** states and **entitlement** gating (if a widget needs a product the user does not have) are specified and implemented.
    * **Performance** budget: no measurable **LCP** regression on landing beyond an agreed number (or the doc says “measure and attach WebPageTest” in DoD).
    * **E2E** (or RHDCP equivalent) shows widgets render for an entitled user and hide/skip for an ineligible user, if applicable.

- FCN-206 - React form wizard library changes made in ACM to port back in to the original library
  * **Why / motivation:** Partial; parent **FCN-224**; duplicate phrasing of **FCN-205.**
  * **UI design refs:** N/A.
  * * **Gaps to fix in the story (not AC):** **Merge 205+206** or add **diff** of which ports each covers.
  * * **Suggested acceptance criteria**
    * A **cherry-pick/merge** from the **nxtcm**-side branch with **listed** commit SHAs or file paths is applied to the **canonical** `react-form-wizard` (or the agreed repo).
    * **All** **ACM** consumers still pass their **test** suite against the updated package version in **CI** (bump in ACM lockfile/dependency).
    * **Upstream** tests are **green**; **version** bump and **changelog** ( semver ) published or tagged per release process.
    * A short **port map** doc: which ACM-only hacks were **generalized** vs which stay behind a **prop/flag** (if any).
    * If something **cannot** be ported, a **spike** or child ticket is filed instead of silent omission.

- FCN-205 - React form wizard library changes made in nxtcm component to port back in to the original library
  * *Same shape as FCN-206* — use the same **Suggested acceptance criteria** as FCN-206, and **deduplicate** with **FCN-206** so a single **PR** and **one** release does both ports if they are the same work.

- FCN-124 - TEST item
  * **Why / motivation:** Missing / unclear — one-line description: **Create a drop down of AWS regions**; no parent in API response.
  * **UI design refs:** Missing if this is a real **UI** task; N/A if test-only in a throwaway file.
  * * **Gaps to fix in the story (not AC):** **Delete** or re-title as a real story under an epic, or mark **rejected.**
  * * **Suggested acceptance criteria**
    * (Only if the ticket is kept) A **regions** **`<Select>`** (or WizSelect) is implemented with the **right** `aria-*`, labels, and **keyboard** behavior, fed by a **data source** (static list or API) that the story **names**.

---

### Needs review (no acceptance criteria)

*None for deliverables* — the **1–2** scoping issues above have **draft** AC. You can move **FCN-124** here if you do not want a draft until the ticket is a real story.

---

## SPIKES

### Ready for implementation (items scoring 4 or 5)

*None.* No spike clearly met all of `SPIKE.md` (especially **timebox** and, for FCN-96/218, **outcomes/artifacts**).

---

### Ready for review (items scoring 1–3 with suggested spike goals)

- FCN-227 - Investigate console ingress on EKS
  * **Why / why now:** Met / Partial — EKS **ingress** and console **Routes** gap is well explained; parent **FCN-219**; **timebox** still missing in the text.
  * **UI design refs:** N/A — **research**; unless you prototype a real ingress YAML mock (optional).
  * * **Gaps to fix in the story (not AC):** Add **timebox** (e.g. **2–3 dev days** or end of **sprint N**); name **EKS+ingress controller** combo in scope (ALB vs nginx vs other) if you want a narrower spike.
  * * **Suggested spike goals**
    * **What will be determined:** A recommended **primary** ingress path for the OCP **console** on EKS (controller family + **TLS** + **hostname** pattern), and **what must change** in the console or operator vs a straight Route port.
    * **What will be delivered:** A **doc** (Confluence/ADR) with **Route** touchpoints in code, **WebSocket** constraints, and a **test plan** (manual or small POC) to validate; optional **POC** manifests (non-prod) under a branch link.
    * **Timebox:** (fill in) **N** **days** or end of **sprint** — **not** an open-ended investigation.
    * **Scope in/out:** **In** — EKS; **out** — **AKS/G** unless a single paragraph of contrast is **0.5d**; **in** — at least one **real** controller family evaluated.
    * **DoD:** A reviewer can say “done” from **doc + (optional) POC** without a production deployment.

- FCN-96 - [SPIKE] Investigate openshift dynamic plugin SDK
  * **Why / why now:** Missing / Partial — one-line **“investigate … dynamic plugin-sdk”**; no driver or decision this **unblocks**.
  * * **Gaps to fix in the story (not AC):** What **ACM**/**OCP** console use case and **sponsor** (e.g. **MCE** plugin loading) is this for?
  * * **Suggested spike goals**
    * **What will be determined:** **Feasibility** of using **OpenShift** **Dynamic Plugin** SDK in **ACM**-hosted vs **OCP** console, and **3** integration options (with **pros/cons**).
    * **What will be delivered:** A **1–2 page** comparison plus a **trivial** “hello” plugin (if allowed) in a throwaway **branch** or a **recorder**-only demo; list of **blockers** (version skew, `consolePlugin` CRs, org policy).
    * **Timebox:** (fill in) **N** **days.**
    * **Scope in/out:** **In** — read SDK docs + **one** small POC; **out** — full **production** **plugin** **publish**.

- FCN-218 - SPIKE - Document cluster update strategy implementation in ACM and OCM
  * **Why / why now:** Missing — **no description**; title is the only signal; parent not returned by `workitem view` (likely **unparented** or not in included fields).
  * * **Gaps to fix in the story (not AC):** Add **1** paragraph: **who** the doc is for and **how** it ties to **FCN-254** / GTM; link **epic** if any.
  * * **Suggested spike goals**
    * **What will be determined:** A clear **as-built** and **as-planned** picture of **where** “cluster **updates**” are initiated and **governed** in **ACM** vs **OCM** (incl. **MCE/OCM** boundaries).
    * **What will be delivered:** A **document** in the agreed **wiki/ADR** format with **diagrams** (even **ASCII**) of **data flow** and **API** ownership, plus a **glossary** of terms.
    * **Timebox:** (fill in) e.g. **1** **week** **max** (doc-only).
    * **DoD:** Stakeholders from **ACM** and **OCM** (names or roles) have **acknowledged** read-through or a **formal** review is scheduled.

---

### Needs review (no spike goals / insufficient spike definition)

*None* — you can still treat **FCN-96/218** as needing more product context; move them here if you will not set a **timebox** in Jira at all.
