# Repo research

Inform **blast_radius** and overall bot confidence by locating likely implementation paths in the target repo ([DISCOVERY.md](DISCOVERY.md) `repo_path`).

**Ticket-only mode:** Skip this file’s search steps; score `blast_radius` from ticket text only and flag **repo not searched**.

---

## Before searching

1. Confirm `repo_path` (default: current working directory).
2. When unfamiliar with the repo, skim README, package.json, or top-level docs to understand package layout, main apps, test commands.
3. From the ticket, extract **search terms**: component names, routes, API paths, error messages, feature flags, file paths mentioned in the ticket.

---

## Search strategy

| Step | Action |
|------|--------|
| 1 | **Semantic search** — feature area, user-facing strings, API names from the ticket |
| 2 | **Exact grep** — symbols, routes, constants, test titles referenced in the ticket |
| 3 | **Neighbors** — importers/callers of primary hit files; shared utilities touched |
| 4 | **Tests** — existing test files for the same module (bot can extend vs invent suite) |

Stop when you can describe a **plausible implementation path** or conclude the ticket is too vague to locate code.

---

## Blast radius assessment

| Radius | Signals |
|--------|---------|
| **Small** | One module or component; localized change; existing tests nearby; clear entry file |
| **Medium** | 2–4 files across one feature area; shared types/hooks; one integration boundary |
| **Large** | Cross-cutting refactor; multiple packages; infra/config; auth/data migrations; unclear ownership |
| **Unknown** | Ticket does not map to repo after reasonable search; greenfield with no anchor |

Record:

| Field | Content |
|-------|---------|
| `likely_files` | Paths (best guess) |
| `blast_radius` | `small` · `medium` · `large` · `unknown` |
| `implementation_notes` | Short path a bot would likely take |
| `repo_confidence` | `high` · `medium` · `low` · `none` |

---

## When repo search lowers bot confidence

- Ticket names files that **do not exist** in the repo
- Fix requires **design/product** choice not stated in ticket
- Change spans **multiple teams’ packages** without a clear epic breakdown
- Only generated/vendor code matches — hand work likely
- No tests in area and behavior is **high risk** (payments, auth, data loss)

---

## Anti-patterns

- Declaring “small blast radius” from ticket wording alone without opening the repo (unless ticket-only mode)
- Listing ten unrelated files without explaining the implementation path
- Assuming monorepo package from Jira project key without verification
