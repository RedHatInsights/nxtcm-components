# Jira AC Check Workflow - Security Model

## How It Works

The `jira-ac-check.yml` workflow automatically reviews PRs against their linked Jira ticket's acceptance criteria using an AI agent.

### Security Controls

This workflow uses `pull_request_target`, which means it runs with write permissions in the context of the base repository (not the fork). To prevent malicious PRs from exploiting this:

#### 1. **Label Gate** (Primary Control)
PRs from external contributors require manual approval:
- **Trusted contributors** (org members, collaborators, repo owners): runs automatically
- **External/fork PRs**: require a maintainer to add the `safe-to-review` label

When a fork PR is opened, the workflow posts a notice:
> 👋 Thanks for your contribution! A maintainer will add the `safe-to-review` label to trigger the automated Jira AC check once the PR has been reviewed for safety.

#### 2. **Input Validation** (Defense-in-Depth)
Even after approval, untrusted inputs are validated:
- Jira key must match `^FCN-[0-9]+$` (strict regex)
- Additional sanitization strips all non-alphanumeric chars except hyphens
- Only the sanitized key is used in the AI prompt

#### 3. **Limited Permissions**
The `GITHUB_TOKEN` is scoped to:
- `contents: read` - can't modify code
- `pull-requests: write` - can only comment on PRs
- `issues: write` - can only comment on issues

The `GITHUB_TOKEN` has no access to repository secrets, workflows, or push permissions. However, three repository secrets (`ACP_API_URL`, `ACP_TOKEN`, `ACP_PROJECT`) are passed as inputs to `ambient-code/ambient-action`. These are used by the action to authenticate the AI agent session — they are not exposed as shell environment variables within the workflow steps themselves.

## Usage

### For Maintainers

**To approve a fork PR for AI review:**
1. Review the PR diff and description for malicious content
2. Add the `safe-to-review` label
3. The workflow will trigger automatically

**Manual trigger:**
```bash
# Via GitHub UI: Actions → Jira AC Check → Run workflow
# Specify PR number and optionally override the Jira key
```

### For Contributors

**Org members/collaborators:**
- Workflow runs automatically when you open/update a PR

**External contributors:**
- Workflow will post a notice when you open a PR
- Wait for a maintainer to review and add `safe-to-review`
- Include a Jira key in your PR title (e.g., `FCN-123: Add feature`)

## Attack Surface Analysis

| Vector | Risk | Mitigation |
|--------|------|------------|
| PR title | Low | Regex extraction `grep -oE 'FCN-[0-9]+'` only captures the key pattern |
| PR body/diff | Medium | Label gate prevents untrusted execution; maintainer reviews before approval |
| GitHub token | Low | Scoped to read + comment only; can't modify code or access secrets |
| ACP credentials | Unknown | Depends on `ambient-action` implementation; should not expose secrets to agent |

## Workflow Diagram

```
Fork PR opened
    ↓
Is author trusted? (member/collaborator/owner)
    ↓ NO                          ↓ YES
Post "waiting for approval"       Extract Jira key
    ↓                              ↓
Maintainer reviews                Validate format (FCN-###)
    ↓                              ↓
Add 'safe-to-review' label        Sanitize for prompt
    ↓                              ↓
    └──────────→ Run AI review ←──┘
                      ↓
                Post PR comment with findings
```

## References

This pattern follows industry standards:
- Kubernetes: `ok-to-test` label for fork PRs
- OpenShift CI: `lgtm` label requirement
- GitHub Security: [Keeping your GitHub Actions secure](https://docs.github.com/en/actions/security-guides/security-hardening-for-github-actions#using-pull_request_target)
