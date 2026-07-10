# Architecture & API change review

Runs under SKILL.md **§6** (always). Flags changes that deserve **closer reviewer attention** — not every item is a defect.

Complements [GENERAL.md](GENERAL.md) #11 (breaking changes intentional) with **structural** and **public-surface** signals.

Rate each flagged item **small**, **medium**, or **large** (architectural scale — how much blast radius and review depth the change warrants).

---

## 1. Architectural change signals

| # | Signal | Typical scale | Reviewer action |
|---|--------|---------------|-----------------|
| AR1 | **New module, package, or top-level folder** — new boundary in the codebase | medium | Confirm placement, ownership, and dependency direction |
| AR2 | **Layer or boundary crossed** — UI calling data layer directly, shared util importing app-specific code, circular dependency introduced | medium–large | Flag coupling; suggest existing patterns from neighbors |
| AR3 | **New cross-cutting pattern** — global state, event bus, new data-fetch layer, new error-handling strategy | large when multi-team/repo | Closer look at trade-offs and consistency with repo patterns |
| AR4 | **Dependency direction change** — package A now depends on B when the inverse was true; new peer/host-app contract | large when shared contract | Verify against repo architecture docs; trace consumers |
| AR5 | **Infrastructure or runtime change** — build tool, bundler config, env var contract, deployment shape | large when org-wide | Confirm team/platform alignment |
| AR6 | **Large refactor without behavior change** — moved/renamed modules, extracted packages, file tree reshuffle | medium | Ensure imports/exports and public API unchanged unless intentional |
| AR7 | **New third-party integration** — auth provider, analytics, CMS, external SDK as a core dependency | medium–large | Security + ownership review; long-lived core deps → **large** |

---

## 2. API & public surface change signals

| # | Signal | Typical scale | Reviewer action |
|---|--------|---------------|-----------------|
| AR8 | **Exported symbol added, removed, or renamed** — public entry points, package exports, published module API | medium; **large** if breaking | Confirm semver/docs; breaking → call out explicitly |
| AR9 | **Public surface changed** — required parameter/field added or removed, type narrowed/widened, default behavior changed (UI props, public methods, config structs, etc.) | medium; **large** if host-facing break | Consumers and tests may break; document in PR |
| AR10 | **REST/GraphQL/event contract changed** — path, method, payload, status codes, topic names | **large** when external consumers | Coordinate consumers; note migration path |
| AR11 | **Route, query param, or deep-link shape changed** | medium | Bookmarking, analytics, and host routing may break |
| AR12 | **Config or feature-flag contract changed** — new env keys, renamed flags, default flips | medium; **large** if strategy shift | Document rollout and defaults |
| AR13 | **Shared type or schema changed** — types consumed by other packages or services | medium–large | Trace callers in monorepo; version or migrate |

---

## 3. Architectural scale (small · medium · large)

Use this to rate flagged items in §12 — separate from finding **severity** (§11).

| Scale | Meaning | When to use |
|-------|---------|-------------|
| **small** | Local, reversible, familiar pattern | Single module; no public contract change; neighbors already do this |
| **medium** | Meaningful structure or API touch; contained blast radius | New boundary in one package; additive API; refactor with clear scope |
| **large** | High blast radius or long-lived decision — **needs deeper review** | Any of: affects **more than one team** or **multiple repos/packages** · pattern **new to the org** or replaces an established approach · trade-offs **non-obvious** and hard to reverse · **public/host-app contract** introduced or broken without a migration path |

| Scale | §11 severity hint | Report |
|-------|-------------------|--------|
| **large** | **medium**–**major** if undocumented break or wide impact | Call out blast radius, consumers, and what reviewers should validate |
| **medium** | **minor**–**medium** | Note the change and suggested checks |
| **small** | **minor** or awareness only | Brief flag — no block unless coupled with a breaking change |

Breaking public/API change without documentation → **major** regardless of scale.

---

## 4. Report

When AR1–AR13 fire, add an **Architecture & API** subsection in SKILL.md **§12**. Include **scale** on each line:

```
Architecture & API:
  - [large] AR4: New peer dependency on @scope/pkg from service-foo — host-app contract; trace integrators
  - [medium] AR9: CreateUserRequest.email now required — additive for callers that already send it
  - [small] AR1: New util folder under existing package — matches neighbor layout
```

If none apply: **Architecture & API: no significant structural or public-surface changes detected.**
