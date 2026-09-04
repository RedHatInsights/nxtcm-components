# Research — codebase and package context

Optional but recommended when the user names repos, packages, or paths. Route findings to the registry section whose guide lists them under **Research feeds** ([TEMPLATE.md](TEMPLATE.md) § Section registry).

**Do not invent** API names, package names, or file paths — verify in repo or ask the user ([DISCOVERY.md](DISCOVERY.md) § Completeness gate).

**Prerequisite:** [DISCOVERY.md](DISCOVERY.md) § Discovery gate must pass before research. Do not spawn repo exploration or subagents on a discovery-only turn.

After research, run [DISCOVERY.md](DISCOVERY.md) § Completeness gate. Unverified findings (URLs, CRD names, routes not found in code) → ask the user or list in **More information needed** if user deferred; do not carry forward as placeholders in required sections.

---

## When to research

| Signal | Action |
|--------|--------|
| User names consumer repo (e.g. `console-acm`) | Search routes, existing flows, integration patterns |
| User names library repo / npm package | Find package name, props/types, README, submit shape |
| User mentions CRDs, APIs, or backend process | Grep for kinds, resources, existing handlers |
| User mentions parity with another UI | Search sibling product if path known; if not found, add to completeness audit and ask user |
| User mentions "already exists" | Confirm in code (routes, pages, service account flows) |
| User mentions tests | Find test scripts (e2e, component) for **Test Plan** |

Skip when user provides a complete narrative and asks for prose only with no repo context.

---

## Research targets (priority order)

1. **Integration contract** — props, callbacks, types, npm package name → **Implementation notes**
2. **Submit / output shape** — CRDs, payloads, templates → **Implementation notes**, **Acceptance criteria**
3. **Existing routes and entry points** — navigation, create-cluster flows → **Description**, **Acceptance criteria**
4. **Auth / credential pattern** — service accounts, secrets, token usage → **Description**, **AC**, **Implementation notes**
5. **Official docs** — Red Hat docs, README links in repo → **Implementation notes** or **Mockups/Design** (parity)
6. **Parity reference** — existing screen, CLI, or doc paths (**only when user mentioned alignment**) → **Mockups/Design**
7. **Test tooling** — Playwright, Jest, CT config → **Test Plan**

---

## Techniques

| Goal | Approach |
|------|----------|
| Package identity | `package.json` `name` field in library repo |
| Public API | `index.ts`, main component props in `types.ts` |
| HTTP boundary | Confirm library **does not** call APIs; host app injects `Resource<T>` + `fetch` |
| CRD / resource names | Grep `kind:`, template files (`.hbs`, `.yaml`) |
| Routes | Grep `NavigationPath`, `Route`, `create*` in consumer frontend |
| Existing pages | Glob `**/*Create*`, `**/*Wizard*` under relevant routes |
| Test scripts | `package.json` scripts, CI workflows |

Keep research **scoped** — read types, README, and representative files; do not exhaust the repo.

---

## Record for drafting

For each finding, open the target section’s guide and confirm **Research feeds** includes that finding type. Default routing:

| Finding | Section guide |
|---------|---------------|
| npm package name + repo path | [SECTIONS/IMPLEMENTATION_NOTES.md](SECTIONS/IMPLEMENTATION_NOTES.md) |
| Key types / props file | [SECTIONS/IMPLEMENTATION_NOTES.md](SECTIONS/IMPLEMENTATION_NOTES.md) |
| CRD kinds and apiVersion | [SECTIONS/IMPLEMENTATION_NOTES.md](SECTIONS/IMPLEMENTATION_NOTES.md), [SECTIONS/ACCEPTANCE_CRITERIA.md](SECTIONS/ACCEPTANCE_CRITERIA.md) |
| Existing vs net-new pages | [SECTIONS/ACCEPTANCE_CRITERIA.md](SECTIONS/ACCEPTANCE_CRITERIA.md) |
| Doc URLs from code constants | [SECTIONS/IMPLEMENTATION_NOTES.md](SECTIONS/IMPLEMENTATION_NOTES.md) or [SECTIONS/MOCKUPS_DESIGN.md](SECTIONS/MOCKUPS_DESIGN.md) |
| Test scripts / frameworks | [SECTIONS/TEST_PLAN.md](SECTIONS/TEST_PLAN.md) |
| Gaps / unconfirmed items | [DISCOVERY.md](DISCOVERY.md) § Completeness gate — ask before drafting |

---

## When research is incomplete

Do **not** add `(add link …)` or similar to required sections. Add each gap to the completeness audit and ask the user in a **discovery-only** turn ([DISCOVERY.md](DISCOVERY.md) § Completeness gate).

Never present unverified research as fact in the delivered epic.
