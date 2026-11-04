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
- [ ] Step 4: Validate (build, lint, tests)
- [ ] Step 5: Stage and commit changes
- [ ] Step 6: Push branch to origin
- [ ] Step 7: Create or update PR via gh CLI
- [ ] Step 8: Clean up pr_draft.md
```

### Step 1 — Gather context

**Author scope — required**

The PR **title, Description, Focus Areas, and checkbox inferences must reflect only
work authored by the person running the workflow** (plus any unstaged/staged edits
still on disk). Do **not** summarize, quote, or paraphrase commit messages from
other contributors—even if those commits sit ahead of the integration branch.

1. Resolve the author identity (read-only):

   ```bash
   AUTHOR_EMAIL="$(git config user.email)"
   ```

   If **`AUTHOR_EMAIL` is empty**, stop and tell the user to set `user.email` (or run
   the workflow after configuring it). Do **not** change git config — see Important
   notes.

2. Record the integration branch and compute the merge base. Default to **`main`**
   unless the user named a different target branch in their request:

   ```bash
   INTEGRATION_BRANCH="main"   # substitute the user-specified branch if provided
   MB="$(git merge-base "${INTEGRATION_BRANCH}" HEAD)"
   ```

   Reuse `INTEGRATION_BRANCH` (never the hard-coded string `main`) for every subsequent
   git log range, `gh pr create --base`, and history checks in this workflow.

Run these commands **in parallel** with the usual housekeeping (branch, status):

```bash
git branch --show-current
git status --short
git diff
git diff --cached
```

**Commits and patches authored by `AUTHOR_EMAIL` only** — use these for narrative
scope (titles, bullets, Focus Areas). `--author` is a regular expression;
`--fixed-strings` matches the string literally; wrapping the email in `<…>` pins it to
the email-address boundary in the commit author field, preventing partial matches
against other addresses that share a prefix:

```bash
git log "${MB}"..HEAD --fixed-strings --author="<${AUTHOR_EMAIL}>" --oneline
git log "${MB}"..HEAD --fixed-strings --author="<${AUTHOR_EMAIL}>" --stat
```

For finer detail when summarizing behaviour, restrict to authored commits:

```bash
git log "${MB}"..HEAD --fixed-strings --author="<${AUTHOR_EMAIL}>" -p
```

**(Optional)** For awareness only — **do not** copy summaries from these into the PR
unless the user asked to describe the entire branch:

```bash
git log "${INTEGRATION_BRANCH}"..HEAD --oneline
git diff "${INTEGRATION_BRANCH}"...HEAD --stat
```

From the branch name, extract a **Jira ticket ID** if present.
Pattern: branch contains a segment matching `[A-Z]+-\d+` (e.g. `OCMQE-1234`).
If no match, leave the Jira field blank.

**Stopping**

- **No authored work**: If **`git diff` and `git diff --cached`** are empty **and**
  **`git log "${MB}"..HEAD --fixed-strings --author="<${AUTHOR_EMAIL}>"`** is empty **and**
  `git ls-files --others --exclude-standard -- . ':(exclude)pr_draft.md'` returns no paths,
  stop and explain.
  Optionally note that `INTEGRATION_BRANCH..HEAD` still has other commits if
  `git log "${INTEGRATION_BRANCH}"..HEAD --oneline` is non-empty.

- **No changes at all** (no uncommitted work **and** no commits ahead of the integration
  branch): stop and tell the user.

### Step 2 — Draft the PR description

Read the PR template at `.github/pull_request_template.md`.

Fill every section using **`AUTHOR_EMAIL`-scoped commits and patches**, **plus**
 **`git diff` / `git diff --cached`** (your local edits).

| Template section | How to fill |
|---|---|
| **Description** | Summarize **only** the purpose of **your** authored commits and current local edits (`git log "${MB}"..HEAD --fixed-strings --author=…`, `git show`/`git log -p` as needed). Do **not** describe unrelated commits **or reuse wording from merged PR descriptions** appearing elsewhere on the branch. If the GitHub branch includes others' commits, you may add **one short line** under **Additional Notes** stating that broader history exists on this branch—but keep the template body about **your** scope. |
| **Jira issue #** | Insert a Markdown link: `[TICKET-ID](https://redhat.atlassian.net/browse/TICKET-ID)` (or leave blank if no ticket). |
| **Backport of** | Leave blank unless commits reference a backport. |
| **Type of Change** | Mark the checkbox(es) from **your** diff/patch scope only. |
| **Testing > Manual Testing** | Infer steps **only from what you touched** per author scope (+ WIP diff). |
| **Testing > Automated Testing** | Check "Unit tests added/updated" if **you** added/changed tests in scope. Check "All unit tests pass" only if the user confirms. |
| **Screenshots/Recordings** | Use **your** UI/story edits only (`N/A` if none). |
| **Checklist > Code Quality** | Pre-check from **your** changes only if verifiable from that scope. |
| **Checklist > Documentation** | e.g. Storybook if **you** touched stories in scope. |
| **Checklist > Accessibility** | Unchecked unless evidence in **your** scope. |
| **Checklist > Dependencies** | Check if **your** scope touched `package.json` / locks. |
| **Breaking Changes** | Infer from **your** API/export changes only. |
| **Additional Notes** | Optional branch-history caveat (see Description row). Follow-ups affecting only your scope. |
| **Focus Areas** | Files/areas touched in **your** commits + WIP, not unrelated paths. |
| **Questions for Reviewers** | Leave blank unless tied to **your** changes. |

#### Title generation

Generate a concise PR title following this pattern:

```
[TICKET-ID] <type>(<scope>): <short summary>
```

Base the title on **your** scoped work only (commits by `AUTHOR_EMAIL` + unstaged/staged edits).

- `TICKET-ID`: the extracted Jira ID; omit if none found
- `type`: feat | fix | refactor | test | docs | chore | perf | style
- `scope`: affected component or area (e.g. `RosaWizard`, `build`)
- `short summary`: imperative mood, max ~60 chars


### Step 3 — Save the draft

Write the filled-out template to `pr_draft.md` in the workspace root.

### Step 4 — Validate

Run the repository's mandatory validation commands. **Stop the release process and do not proceed to Step 5 if any command fails.**

```bash
npm run build
npm run lint
npm run test:all:quiet
npm run test:e2e
```

All four must exit with code 0. Any failure means the branch is not ready to release.

### Step 5 — Stage and commit

If there are uncommitted or untracked changes other than `pr_draft.md`, stage and commit them.

`git add -u` stages modifications and deletions of tracked files and keeps what is already staged. It does not add new untracked files:

```bash
git add -u
```

Before staging untracked files, identify them first:

```bash
git ls-files --others --exclude-standard -- . ':(exclude)pr_draft.md'
```

Stage only the untracked paths you intend to include — show the list to the user and stage only confirmed paths. Do **not** automatically stage every untracked path without first reviewing the list with the user.

If `git diff --cached --quiet` exits 0, nothing was staged. Skip the commit. That happens when every real change is already committed and the only untracked file is `pr_draft.md`. Otherwise:

```bash
git commit -S -m "TICKET-ID: <short summary>" -m "Co-authored-by: cursor-agent <noreply@cursor.com>"
```

> **Note:** `-S` (GPG signing) requires a configured signing key (`git config user.signingkey`). Omit `-S` when signing is unavailable or not required by the repository.

- `TICKET-ID`: the extracted Jira ID (e.g. `FCN-340`). Omit if none found.
- `<short summary>`: reuse the short summary from the generated PR title
  (imperative mood, max ~60 chars).

Example commit messages:
- `FCN-340: add pr-release-agent Cursor skill`
- `OCMQE-1234: refactor cluster name validation hook`

If every change other than `pr_draft.md` is already committed, skip this step.

### Step 6 — Push the branch

```bash
git push -u origin HEAD
```

If the push fails (e.g. no upstream), surface the error and stop.

### Step 7 — Create or update the PR

Determine whether there is an **open** PR for this branch's **head**. Do **not**
reuse a **closed** or **merged** PR: in those cases **create** a new PR instead.

Substitute `<branch>` with the output of `git branch --show-current`. `gh pr list --head` takes that branch name only. It does not accept `OWNER:<branch>`.

**List open PRs for this head** (recommended):

```bash
gh pr list --head "<branch>" --state open --json number,url --jq '.[0].number // empty'
```

If this command fails (non-zero exit), **stop the workflow and report the error** — do not fall back to creating a new PR.

For a fork, `<owner>` is the head repository owner (the `OWNER` in `gh pr create --head OWNER:<branch>`). Do not pass `OWNER:<branch>` to `--head`. Filter the list by `headRefName` and `headRepositoryOwner`:

```bash
PLIST="$(gh pr list --state open --limit 100 --json number,headRefName,headRepositoryOwner)"
echo "$PLIST" | jq --arg branch "<branch>" --arg owner "<owner>" \
  '([.[] | select(.headRefName == $branch and .headRepositoryOwner.login == $owner)][0].number) // empty'
```

If `gh pr list` itself fails, **stop and report the error** — do not proceed to create a PR.

- **If the command prints a PR number**: **update** that PR:

  ```bash
  gh pr edit <number> --title "<generated title>" --body-file pr_draft.md
  ```

- **If the command exits successfully and prints nothing** (confirmed: no open PR for
  this branch): **create** a new PR:

  ```bash
  gh pr create --base "${INTEGRATION_BRANCH}" --head "<branch>" --title "<generated title>" --body-file pr_draft.md
  ```

  Omit `--head` when the current branch on `origin` is unambiguous for the repo
  (same as default `gh pr create`). For a fork, always supply both `--repo UPSTREAM_OWNER/REPO_NAME`
  (so the PR targets the correct upstream repository) and `--head <fork-owner>:<branch>`
  (where `<fork-owner>` is the fork owner's GitHub login). Example:

  ```bash
  gh pr create --repo <upstream-owner>/<repo-name> --base "${INTEGRATION_BRANCH}" --head <fork-owner>:<branch> \
    --title "<generated title>" --body-file pr_draft.md
  ```

  The `--head <fork-owner>:<branch>` form is only valid for `gh pr create`; do not use it with `gh pr list --head`.

  **Alternative:** `gh pr view --json number,url,state` — **edit only if `state` is
  `OPEN`**; if `MERGED` or `CLOSED`, **create** a new PR. If `gh pr view` fails for any
  reason (network error, auth issue, etc.), **stop the workflow and report the error** —
  do not fall back to creating a new PR. Only create a PR after a successful lookup
  confirms that no open PR exists. Prefer `pr list --state open` for the primary lookup.

In all cases, capture and display the resulting PR URL to the user.

### Step 8 — Clean up

After Step 7 succeeds (`gh pr create` or `gh pr edit` exits successfully), delete `pr_draft.md` from the workspace. Do not delete it before then, or `--body-file pr_draft.md` will fail.

## Error handling

- **`user.email` unset**: Stop; author-scoped drafts require `git config user.email`.
- **No authored work** (clean tree and no commits by `AUTHOR_EMAIL` in `MB..HEAD`): Stop; explain and point at `git config user.email` / branch history.
- **No changes at all** (clean tree AND no commits ahead of the integration branch): Stop and tell the user.
- **Validation fails** (Step 4): Stop; do not push or open a PR with a failing branch.
- **`gh` not authenticated**: Stop and tell the user to run `gh auth login`.
- **Commit fails**: Stop and show the error (e.g. pre-commit hook rejection).
- **Push fails**: Stop and show the error.
- **PR lookup fails** (`gh pr list` or `gh pr view` non-zero exit): Stop and show the error; do not create a PR.
- **PR creation or update fails**: Keep `pr_draft.md` so the user can retry manually, and show the error.

## Important notes

- PR bodies describe **only the configured author's commits** (and current `git diff` / `git diff --cached`), not the entire `INTEGRATION_BRANCH...HEAD` history from other contributors.
- NEVER force-push.
- NEVER modify git config.
- Always show the final PR URL to the user.
- If any step fails, stop the workflow and report clearly — do not continue silently.
