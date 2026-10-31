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
