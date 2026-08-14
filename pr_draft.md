## Description

Centralizes field metadata and magic numbers into dedicated constant files for the ROSA HCP Wizard package. This refactoring introduces a `YUP` constants object in `yupSchemas/constants.ts` that houses all field schema metadata (IDs, labels, step IDs, field types, defaults, and behavioral flags) for every wizard step. Additionally, previously scattered magic numbers (root disk sizes, security group limits, autoscaling node caps, etc.) are extracted into `constants/index.ts`.

This eliminates duplicated literals across validation schemas and components, making the codebase easier to maintain and reducing the risk of inconsistencies when values change.

**Jira issue #** [FCN-661](https://redhat.atlassian.net/browse/FCN-661)

**Backport of** #


## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature/enhancement (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update
- [ ] UI/UX improvement
- [x] Code refactoring (no functional changes)
- [ ] Performance improvement
- [ ] Tests
- [ ] Configuration change
- [ ] Infrastructure/build change
- [ ] Other (please specify):


## Testing

### Manual Testing

**Test Steps:**
1. Run `npx tsc --noEmit` — no type errors
2. Run existing unit tests — all pass (no behavioral changes)
3. Open Storybook wizard stories — wizard renders and validates identically

**Test Environment:**
- [x] Tested locally
- [ ] Tested in Storybook

### Automated Testing

**E2E Run:**

- [ ] Playwright Tests: E2E tests completed successfully (npm run test:e2e)

**Unit Tests:**
- [ ] Unit tests added/updated
- [ ] All unit tests pass (npm run test)
- [ ] Ran new/updated files in Stryker

**Integration Tests:**
- [ ] Integration tests added/updated
- [ ] All integration tests pass


## Screenshots/Recordings

N/A — no UI changes, purely internal refactoring.

### Before

### After


## Checklist

### Code Quality
- [x] My code follows the project's style guidelines
- [x] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [x] I have removed any console logs and debugging code
- [x] My changes generate no new warnings or errors
- [x] I have checked for and fixed any linting errors (npm run lint)
- [ ] Code formatting is correct (npm run prettier:fix)

### Documentation
- [ ] I have updated the documentation accordingly
- [ ] I have updated the README if necessary
- [ ] I have added/updated Storybook stories for new/modified components
- [x] I have updated TypeScript types/interfaces

### Accessibility
- [ ] My changes follow accessibility best practices
- [ ] Interactive elements are keyboard accessible
- [ ] Proper ARIA labels and roles are used where needed
- [ ] Color contrast meets WCAG standards

### Dependencies
- [ ] Any dependent changes have been merged and published
- [ ] I have updated package dependencies if needed


## Breaking Changes

**Does this PR introduce breaking changes?**
- [ ] Yes
- [x] No


## Additional Notes

- `MAX_NODES_HCP_DEFAULT` and `MAX_NODES_HCP_INSUFFICIENT_VERSION` are re-exported from `utilities/getAutoscalingMaxNodes.ts` for backward compatibility with existing test imports.
- The `LOWERCASE_ALPHANUMERIC` constant is similarly re-exported from `yupSchemas/helpers.ts`.


## Reviewer Guidelines

### Focus Areas
- `packages/nxtcm-rosa-hcp-wizard/src/constants/index.ts` — new constants added
- `packages/nxtcm-rosa-hcp-wizard/src/yupSchemas/constants.ts` — new file with all field schema metadata
- `packages/nxtcm-rosa-hcp-wizard/src/validators.ts` — magic numbers replaced with constants
- `packages/nxtcm-rosa-hcp-wizard/src/utilities/helpers.ts` — magic numbers replaced with constants
- `packages/nxtcm-rosa-hcp-wizard/src/yupSchemas/*Fields.ts` — all schema files refactored to reference `YUP.*` constants

### Questions for Reviewers
- 

---
<!-- Thank you for contributing to nxtcm-components! -->
