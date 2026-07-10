---
name: pr-review-detailed
description: Layered checklist PR analysis engine — optional verification gate, team standards discovery, diff scoping, optional Jira alignment via MCP, structured findings with severity and fix scope, and cleanup. Use standalone for branch/diff review, or composed from pr-review for GitHub PR analysis.
---

# PR review (detailed)

PR/branch/commit review: verification (when configured) + layered checklists + structured findings.

**Dual-use:** Works **standalone** (review a branch or local diff before push) or as the **analysis engine within `pr-review`** — which handles GitHub PR summary, worktree setup, context gathering, and posting inline comments. When invoked from `pr-review`, **skip §1–§2** and begin at **§3** (worktree and diff scope are already established); run §4–§13 as usual.

**Relationship to other review skills:**

| Skill | Role |
|-------|------|
| **pr-review** | User-facing GitHub PR review — worktree, context, inline comments; delegates code analysis here |
| **pr-review-detailed** | This skill — checklist-driven analysis and findings report |
| **pr-scored-review** | Orchestrates this skill for analysis, then scores findings across three lenses (functionality, security, quality) to produce a numeric verdict |

**When to use which:**
- **pr-review-detailed** (this skill) — detailed findings without numeric scoring; exploratory analysis
- **pr-scored-review** — numeric score + verdict (LGTM / MINOR ISSUES / NEEDS_CHANGES); delegates to this skill for analysis
- **pr-review** — GitHub PR with inline comments; delegates to this skill for analysis

## Supporting files

- [README.md](README.md) — adoption guide and directory layout
- [scripts/security-changed-packages.js](scripts/security-changed-packages.js) — npm lockfile diff helper (LANGUAGE/JS_SECURITY.md §2)
- [scripts/filter-audit.js](scripts/filter-audit.js) — npm audit filter helper (LANGUAGE/JS_SECURITY.md §2)
- [GENERAL.md](GENERAL.md) — correctness, structure, breaking changes
- [ARCHITECTURE.md](ARCHITECTURE.md) — structural and public API change flags
- [SECURITY.md](SECURITY.md) — language-agnostic security
- [TESTING.md](TESTING.md) — language-agnostic test quality and coverage
- [LANGUAGE/JS_SECURITY.md](LANGUAGE/JS_SECURITY.md) — JS/TS security checklist (customize `LANGUAGE/` for your stack)
- [REPO_SPECIFIC/VERIFICATION.md](REPO_SPECIFIC/VERIFICATION.md) — optional verification gate (§1)
- [REPO_SPECIFIC/UNIT_TESTS.md](REPO_SPECIFIC/UNIT_TESTS.md) — repo test conventions
- [UI/REACT.md](UI/REACT.md) — React checklist (conditional on UI diff)
- [UI/PATTERNFLY.md](UI/PATTERNFLY.md) — PatternFly checklist (conditional on UI diff)
- [UI/ACCESSIBILITY.md](UI/ACCESSIBILITY.md) — accessibility checklist (conditional on UI diff)

### Customization (teams adopt without editing core files)

Customize these directories for your stack and repo — leave `SKILL.md`, `GENERAL.md`, `ARCHITECTURE.md`, `SECURITY.md`, and `TESTING.md` unchanged:

| Directory | Purpose |
|-----------|---------|
| [LANGUAGE/](LANGUAGE/) | Language- and stack-specific checks (e.g. Go, Python, JS/TS) |
| [REPO_SPECIFIC/](REPO_SPECIFIC/) | Verification commands, test conventions, project rules |
| [UI/](UI/) | Frontend/UI checklists when the diff includes UI changes |
| [OTHER/](OTHER/) | Checklists that do not fit the directories above (e.g. compliance, license headers) |

Add, modify, or remove `*.md` checklist files in those folders. Skip directories that are absent or empty. When checklist files are present, the skill runs every `*.md` in that folder **except `README.md`** (see §7–§10).

---

## 1. Verification gate (optional)

If [REPO_SPECIFIC/VERIFICATION.md](REPO_SPECIFIC/VERIFICATION.md) **exists**, run it **first**.

- **On failure** — fix per that file, re-run affected commands, **stop** (do not proceed to §2–§10). Report in §12 **Verification**.
- **If the file is absent** — skip; note **Verification: skipped (no REPO_SPECIFIC/VERIFICATION.md)** in §12.
- **On success** — continue to §2.

Missing or weak test **coverage** is never a §1 stop — see [TESTING.md](TESTING.md) §1 (§6 findings only).

---

## 2. Discover team standards

Run the **repo-team-standards** command ([../../commands/repo-team-standards.md](../../commands/repo-team-standards.md)) or follow its steps inline.

**Pattern priority** for review/fix (§5): (1) this skill → (2) repo-team-standards findings → (3) same feature area / neighbors / existing helpers. Else infer from (3).

---

## 3. Determine what to review

| Input | Diff source |
|-------|-------------|
| Default | vs **`main`** (or repo default base) |
| User gives commits/branch | those commits only |

Record changed files and paths → scope for §5–§10.

```bash
BASE="${BASE:-main}"
git diff --name-only "$BASE"...HEAD
```

---

## 4. Jira alignment (optional — MCP only)

**Skip** when any of the following is true — do **not** block the review:

- No issue key resolved (§4a)
- Jira MCP server not installed or not listed under project MCP tools
- MCP exposes only `mcp_auth` and auth fails, or `getJiraIssue` / `mcp__jira-mcp-server__getJiraIssue` is unavailable after auth
- MCP fetch fails after one retry

Do **not** use acli or other CLI fallbacks.

### 4a. Resolve issue key

First match wins:

| Priority | Source |
|----------|--------|
| 1 | User prompt (e.g. `FCN-1234`, `PROJ-99`) |
| 2 | `git branch --show-current` when it matches `\b[A-Z][A-Z0-9]+-\d+\b` |
| 3 | Commit messages in review range — `git log "$BASE"..HEAD` (or `HEAD` for single commit). First `\b[A-Z][A-Z0-9]+-\d+\b` match |

### 4b. Fetch via MCP

Use Fleet-standard Jira MCP tools (`mcp__jira-mcp-server__*`). If unavailable, fall back to Cursor's `user-atlassian-mcp-server` equivalents (`getJiraIssue`, `getAccessibleAtlassianResources`).

1. Read MCP tool schemas — prefer `mcp__jira-mcp-server__*` (Claude Code, OpenCode); else `user-atlassian-mcp-server` (Cursor).
2. If only `mcp_auth` is exposed → call `mcp_auth` for the Atlassian server with `{}`, then re-check tools.
3. `mcp__jira-mcp-server__getAccessibleAtlassianResources` (or `getAccessibleAtlassianResources`) → `cloudId` for the target site (e.g. `redhat.atlassian.net`).
4. `mcp__jira-mcp-server__getJiraIssue` with `responseContentFormat: "markdown"` (or `getJiraIssue` with the same option).

**Parse acceptance criteria:** In **description**, take the section after **`Acceptance criteria`** (case-insensitive) through the next top-level heading (`Notes`, `Open Questions`, `Decisions`, etc.) or end of description. Each bullet/numbered line is one AC. If no AC section exists, verify against the full description only.

Link: `https://<site>/browse/<KEY>` (from MCP resource or known host).

### 4c. Verify vs §3 diff

| # | Question |
|---|----------|
| J1 | Implements the **description**? |
| J2 | Each **acceptance criterion** satisfied by code/tests in the diff? |
| J3 | **Scope creep** or **missing work** vs Jira? |

Gaps → findings (§11): **major** if AC/behavior clearly missing; **medium** if partial/ambiguous.

**§12 Jira report:** key, link, **MCP** or **skipped** + reason, AC list (or “none in ticket”), matched / gaps.

---

## 5. Scope (strict)

Review/fix **only** diff files or the same feature area (source + test + strings/mock + doc). No unrelated refactors or opportunistic cleanup. Out-of-scope → **Remaining issues** in §12 only (unless user asks).

---

## 6. Core checklists (always)

Apply every file in this fixed set against §5 scope:

| File | Purpose |
|------|---------|
| [GENERAL.md](GENERAL.md) | Correctness, structure, breaking changes |
| [ARCHITECTURE.md](ARCHITECTURE.md) | Architectural & public API change flags (small/medium/large scale) |
| [SECURITY.md](SECURITY.md) | Language-agnostic security |
| [TESTING.md](TESTING.md) | Language-agnostic test quality & coverage rules |

Each file contributes **findings** (§11). Some define **report subsections** or **cleanup artifacts** — see §12 and §13.

---

## 7. Language checklists

Run **every `*.md` checklist file** in [LANGUAGE/](LANGUAGE/) against §5 scope (skip `README.md`).

Skip the directory if absent, empty, or it contains only `README.md`. Teams add stack-specific files here (Go, Python, JS/TS, etc.) without changing this skill.

---

## 8. UI checklists (conditional)

Run **every `*.md` checklist file** in [UI/](UI/) when §3 diff includes **UI changes** (skip `README.md`):

- Extensions: `*.tsx`, `*.jsx`, `*.css`, `*.scss`, `*.less`
- Paths: `**/components/**`, `**/pages/**`, `**/ui/**`, `**/views/**`
- Or changed files import UI libraries (e.g. `@patternfly/*`, `react-dom`)

If no UI signal in the diff, skip §8 and note **UI checklists: skipped (no UI changes)** in §12.

Teams customize [UI/](UI/) for their frontend stack; run whatever checklist `*.md` files are present when §8 applies (skip `README.md`). Skip the directory if absent, empty, or it contains only `README.md`.

---

## 9. Repo-specific checklists

Run **every `*.md` checklist file** in [REPO_SPECIFIC/](REPO_SPECIFIC/) **except** `VERIFICATION.md` (already run in §1 if present) and `README.md`.

Teams customize [REPO_SPECIFIC/](REPO_SPECIFIC/) for verification commands, test conventions, and project rules.

Skip the directory if absent, empty, or it contains only `README.md` (after excluding verification).

---

## 10. Other checklists

Run **every `*.md` checklist file** in [OTHER/](OTHER/) against §5 scope (skip `README.md`).

Use this folder for checklists that do not belong in [LANGUAGE/](LANGUAGE/), [REPO_SPECIFIC/](REPO_SPECIFIC/), or [UI/](UI/) — for example org-wide compliance, license headers, or release-note policy. Skip if the directory is absent, empty, or it contains only `README.md`.

---

## 11. Findings format

Each issue from §4–§10:

- **severity** — `minor` · `medium` · `major`
- **change scope** — `small` · `medium` · `large`
- **title**, **file/line**, **concrete fix**
- Brief praise when warranted

**Severity:** **major** — wrong behavior, missing critical coverage, blocking standards violation, regressions, missing Jira AC · **medium** — maintainability, duplication, weak tests, standards drift, partial Jira · **minor** — naming, style, clarity

**Change scope:** **small** — local edit · **medium** — module/call sites · **large** — cross-cutting refactor

Companion checklists may define item IDs (e.g. T12, JS4, CT1) — cite them in the finding title or body.

---

## 12. Report output

Assemble one review report. Sections below are **templates** — include a section when the step ran or when a companion doc defines a named subsection.

| Section | Source | Content |
|---------|--------|---------|
| **Verification** | §1 / [REPO_SPECIFIC/VERIFICATION.md](REPO_SPECIFIC/VERIFICATION.md) | Commands run, pass/fail/**skipped**; stop details if applicable |
| **Standards source** | §2 | repo-team-standards summary |
| **Diff scope** | §3 | Base ref, changed paths |
| **Jira alignment** | §4 | Key, link, MCP/skipped + reason, AC list, matched/gaps |
| **Architecture & API** | §6 / [ARCHITECTURE.md](ARCHITECTURE.md) | Structural or public-surface signals with small/medium/large scale |
| **UI checklists** | §8 | Ran / skipped + reason |
| **Findings** | §6–§10, §4 gaps | All issues in §11 format, grouped by checklist or theme |
| **Fixes applied** | §5 only | What you changed |
| **Remaining issues** | §5 only | Out-of-scope or not fixed |

Optional: PR description from `.github/pull_request_template.md` when user wants merge-ready text.

### Companion doc reporting contract

Each companion `.md` should state (in the file or here):

1. **When to apply** — scope trigger (always, UI-only, lockfile change, etc.)
2. **Findings** — checklist items → §11 findings when violated
3. **Report subsection** (optional) — e.g. VERIFICATION → **Verification** row; a LANGUAGE/ companion §2 → bullet under **Findings** or sub-heading “Dependency advisories”
4. **Cleanup** (optional) — temp files → §13

**Then run §13 cleanup before finishing.**

---

## 13. Cleanup (required)

After parsing logs and sending the report (§12), **delete every temporary file** created during this review.

### When to run

- Always — last step before the review response is complete
- Even on early exit (§1 verification failure) — still clean up logs from commands that ran
- Skip only if the user explicitly asks to keep files for debugging

### What to remove

Delete every temporary file listed in the **Cleanup** section of each companion doc that ran during this review — typically under [REPO_SPECIFIC/](REPO_SPECIFIC/), [LANGUAGE/](LANGUAGE/), and [UI/](UI/).

Also remove any ad-hoc logs you created (e.g. `.git-diff.txt`, feature-specific `.*-test.log`, `.*-run.log`, `.*-exit.txt`). Each companion doc should name its artifacts explicitly; do not rely on a fixed global list.

### How to clean up

From the **workspace repo root**, delete the artifacts named in each companion **Cleanup** section you used. If unsure, scan for review log patterns (`.*-run.log`, `.*-exit.txt`, dotfiles you created this session) and remove them. Do not commit these files.

---

## Anti-patterns

- Claiming checks passed without running commands.
- Leaving verification or scan log files in the workspace after the review is done.
- Using acli or guessing Jira content when MCP is unavailable — skip §4 and say so.
