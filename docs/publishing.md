# Publishing packages

`@redhat-cloud-services/nxtcm-dashboard` and `@redhat-cloud-services/nxtcm-rosa-hcp-wizard` are published to npm via [`.github/workflows/publish-package.yml`](../.github/workflows/publish-package.yml) when a **GitHub Release is published** targeting `main`.

## Release tag format

The release tag must match the package version in that workspace's `package.json`:

| Package | Tag pattern | Example (`6.0.0`) |
| --- | --- | --- |
| Dashboard | `nxtcm-dashboard-v{version}` | `nxtcm-dashboard-v6.0.0` |
| ROSA HCP Wizard | `nxtcm-rosa-hcp-wizard-v{version}` | `nxtcm-rosa-hcp-wizard-v6.0.0` |

Tags that do not match either pattern will fail the workflow.

## What happens on publish

1. Workflow resolves the package from the release tag
2. Verifies the tag is reachable from `main` and matches `package.json` version
3. Runs lint, type-check, unit tests, component tests, and build for that package
4. Publishes to npm with provenance (requires `npm-publish` environment approval)

## Maintainer checklist

1. Bump `version` in the target package's `package.json`
2. Merge the version bump to `main`
3. Create a GitHub Release on `main` with the exact tag above
4. Approve the `npm-publish` environment when prompted

---

## Storybook deployment

The public Storybook at [redhatinsights.github.io/nxtcm-components](https://redhatinsights.github.io/nxtcm-components/) is deployed via [`.github/workflows/deploy-storybook.yml`](../.github/workflows/deploy-storybook.yml). It serves two paths:

| Path | Content | Trigger |
| --- | --- | --- |
| `/` (root) | Released documentation — built from the latest release tag commit | After successful npm publish (`workflow_run`) |
| `/next/` | Preview documentation — latest `main` branch | Push to `main` |

### How it works

Each deployment builds a **combined site** containing both paths and deploys them atomically. This prevents one path from overwriting the other:

1. **Resolve the latest release tag** — finds the most recent `nxtcm-dashboard-v*` or `nxtcm-rosa-hcp-wizard-v*` tag by creation date.
2. **Build root** — checks out the release tag commit (or `main` if no release exists) and builds Storybook with base path `/nxtcm-components/`.
3. **Build preview** — checks out `main` HEAD and builds Storybook with base path `/nxtcm-components/next/`.
4. **Combine** — merges both builds into a single artifact (root at `/`, preview at `/next/`).
5. **Deploy** — uploads the combined artifact to GitHub Pages.

Both builds run in parallel. A concurrency group (`deploy-storybook`, cancel-in-progress) ensures the latest trigger always wins.

### Triggers

| Event | Effect |
| --- | --- |
| Push to `main` | Rebuilds `/next/` with current code; root stays at latest release |
| Successful `Publish Package` workflow | Rebuilds root with the new release; `/next/` refreshes from `main` |
| Manual dispatch | Same as push to `main` |

### Version and release metadata

Each build writes a `storybook-metadata.json` file with:
- `deploymentType`: `release` or `preview`
- `dashboardVersion` and `wizardVersion`: package versions at the built commit
- `commitSha`: the exact commit SHA
- `timestamp`: build time

The Storybook manager UI displays package versions in the sidebar brand and an "[Unreleased]" label on preview builds.

### Independent package releases

Dashboard and wizard release independently, but the root storybook is always built from a single commit — whichever release tag was created most recently. This means both packages' code at that commit is included; if the dashboard has unreleased changes at the time of a wizard release, those changes will appear in the root storybook. Both package versions are displayed so it's clear what versions are in the build.

### Failure behavior

- If either build fails, the deploy job does not run. The previous successful deployment remains live.
- If Pages deployment fails, the previous deployment remains live.
- The workflow only deploys from the canonical repository (`RedHatInsights/nxtcm-components`), not from forks.

### Recovery

If a deployment needs to be rerun:
1. Go to Actions → "Deploy Storybook to GitHub Pages"
2. Click "Run workflow" (manual dispatch)

This rebuilds both paths from the current state (latest release tag + main HEAD).

### Verification URLs

After deployment, verify:
- Root: `https://redhatinsights.github.io/nxtcm-components/`
- Preview: `https://redhatinsights.github.io/nxtcm-components/next/`
- Dashboard story (root): `https://redhatinsights.github.io/nxtcm-components/?path=/docs/components-dashboard-dashboard--docs`
- Dashboard story (preview): `https://redhatinsights.github.io/nxtcm-components/next/?path=/docs/components-dashboard-dashboard--docs`
- Wizard story (root): `https://redhatinsights.github.io/nxtcm-components/?path=/docs/wizards-rosahcpwizard--docs`
- Wizard story (preview): `https://redhatinsights.github.io/nxtcm-components/next/?path=/docs/wizards-rosahcpwizard--docs`
