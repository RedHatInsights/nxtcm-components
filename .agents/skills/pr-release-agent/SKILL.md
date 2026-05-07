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

**Author scope — required**

The PR **title, Description, Focus Areas, and checkbox inferences must reflect only
work authored by the person running the workflow** (plus any unstaged/staged edits
still on disk). Do **not** summarize, quote, or paraphrase commit messages from
other contributors—even if those commits sit on `main..HEAD`.

1. Resolve the author identity (read-only):

   ```bash
   AUTHOR_EMAIL="$(git config user.email)"
   ```

   If **`AUTHOR_EMAIL` is empty**, stop and tell the user to set `user.email` (or run
   the workflow after configuring it). Do **not** change git config — see Important
   notes.

2. Compute the merge base with the integration branch (assume **`main`** unless the
   user specifies otherwise):

   ```bash
   MB="$(git merge-base main HEAD)"
   ```

Run these commands **in parallel** with the usual housekeeping (branch, status):

```bash
git branch --show-current
git status --short
git diff
git diff --cached
```

**Commits and patches authored by `AUTHOR_EMAIL` only** — use these for narrative
scope (titles, bullets, Focus Areas):

```bash
git log "${MB}"..HEAD --author="${AUTHOR_EMAIL}" --oneline
git log "${MB}"..HEAD --author="${AUTHOR_EMAIL}" --stat
```

For finer detail when summarizing behaviour, restrict to authored commits:

```bash
git log "${MB}"..HEAD --author="${AUTHOR_EMAIL}" -p
```

**(Optional)** For awareness only — **do not** copy summaries from these into the PR
unless the user asked to describe the entire branch:

```bash
git log main..HEAD --oneline
git diff main...HEAD --stat
```

From the branch name, extract a **Jira ticket ID** if present.
Pattern: branch contains a segment matching `[A-Z]+-\d+` (e.g. `OCMQE-1234`).
If no match, leave the Jira field blank.

**Stopping**

- **No authored work**: If **`git diff` and `git diff --cached`** are empty **and**
  **`git log "${MB}"..HEAD --author="${AUTHOR_EMAIL}"`** is empty, stop and explain.
  Optionally note that `main..HEAD` still has other commits if
  `git log main..HEAD --oneline` is non-empty.

- **No changes at all** (no uncommitted work **and** no commits ahead of `main` on
  the branch): stop and tell the user.

### Step 2 — Draft the PR description

Read the PR template at `.github/pull_request_template.md`.

Fill every section using **`AUTHOR_EMAIL`-scoped commits and patches**, **plus**
 **`git diff` / `git diff --cached`** (your local edits).

| Template section | How to fill |
|---|---|
| **Description** | Summarize **only** the purpose of **your** authored commits and current local edits (`git log "${MB}"..HEAD --author=…`, `git show`/`git log -p` as needed). Do **not** describe unrelated commits **or reuse wording from merged PR descriptions** appearing elsewhere on the branch. If the GitHub branch includes others’ commits, you may add **one short line** under **Additional Notes** stating that broader history exists on this branch—but keep the template body about **your** scope. |
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

### Step 4 — Stage and commit

If there are uncommitted or untracked changes, stage and commit them:

```bash
git add -u
git commit -s -m "TICKET-ID: <short summary>" -m "Co-authored-by: cursor-agent <noreply@cursor.com>"
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

Determine whether there is an **open** PR for this branch’s **head**. Do **not**
reuse a **closed** or **merged** PR: in those cases **create** a new PR instead.

Substitute `<branch>` with the output of `git branch --show-current`. If the repo
uses a fork, use the `--head` form `OWNER:<branch>` (same value `gh push` /
GitHub associates with the branch).

**List open PRs for this head** (recommended):

```bash
gh pr list --head "<branch>" --state open --json number,url --jq '.[0].number'
```

- **If the command prints a PR number**: **update** that PR:

  ```bash
  gh pr edit <number> --title "<generated title>" --body-file pr_draft.md
  ```

- **If the command prints nothing** (no open PR for this branch, including after a
  previous PR was merged or closed): **create** a new PR:

  ```bash
  gh pr create --base main --head "<branch>" --title "<generated title>" --body-file pr_draft.md
  ```

  Omit `--head` when the current branch on `origin` is unambiguous for the repo
  (same as default `gh pr create`); keep `--head OWNER:<branch>` for forks.

  **Alternative:** `gh pr view --json number,url,state` — **edit only if
  `state` is `OPEN`**; if `MERGED` or `CLOSED` or the command fails, **create**
  a new PR. Prefer `pr list --state open` so you never target a closed PR.

In all cases, capture and display the resulting PR URL to the user.

### Step 7 — Clean up

After Step 6 succeeds (`gh pr create` or `gh pr edit` exits successfully), delete `pr_draft.md` from the workspace. Do not delete it before then, or `--body-file pr_draft.md` will fail.

## Error handling

- **`user.email` unset**: Stop; author-scoped drafts require `git config user.email`.
- **No authored work** (clean tree and no commits by `AUTHOR_EMAIL` in `MB..HEAD`): Stop; explain and point at `git config user.email` / branch history.
- **No changes at all** (clean tree AND no commits ahead of `main`): Stop and tell the user.
- **`gh` not authenticated**: Stop and tell the user to run `gh auth login`.
- **Commit fails**: Stop and show the error (e.g. pre-commit hook rejection).
- **Push fails**: Stop and show the error.
- **PR creation or update fails**: Keep `pr_draft.md` so the user can retry manually, and show the error.

## Important notes

- PR bodies describe **only the configured author’s commits** (and current `git diff` / `git diff --cached`), not the entire `main...HEAD` narrative from other PRs.
- NEVER force-push.
- NEVER modify git config.
- Always show the final PR URL to the user.
- If any step fails, stop the workflow and report clearly — do not continue silently.
