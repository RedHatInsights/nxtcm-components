# OTHER checklists

Documentation for the [OTHER/](.) folder — **not** a review checklist. [SKILL.md](../SKILL.md) skips every `README.md` in customizable directories (§7–§10).

## Purpose

Use `OTHER/` for checklists that do not belong in [LANGUAGE/](../LANGUAGE/), [REPO_SPECIFIC/](../REPO_SPECIFIC/), or [UI/](../UI/).

Typical examples:

| Topic | Example file | When to apply |
|-------|--------------|---------------|
| License / copyright headers | `LICENSE_HEADERS.md` | Always — any new or changed source file |
| Compliance / audit | `SOC2.md`, `EXPORT_CONTROL.md` | Always or when paths match a policy |
| Release notes | `RELEASE_NOTES.md` | User-facing or versioned changes |
| Open-source policy | `THIRD_PARTY_NOTICES.md` | New dependencies or vendored code |
| Org-wide conventions | `COMMIT_MESSAGES.md`, `I18N.md` | When diff touches relevant files |

Add any `*.md` checklist here except `README.md`. Remove files you do not need — absent or empty folders are skipped during review.

## Writing a checklist

Each companion checklist should follow the same contract as other customizable folders (see [README.md § Writing companion checklists](../README.md#writing-companion-checklists)):

1. **When to apply** — always, path pattern, or diff signal (e.g. lockfile change)
2. **Checklist items** — numbered IDs (e.g. `O1`, `LIC3`) cited in findings
3. **Severity mapping** — how violations map to `minor` / `medium` / `major`
4. **Report subsection** (optional) — named section in the review output
5. **Cleanup** (optional) — temp log files to delete after the review (SKILL.md §13)

## Example starter: license headers

```markdown
# License header checklist

Apply when §5 scope includes new or materially changed source files.

| # | Check |
|---|--------|
| LIC1 | New source files include the org-standard copyright / license header |
| LIC2 | Header year and holder match repo policy |
| LIC3 | No proprietary notices removed from existing files without intent |

**Severity:** **major** — missing header on new shipped code · **medium** — wrong holder/year · **minor** — formatting drift
```

Save as `LICENSE_HEADERS.md` (or any name other than `README.md`) in this folder.

## Do not put here

- Language or stack rules → [LANGUAGE/](../LANGUAGE/)
- Lint, test, or verification commands → [REPO_SPECIFIC/](../REPO_SPECIFIC/)
- React, CSS, or accessibility checks → [UI/](../UI/)
- Core correctness, security, architecture, or testing → root `GENERAL.md`, `SECURITY.md`, `ARCHITECTURE.md`, `TESTING.md`
