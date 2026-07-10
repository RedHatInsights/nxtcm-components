# Verification gate (run first)

Repo-specific commands for this skill's default JS/TS/npm workspaces. Run as SKILL.md **§1** (optional gate) before §2–§10.

Resolve script names from **repo-team-standards** ([../../commands/repo-team-standards.md](../../commands/repo-team-standards.md)) or `package.json`. **Skip** any step with no matching script — list skipped steps in SKILL.md §12 **Verification**. Missing or weak test coverage → [TESTING.md](../TESTING.md) (§6 only).

| Step | Default command | Notes |
|------|-----------------|-------|
| Lint | `npm run lint` | Required when script exists — if terminal output is empty, capture to `.eslint-run.log` and parse there |
| Format | `npm run prettier:fix` | Required when script exists |
| Types | `npm run type-check` | Required when script exists — if terminal output is empty, capture to `.typecheck-run.log` and parse there |
| Build | `npm run build` | Run when script exists |
| Unit tests | `npm test` or `npm run test` | Jest — `*.test.ts` for TS logic; skip when no script |
| Component tests | `npm run test:ct` | Playwright CT — `*.spec.tsx` for React components; prefer specs under changed paths (SKILL.md §3); full suite only when cross-cutting. Install browsers when needed; capture output to `.ct-test-run.log` when empty. Skip when no script |
| E2E | `npm run test:e2e` | Run when script exists; often slow — skip when absent |

Before **scoped component tests**, run `git diff` vs base (same as SKILL.md §3) to identify changed paths.

**On any failure** (for a step you ran):

1. Fix issues tied to the diff or same feature area only (SKILL.md §5). No unrelated refactors.
2. Re-run affected commands only.
3. **Stop** — do not proceed to SKILL.md §2–§10. Report failures, fixes, and remainder in §12 **Verification**.

Continue when all **run** steps pass.

---

## Cleanup artifacts

Delete these in SKILL.md **§13** after parsing logs (even on early exit):

| Source | Typical artifacts (repo root unless noted) |
|--------|---------------------------------------------|
| Lint | `.eslint-run.log`, `.eslint-exit.txt`, `.eslint-run.json`, `.eslint-full.log`, `.eslint-full-exit.txt` |
| Format | `.prettier-run.log`, `.prettier-exit.txt`, `.prettier-check.log` |
| Type-check | `.typecheck-run.log`, `.typecheck-exit.txt` |
| Component tests | `.ct-test-run.log`, `.ct-test-exit.txt`, `.playwright-install.log` |
| Jest (if run) | `.jest-run.log` |

From the **workspace repo root**:

```bash
rm -f .eslint-run.log .eslint-exit.txt .eslint-run.json .eslint-full.log .eslint-full-exit.txt \
      .prettier-run.log .prettier-exit.txt .prettier-check.log \
      .typecheck-run.log .typecheck-exit.txt \
      .ct-test-run.log .ct-test-exit.txt .playwright-install.log \
      .jest-run.log
```

Delete the artifacts for each command you ran — do not leave logs in the workspace after parsing.
