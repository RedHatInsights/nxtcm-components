---
name: pr-release-agent
description: >-
  Automate pull request creation by analyzing git diffs/commits, drafting a PR
  description from the project template, pushing the branch, and opening the PR
  via GitHub CLI. Use when the user says "create PR", "open PR", "release PR",
  "submit PR", "pr-release", or asks to push and open a pull request.
---

# PR Release Agent

Automates the full PR lifecycle: analyze changes, draft a description that
fills the project PR template, push, create the PR, and clean up.

## Prerequisites

- `gh` CLI installed and authenticated (`gh auth status`)

## Workflow

Track progress with this checklist:

```
PR Release Progress:
- [ ] Step 1: Gather context
- [ ] Step 2: Draft PR description & generate title
- [ ] Step 3: Save draft to pr_draft.md
- [ ] Step 4: Stage and commit changes
- [ ] Step 5: Push branch to origin
- [ ] Step 6: Create or update PR via gh CLI
- [ ] Step 7: Clean up pr_draft.md
```

### Step 1 — Gather context

Run these commands **in parallel** to collect all necessary information:

```bash
git branch --show-current
git status --short
git diff
git diff --cached
git log main..HEAD --oneline
```

Also run `git diff main...HEAD` and `git diff main...HEAD --stat` to capture
already-committed changes on the branch. Combine all sources (uncommitted,
staged, and already-committed) to build the full picture of what will be in
the PR.

From the branch name, extract a **Jira ticket ID** if present.
Pattern: branch contains a segment matching `[A-Z]+-\d+` (e.g. `OCMQE-1234`).
If no match, leave the Jira field blank.

If there are **no changes at all** (no uncommitted work AND no commits ahead
of `main`), stop and tell the user.

### Step 2 — Draft the PR description

Read the PR template at `.github/pull_request_template.md`.

Fill every section using the gathered context:

| Template section | How to fill |
|---|---|
| **Description** | Summarize the purpose and scope of the changes in 2–4 sentences. |
| **Jira issue #** | Insert a Markdown link: `[TICKET-ID](https://redhat.atlassian.net/browse/TICKET-ID)` (or leave blank if no ticket). |
| **Backport of** | Leave blank unless commits reference a backport. |
| **Type of Change** | Mark the checkbox(es) that match the changes. |
| **Testing > Manual Testing** | Infer reasonable test steps from the diff. If the change is UI-related, suggest Storybook verification. If purely logic, suggest unit test verification. |
| **Testing > Automated Testing** | Check "Unit tests added/updated" if test files were modified/added. Check "All unit tests pass" only if the user confirms. |
| **Screenshots/Recordings** | Write "N/A — no UI changes" or "TODO: add screenshots" depending on whether UI files changed. |
| **Checklist > Code Quality** | Pre-check items you can verify from the diff (style, no console logs, no warnings). Leave uncertain items unchecked. |
| **Checklist > Documentation** | Check Storybook item if `*.stories.*` files were touched. |
| **Checklist > Accessibility** | Leave unchecked unless evidence in the diff. |
| **Checklist > Dependencies** | Check if `package.json` / lock files changed. |
| **Breaking Changes** | Mark "No" unless the diff shows breaking API changes. If yes, describe the migration path. |
| **Additional Notes** | Add any context worth calling out (e.g. follow-up work, known limitations). |
| **Focus Areas** | List files or areas most impacted by the change. |
| **Questions for Reviewers** | Leave blank or add relevant questions. |

#### Title generation

Generate a concise PR title following this pattern:

```
[TICKET-ID] <type>(<scope>): <short summary>
```

- `TICKET-ID`: the extracted Jira ID, omit brackets if none found
- `type`: feat | fix | refactor | test | docs | chore | perf | style
- `scope`: affected component or area (e.g. `RosaWizard`, `build`)
- `short summary`: imperative mood, max ~60 chars

### Step 3 — Save the draft

Write the filled-out template to `pr_draft.md` in the workspace root.

### Step 4 — Stage and commit

If there are uncommitted or untracked changes, stage and commit them:

```bash
git add .
git commit -m "TICKET-ID: <short summary>"
```

- `TICKET-ID`: the extracted Jira ID (e.g. `FCN-340`). Omit if none found.
- `<short summary>`: reuse the short summary from the generated PR title
  (imperative mood, max ~60 chars).

Example commit messages:
- `FCN-340: add pr-release-agent Cursor skill`
- `OCMQE-1234: refactor cluster name validation hook`

If all changes were already committed (no dirty working tree), skip this step.

### Step 5 — Push the branch

```bash
git push -u origin HEAD
```

If the push fails (e.g. no upstream), surface the error and stop.

### Step 6 — Create or update the PR

First, check whether a PR already exists for the current branch:

```bash
gh pr view --json url,number 2>/dev/null
```

**If no PR exists** (command fails), create one:

```bash
gh pr create --base main --title "<generated title>" --body-file pr_draft.md
```

**If a PR already exists**, update its title and body:

```bash
gh pr edit --title "<generated title>" --body-file pr_draft.md
```

In both cases, capture and display the resulting PR URL to the user.

### Step 7 — Clean up

Delete `pr_draft.md` from the workspace.

## Error handling

- **No changes at all** (clean tree AND no commits ahead of `main`): Stop and tell the user.
- **`gh` not authenticated**: Stop and tell the user to run `gh auth login`.
- **Commit fails**: Stop and show the error (e.g. pre-commit hook rejection).
- **Push fails**: Stop and show the error.
- **PR creation or update fails**: Keep `pr_draft.md` so the user can retry manually, and show the error.

## Important notes

- NEVER force-push.
- NEVER modify git config.
- Always show the final PR URL to the user.
- If any step fails, stop the workflow and report clearly — do not continue silently.
