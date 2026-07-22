# pr-review-detailed

A Fleet Engineering skill for end-to-end PR, branch, and commit review — optional verification gate, team standards discovery, diff scoping, optional Jira alignment, layered checklists, and findings with severity and fix scope.

Use when you want thorough, repeatable review feedback before merge or push. For a GitHub PR review with a numeric score and verdict, use **pr-scored-review** — it delegates analysis to this skill.

## What it does

The agent follows [SKILL.md](SKILL.md) in order:

1. **Verification gate** (optional) — run repo commands from `REPO_SPECIFIC/VERIFICATION.md` first; stop on failure
2. **Team standards** — discover conventions via the [repo-team-standards](../../commands/repo-team-standards.md) command
3. **Diff scope** — review changed files vs `main` (or a user-specified base)
4. **Jira alignment** (optional) — fetch ticket + acceptance criteria via Jira MCP when available
5. **Layered checklists** — general, architecture, security, testing, then language, repo, UI, and other customizable layers
6. **Report** — severity, change scope, file/line, concrete fixes
7. **Cleanup** — delete temporary log files created during the review

Missing or weak test coverage is reported as a finding — it does **not** block verification unless a test command actually failed.

## Directory layout

```text
pr-review-detailed/
├── SKILL.md              # Orchestrator — workflow, report format, cleanup rules
├── README.md             # This file
├── scripts/              # Helper scripts (npm audit filtering, etc.)
├── GENERAL.md            # Core: correctness, structure, breaking changes
├── ARCHITECTURE.md       # Structural & public API change flags
├── SECURITY.md           # Language-agnostic security
├── TESTING.md            # Language-agnostic test quality & coverage
├── LANGUAGE/             # ← customize: stack-specific checks
├── REPO_SPECIFIC/        # ← customize: verification, tests, project rules
├── UI/                   # ← customize: frontend/UI checklists
└── OTHER/                # ← customize: checklists that don't fit the folders above
```

Every `*.md` checklist in those four folders runs when files are present (UI only when the diff includes UI changes). `README.md` files in those folders are documentation only — the skill skips them. Skip absent or empty directories.

### Do not edit (core files)

These files are stack-agnostic. Leave them unchanged when adopting the skill for a new language or repo:

- `SKILL.md`
- `GENERAL.md`
- `ARCHITECTURE.md`
- `SECURITY.md`
- `TESTING.md`

### Customize (your stack & repo)

| Directory | Purpose | Examples |
|-----------|---------|----------|
| **`LANGUAGE/`** | Language- and ecosystem-specific rules | `GO.md`, `PYTHON.md`, `JS_SECURITY.md` |
| **`REPO_SPECIFIC/`** | Commands, test conventions, project policy | `VERIFICATION.md`, `UNIT_TESTS.md`, `API_STYLE.md` |
| **`UI/`** | Frontend checklists (skipped when diff has no UI) | `REACT.md`, `ACCESSIBILITY.md`, `VUE.md` |
| **`OTHER/`** | Checklists that do not fit `LANGUAGE/`, `REPO_SPECIFIC/`, or `UI/` | compliance, license headers, release notes |

Add, modify, or remove any `*.md` checklist file in those four folders. When checklist files are present, the skill runs them (UI checklists only when the diff includes UI changes). `README.md` in those folders is never run as a checklist. Skip absent or empty directories.

## Getting started

### Install the skill

In this repository, skills are installed for all supported AI tools:

| Tool | Command |
|------|---------|
| Claude Code | `make install-claude` (production) or `make install-dev` (local checkout) |
| Cursor | `make install-cursor` — regenerates `.cursor/rules/fleet-skills.mdc` |
| OpenCode | `make install-opencode` — copies skills to `~/.config/opencode/skills/` |

When adopting this skill in another repo, copy the entire `pr-review-detailed/` folder into your project's skills location (e.g. `.cursor/skills/`, Claude plugin, or OpenCode skills directory).

### Adopt for your repo

1. **Replace or add `REPO_SPECIFIC/VERIFICATION.md`** with your verification commands (lint, build, test, etc.). If absent, verification is skipped.
2. **Replace or add `REPO_SPECIFIC/` checklists** for test and project conventions (e.g. `_test.go` patterns for Go, or keep the bundled JS/React examples for npm workspaces).
3. **Swap `LANGUAGE/`** for your stack — remove files you do not need; add language-specific security and style rules.
4. **Adjust `UI/`** for your frontend stack, or remove the folder if the repo has no UI.
5. **Use [repo-team-standards](../../commands/repo-team-standards.md)** — the skill runs it to discover `package.json` scripts, CI, and team conventions.

### Example: Go backend service

| Action | Detail |
|--------|--------|
| `REPO_SPECIFIC/VERIFICATION.md` | `go vet ./...`, `golangci-lint run`, `go test ./...`, `go build ./...` |
| `REPO_SPECIFIC/UNIT_TESTS.md` | Table-driven tests, `_test.go` colocation, race detector, testify patterns |
| `LANGUAGE/GO.md` | Context propagation, error wrapping, SQL injection, module deps |
| `UI/` | Remove or leave empty — UI checklists skip when the diff has no frontend files |

Core files (`GENERAL.md`, `SECURITY.md`, etc.) stay as-is.

## Bundled defaults (JS/React/npm)

This repo ships example companions for Red Hat–style npm/TypeScript/React workspaces:

- `LANGUAGE/JS_SECURITY.md` — npm audit, XSS, dependency advisories
- `REPO_SPECIFIC/VERIFICATION.md` — lint, type-check, Jest, Playwright CT
- `REPO_SPECIFIC/UNIT_TESTS.md` — Playwright CT and Jest conventions
- `UI/REACT.md`, `UI/PATTERNFLY.md`, `UI/ACCESSIBILITY.md` — React/PatternFly/a11y

**Note:** `UI/PATTERNFLY.md` is a review checklist that references the repo's comprehensive [patternfly skill](../patternfly/SKILL.md) as the authoritative source for PatternFly rules and workflows.

Treat these as **starting templates**, not requirements. Delete or replace them for other stacks.

## Writing companion checklists

Each companion `.md` in `LANGUAGE/`, `REPO_SPECIFIC/`, `UI/`, or `OTHER/` should document:

1. **When to apply** — always, UI-only, lockfile change, etc.
2. **Checklist items** — numbered IDs (e.g. `T12`, `G3`, `CT1`) the agent cites in findings
3. **Severity mapping** — how violations map to `minor` / `medium` / `major`
4. **Report subsection** (optional) — named section in the review output
5. **Cleanup** (optional) — temp log files to delete after the review (see SKILL.md §13)

Follow the patterns in the bundled files for structure and tone.

## Optional features

| Feature | Requirement | Behavior if unavailable |
|---------|-------------|------------------------|
| **Jira alignment** | Jira MCP + issue key in prompt, branch, or commits | Skipped — review continues |
| **Verification gate** | `REPO_SPECIFIC/VERIFICATION.md` | Skipped — noted in report |
| **UI checklists** | UI files in the diff | Skipped — noted in report |
| **Team standards** | [repo-team-standards](../../commands/repo-team-standards.md) | Agent infers from repo neighbors |

## Triggering the skill

The skill description in `SKILL.md` frontmatter helps the agent auto-select it for review tasks. In your AI tool, ask the agent to review a PR, branch, or commits — for example:

- "Review this branch against main"
- "PR review — fix what you can in scope"
- "Verify and review before I push"

For a GitHub PR review with a numeric score and verdict, use **pr-scored-review** instead — it runs this skill as its analysis engine.

## Findings format

Every issue uses:

- **severity** — `minor` · `medium` · `major`
- **change scope** — `small` · `medium` · `large`
- **title**, **file/line**, **concrete fix**

See SKILL.md §11 for full definitions.

---

*Originally created by Kim Doberstein.*
