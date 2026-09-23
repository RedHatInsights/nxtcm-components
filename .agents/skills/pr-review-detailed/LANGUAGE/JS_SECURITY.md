# JavaScript / TypeScript security checklist

For changed `.tsx`, `.ts`, API handlers, config, `.md`, and lockfiles in §5 scope.

Apply [SECURITY.md](../SECURITY.md) first (S1–S8). This file runs under SKILL.md **§7** (LANGUAGE). Adds **JS/TS/React/npm** conventions for this skill's default repos.

Trace external data from inputs to sinks (DOM, storage, network, shell, DB). Report with SKILL.md **§11** severity + change scope.

## ⚠️ Absolute security rules (NEVER allow)

These patterns are **always major findings** — no exceptions:

1. **`dangerouslySetInnerHTML`** — flag any usage (JS1)
2. **`eval()` or `new Function()`** — flag any usage (JS6)

Even with sanitization, these APIs create unacceptable risk in this codebase. Recommend alternative approaches.

---

## 1. React & TypeScript checklist

| # | Check |
|---|--------|
| JS1 | **XSS / DOM injection** — user-controlled HTML only via a trusted sanitizer (e.g. DOMPurify); **NEVER use `dangerouslySetInnerHTML`** — flag any usage as **major** finding |
| JS2 | **URL schemes** — dynamic `href` / `src` / `window.open` targets validated; block `javascript:`, `data:` (when unsafe), and other executable schemes |
| JS3 | **Secrets exposure** — no API keys, tokens, passwords, or PII in source, React state, props, or client storage (`localStorage`, `sessionStorage`, cookies readable from JS) |
| JS4 | **Type bypasses** — flag `as any`, unchecked `any`, or `@ts-ignore` on trust boundaries (API payloads, URL params, form input, auth context) |
| JS5 | **AuthZ on client only** — UI gating is not authorization; sensitive actions must be enforced server-side |
| JS6 | **Code execution** — **NEVER use `eval()` or `new Function()`** — flag any usage as **major** finding; no unsanitized user input in shell commands (`child_process.exec`), dynamic SQL/query builders, or template strings executed as code |
| JS7 | **Sensitive logging** — tokens, credentials, or PII not logged to console or error reports |
| JS8 | **Dependency surface** — new deps justified; no duplicate libraries for the same concern; run §2 when lockfiles change |

**JS security severity (map to SKILL.md §11):** 
- **major** — `dangerouslySetInnerHTML` usage (JS1), `eval()` or `new Function()` usage (JS6), exploitable XSS/injection, exposed secrets, client-only auth for protected actions
- **medium** — unsafe patterns with unclear sanitization, type bypass at boundaries, new dep with known advisory (§2)
- **minor** — defense-in-depth nits, logging hygiene

---

## 2. New or updated dependency advisories

Run **only when `package.json` or `package-lock.json` (or `npm-shrinkwrap.json`) appears in the §3 diff**.

Goal: warn on advisories for packages **newly added or version-bumped in this diff** — not pre-existing vulns elsewhere in the tree.

### 2a. Collect changed package names

From the **repository root** (`BASE` = merge base / default branch from §3). The scripts read `package.json` / `package-lock.json` from **cwd**, so run them with the full path from the repository root — running them from the skill directory fails with `ENOENT`:

```bash
BASE="${BASE:-main}"
node .agents/skills/pr-review-detailed/scripts/security-changed-packages.js > .security-changed-packages.txt
```

If `.security-changed-packages.txt` is empty, skip §2b–§2c.

### 2b. Run audit

```bash
npm audit --json > .security-audit.json 2> .security-audit-stderr.log || true
```

If audit fails to run (offline registry, no lockfile), note in findings and continue §1 and §3.

### 2c. Filter to changed packages only

```bash
node .agents/skills/pr-review-detailed/scripts/filter-audit.js
```

`filter-audit.js` always exits 0. If `.security-changed-packages.txt` is empty, it writes `{ "changed": [], "hits": [] }` and skips reading the audit file. If `.security-audit.json` is missing, empty, or invalid JSON (common when §2b’s `npm audit ... || true` fails), it writes a well-formed `.security-audit-filtered.json` with `"auditStatus": "skipped"`, empty `hits`, and a `reason` — then continues so §1 and §3 are not blocked.

### 2d. Report

- **`auditStatus: "skipped"`** in `.security-audit-filtered.json` — note in findings that dependency audit did not run; do not treat as a clean audit.
- **0 hits** (valid audit output) — one line in the report: dependency audit clean for changed packages.
- **≥1 hit** — one finding per advisory in SKILL.md **§12**:
  - Map npm severity → §11: `critical`/`high` → **major**, `moderate` → **medium**, `low`/`info` → **minor**
  - Include package name, semver range, npm severity, and whether it is a direct or transitive dep
  - Suggest `npm audit fix` or a targeted bump only when appropriate; do not auto-fix unless user asks

---

## 3. Foreign or out-of-place content (automated scans)

Scan **changed files from §3**, with extra attention to **`.md` files**.

Look for content that does not belong in the repo — pasted build output, minified bundles, unrelated generated code, or binary blobs.

### 3a. Quick signals (run from repo root)

```bash
BASE="${BASE:-main}"

# Changed paths (prioritize markdown)
git diff "$BASE" --name-only --diff-filter=ACMRT > .security-diff-files.txt
git diff "$BASE" --name-only --diff-filter=ACMRT -- '*.md' > .security-diff-md.txt

# Bundler / compiled JS signatures in changed files
git diff "$BASE" -U0 -- . \
  | rg -i '__webpack_require__|sourceMappingURL=|/\*\!\s*webpack|function\(\)\{"use strict"' \
  > .security-foreign-hits.txt || true

# Minified one-liners in changed markdown
while IFS= read -r f; do
  [ -f "$f" ] || continue
  awk -v f="$f" 'length > 500 { print f ":" NR ": line length " length }' "$f"
done < .security-diff-md.txt > .security-long-lines.txt 2>/dev/null || true

# Binary additions
git diff "$BASE" --numstat | awk '$1 == "-" || $2 == "-" { print "binary:", $3 }' > .security-binary.txt || true
```

Also scan changed non-markdown paths for accidental artifacts: `*.min.js`, `*.bundle.js`, `*.map`, `dist/`, `build/` under `src/`, or full compiled libraries pasted into docs.

### 3b. Manual review cues

For each flagged `.md` file, confirm code blocks match repo conventions:

| Signal | Likely problem |
|--------|----------------|
| Single-line JS >500 chars | Minified or bundled output pasted into docs |
| `__webpack_require__`, `sourceMappingURL` | Build artifact, not source |
| Imports/paths from other projects or stale package names | Unrelated or copied code |
| Entire components/services pasted inline | Should live in `.ts`/`.tsx`, not `.md` |
| Base64 blobs or `\x` escapes | Encoded payload or binary leak |

### 3c. Report

- **Confirmed foreign content** → **major** if executable or large artifact committed; **medium** if sloppy paste that should move to source; **minor** if small snippet with wrong path but harmless
- **False positive** (intentional short example) — skip or note briefly
- List file, line or pattern, and recommended action (delete, move to source, replace with link)

---

## 4. Cleanup

Delete §2–§3 artifacts in SKILL.md **§13** alongside other review logs:

`.security-changed-packages.txt`, `.security-audit.json`, `.security-audit-stderr.log`, `.security-audit-filtered.json`, `.security-diff-files.txt`, `.security-diff-md.txt`, `.security-foreign-hits.txt`, `.security-long-lines.txt`, `.security-binary.txt`

These land at the **repository root** by design (scripts run from cwd — see §2a). They're also covered by `.gitignore` (`.security-*`, along with the other review skills' log patterns) as a safety net, but §13 cleanup should still remove them so a review session doesn't leave stray files in the workspace.
