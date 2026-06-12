---
name: stryker-mutation-test
description: >-
  Builds the npm run test:stryker command for Playwright CT mutation testing in
  nxtcm-components from natural-language requests. Use when the user asks to run
  mutation testing, Stryker, mutation score, or test quality on a component, spec,
  or feature. Does not execute the command — asks the user to run it in a terminal.
---

# Stryker mutation test command builder

Construct the correct `npm run test:stryker` command from what the user says. **Never run it** (no Shell, no `npm run test:stryker`). Give the user a copy-paste command and ask them to run it locally.

## Workflow

1. **Parse the request** — which component(s) or test file(s) did they mean?
2. **Resolve paths** — map names to repo-relative `*.tsx` component files (not specs).
3. **Add flags** — `--report`, `STRYKER_CONCURRENCY` when appropriate.
4. **Output** — one fenced `bash` block + short notes (runtime, prerequisites).
5. **Ask the user** to run the command in their terminal and paste results if they want help interpreting them.

## Command shape

```bash
npm run test:stryker -- [stryker-target flags] <component.tsx> [more-components.tsx ...]
```

With HTML report:

```bash
npm run test:stryker:report -- <component.tsx> [more...]
# same as: npm run test:stryker -- --report <component.tsx> ...
```

Optional env prefix (parallel workers, default is `min(4, cpuCount - 1)`):

```bash
STRYKER_CONCURRENCY=2 npm run test:stryker -- <component.tsx>
```

## Resolving what to mutate

Pass the **component** `.tsx` file, never the `.spec.tsx`.

| User says | Resolve to |
|-----------|------------|
| `FieldWithAPIErrorAlert` | `packages/nxtcm-rosa-hcp-wizard/src/components/FieldWithAPIErrorAlert.tsx` |
| `FieldWithAPIErrorAlert.spec.tsx` | Same component path (strip `.spec`) |
| `rosa hcp footer` / `RosaHcpWizardFooter` | `packages/nxtcm-rosa-hcp-wizard/src/Footer/RosaHcpWizardFooter.tsx` |
| `src/components/Foo` | `src/components/Foo/Foo.tsx` (confirm file exists) |
| Ambiguous basename | Search with Glob; if multiple matches, ask the user to pick |

If the user names a **spec** or you're unsure of the subject, read [.agents/skills/find-tested-component/SKILL.md](../find-tested-component/SKILL.md) and trace mount/imports to the real `*.tsx` subject.

**Prerequisites** (mention only if relevant):

- Co-located `ComponentName.spec.tsx` must exist next to `ComponentName.tsx`.
- Expect long runs (~minutes per component; scales with mutant count).
- No manual cache clear needed before running.

## Flag heuristics

| User intent | Add |
|-------------|-----|
| "HTML report", "open report" | `--report` or `test:stryker:report` |
| "faster", "parallel", "use more cores" | `STRYKER_CONCURRENCY=4` (warn about RAM) |
| "laptop", "slow machine", "while I work" | `STRYKER_CONCURRENCY=2` |
| First time / default | no extra flags |

## Response template

Always end with this pattern:

```markdown
Run this in your terminal from the repo root:

\`\`\`bash
npm run test:stryker -- packages/nxtcm-rosa-hcp-wizard/src/components/FieldWithAPIErrorAlert.tsx
\`\`\`

**Targets:** `FieldWithAPIErrorAlert.tsx` → `FieldWithAPIErrorAlert.spec.tsx`

**Expect:** several minutes; mutation score and survived mutants print when finished.

Paste the summary here if you want help reading the results.
```

For multiple components, list each `component → spec` pair.

## Examples

**User:** "Run mutation testing on FieldWithAPIErrorAlert"

```bash
npm run test:stryker -- packages/nxtcm-rosa-hcp-wizard/src/components/FieldWithAPIErrorAlert.tsx
```

**User:** "Mutation test the footer and the API error alert with a report"

```bash
npm run test:stryker -- --report \
  packages/nxtcm-rosa-hcp-wizard/src/components/FieldWithAPIErrorAlert.tsx \
  packages/nxtcm-rosa-hcp-wizard/src/Footer/RosaHcpWizardFooter.tsx
```

**User:** "Re-run stryker on the footer, 2 workers"

```bash
STRYKER_CONCURRENCY=2 npm run test:stryker -- \
  packages/nxtcm-rosa-hcp-wizard/src/Footer/RosaHcpWizardFooter.tsx
```

## Hard rules

- **Do not** execute `npm run test:stryker`, `stryker run`, or `node scripts/stryker-target.mjs`.
- **Do not** pass `*.spec.tsx` paths as mutation targets (runner expects component files).
- **Do not** suggest Jest for mutation testing in this repo — Playwright CT is the supported path.
- If paths cannot be resolved confidently, ask one clarifying question before outputting the command.
