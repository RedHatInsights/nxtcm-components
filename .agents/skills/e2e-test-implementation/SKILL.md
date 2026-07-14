---
skill: e2e-test-implementation
description: Guide for implementing E2E tests from the test gap analysis, with patterns for CIDR validation, state management, and navigation workflows
version: 1.0.0
tags: [testing, e2e, playwright, implementation, rosa-wizard]
---

# E2E Test Implementation Guide

Systematic guide for implementing E2E tests identified in the test gap analysis (`packages/nxtcm-rosa-hcp-wizard/docs/testing/E2E-TEST-GAPS.md`), with reusable patterns for complex validation scenarios.

## When to Use This Skill

Invoke this skill when:
- Implementing E2E tests from `packages/nxtcm-rosa-hcp-wizard/docs/testing/E2E-TEST-GAPS.md`
- Adding tests for cross-field validation (CIDR overlaps, VPC/subnet dependencies)
- Testing state management and navigation workflows
- Writing helper functions for wizard test automation
- Prioritizing test implementation from the backlog

## Test Implementation Priority

From `packages/nxtcm-rosa-hcp-wizard/docs/testing/E2E-TEST-GAPS.md`, tests are classified:

### HIGH Priority ⚠️
Add these first - critical user workflows and complex business logic:
1. VPC change resets subnet selection
2. CIDR overlap validations (Machine/Service/Pod mutual disjoint)
3. Machine CIDR subnet containment
4. Service/Pod CIDR subnet non-overlap
5. Edit from Review workflow
6. Back button state preservation
7. Machine CIDR prefix boundaries (multi-AZ vs single-AZ)

### MEDIUM Priority
Important functionality, lower risk:
8. Review page comprehensive field verification
9. Validation blocks navigation
10. Service CIDR prefix boundaries
11. Valid input acceptance tests (positive cases)

### LOW Priority
Nice-to-have coverage:
12. Rapid selection change race conditions
13. Default CIDR value application
14. Accessibility (keyboard navigation)

## Test Implementation Patterns

### Pattern 1: Cross-Field Validation (CIDR Overlap)

**Use case:** Testing Machine/Service/Pod CIDRs must be mutually disjoint

```typescript
test('CIDR fields - must be mutually disjoint', async ({ page }) => {
  await openCidrFields(page);
  
  // Set Machine CIDR
  await page.getByRole('textbox', { name: 'Machine CIDR' }).fill('10.0.0.0/16');
  await page.getByRole('textbox', { name: 'Machine CIDR' }).press('Tab');
  
  // Service CIDR overlaps Machine
  const serviceCidr = page.getByRole('textbox', { name: 'Service CIDR' });
  await serviceCidr.fill('10.0.0.0/16');
  await serviceCidr.press('Tab');
  await expect(page.getByText(/overlaps.*Machine CIDR/i)).toBeVisible();
  
  // Fix Service CIDR
  await serviceCidr.fill('172.30.0.0/16');
  await serviceCidr.press('Tab');
  await expect(page.getByText(/overlaps/i)).not.toBeVisible();
});
```

**Key techniques:**
- Fill one field, blur, then fill dependent field
- Test both error and success cases
- Use regex matchers (`/overlaps.*Machine/i`) for flexible error message matching

### Pattern 2: State Management (VPC Changes Reset Subnet)

**Use case:** VPC selection should reset dependent subnet field

```typescript
test('changing VPC resets subnet selection', async ({ page }) => {
  await fillDetailsStep(page);
  await fillRolesStep(page);
  
  // Select VPC 1 and subnet
  await page.getByRole('button', { name: /Select a VPC/ }).click();
  await page.getByRole('option', { name: 'test-vpc-1' }).click();
  await page.getByRole('button', { name: 'Select private subnet' }).click();
  await page.getByRole('option', { name: /subnet.*vpc-1/ }).click();
  
  // Change to VPC 2
  await page.getByRole('button', { name: /test-vpc-1/ }).click();
  await page.getByRole('option', { name: 'test-vpc-2' }).click();
  
  // Subnet should be reset (placeholder visible again)
  await expect(page.getByRole('button', { name: 'Select private subnet' })).toBeVisible();
});
```

**Key techniques:**
- Verify initial state
- Perform state-changing action
- Assert dependent fields reset to initial/empty state

### Pattern 3: Navigation Workflows (Edit from Review)

**Use case:** Editing from Review should preserve other values

```typescript
test('editing from review updates displayed values', async ({ page }) => {
  await fillFullWizard(page);
  
  // Verify initial value
  await expect(page.getByText('test-cluster')).toBeVisible();
  
  // Click Edit on Details step
  await page.getByRole('link', { name: /Edit.*Details/i }).click();
  
  // Change cluster name
  const nameInput = page.getByRole('textbox', { name: 'Cluster name' });
  await nameInput.clear();
  await nameInput.fill('updated-cluster');
  
  // Navigate back to review
  await page.getByRole('button', { name: 'Next' }).click(); // Details → Roles
  await page.getByRole('button', { name: 'Next' }).click(); // Roles → Machine Pools
  await page.getByRole('button', { name: 'Next' }).click(); // Machine Pools → Networking
  await page.getByRole('button', { name: 'Next' }).click(); // Networking → Encryption
  await page.getByRole('button', { name: 'Next' }).click(); // Encryption → Updates
  await page.getByRole('button', { name: 'Next' }).click(); // Updates → Review
  
  // Verify updated value
  await expect(page.getByText('updated-cluster')).toBeVisible();
  await expect(page.getByText('test-cluster')).not.toBeVisible();
});
```

**Key techniques:**
- Fill wizard with known values
- Navigate to specific step via Edit link
- Modify field
- Navigate back through all steps to Review
- Verify change appears, other values unchanged

### Pattern 4: Boundary Testing (CIDR Prefix Constraints)

**Use case:** Machine CIDR prefix boundaries differ for multi-AZ vs single-AZ

```typescript
test('Machine CIDR - rejects mask too small for multi-AZ', async ({ page }) => {
  await openCidrFields(page);
  const input = page.getByRole('textbox', { name: 'Machine CIDR' });
  await input.fill('10.0.0.0/17'); // prefix > 16 for multi-AZ
  await input.press('Tab');
  await expect(page.getByText(/mask too small.*multi.*az/i)).toBeVisible();
});
```

**Constants referenced:**
- `AWS_MACHINE_CIDR_MIN = 16`
- `AWS_MACHINE_CIDR_MAX_MULTI_AZ = 16`
- `AWS_MACHINE_CIDR_MAX_SINGLE_AZ = 24`
- `SERVICE_CIDR_MAX = 12`
- `POD_CIDR_MAX` (check constants file)
- `HOST_PREFIX_MIN = 8`, `HOST_PREFIX_MAX = 32`

### Pattern 5: Validation Blocking Navigation

**Use case:** Invalid field should prevent Next button

```typescript
test('validation error prevents navigation to next step', async ({ page }) => {
  // Enter invalid cluster name
  await page.getByRole('textbox', { name: 'Cluster name' }).fill('1invalid');
  await page.getByRole('textbox', { name: 'Cluster name' }).press('Tab');
  
  // Fill other required fields
  await page.getByRole('combobox', { name: 'Select an OpenShift version' }).click();
  await page.getByRole('option', { name: 'OpenShift 4.12.0' }).click();
  // ... fill remaining required fields
  
  // Try to proceed
  await page.getByRole('button', { name: 'Next' }).click();
  
  // Should still be on Details step
  await expect(page.getByRole('textbox', { name: 'Cluster name' })).toBeVisible();
  await expect(page.getByText(/must not start with a number/i)).toBeVisible();
});
```

## Helper Function Templates

### fillFullWizardWithKnownValues

```typescript
interface WizardValues {
  clusterName: string;
  version: string;
  infraAccount: string;
  billingAccount: string;
  region: string;
  installerRole: string;
  oidcConfig: string;
  vpc: string;
  subnet: string;
  instanceType: string;
}

async function fillFullWizardWithKnownValues(page: Page, values: WizardValues) {
  // Details step
  await page.getByRole('textbox', { name: 'Cluster name' }).fill(values.clusterName);
  await page.getByRole('textbox', { name: 'Cluster name' }).press('Tab');
  await page.getByRole('combobox', { name: 'Select an OpenShift version' }).click();
  await page.getByRole('option', { name: values.version }).click();
  await page.getByRole('combobox', { name: 'Select an AWS infrastructure account' }).click();
  await page.getByRole('option', { name: values.infraAccount }).click();
  await page.getByRole('combobox', { name: 'Select an AWS billing account' }).click();
  await page.getByRole('option', { name: values.billingAccount }).click();
  await page.getByRole('combobox', { name: 'Select a region' }).click();
  await page.getByRole('option', { name: values.region }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  
  // Roles step
  await page.getByTestId('installer-role-select').click();
  await page.getByRole('option', { name: new RegExp(values.installerRole) }).click();
  await page.getByTestId('oidc-config-select').click();
  await page.getByRole('option', { name: values.oidcConfig }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  
  // Machine Pools step
  await page.getByRole('button', { name: /Select a VPC/ }).click();
  await page.getByRole('option', { name: values.vpc }).click();
  await page.getByRole('button', { name: 'Select private subnet' }).click();
  await page.getByRole('option', { name: new RegExp(values.subnet) }).click();
  await page.getByRole('button', { name: 'Select the compute node instance type' }).click();
  await page.getByRole('option', { name: values.instanceType }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  
  // Networking, Encryption, Updates steps (defaults)
  await page.getByRole('button', { name: 'Next' }).click(); // Networking
  await page.getByRole('button', { name: 'Next' }).click(); // Encryption
  await page.getByRole('button', { name: 'Next' }).click(); // Updates
}
```

### setCidrFields

```typescript
interface CidrFields {
  machine?: string;
  service?: string;
  pod?: string;
  hostPrefix?: string;
}

async function setCidrFields(page: Page, cidrs: CidrFields) {
  if (cidrs.machine !== undefined) {
    const input = page.getByRole('textbox', { name: 'Machine CIDR' });
    await input.fill(cidrs.machine);
    await input.press('Tab');
  }
  if (cidrs.service !== undefined) {
    const input = page.getByRole('textbox', { name: 'Service CIDR' });
    await input.fill(cidrs.service);
    await input.press('Tab');
  }
  if (cidrs.pod !== undefined) {
    const input = page.getByRole('textbox', { name: 'Pod CIDR' });
    await input.fill(cidrs.pod);
    await input.press('Tab');
  }
  if (cidrs.hostPrefix !== undefined) {
    const input = page.getByRole('textbox', { name: 'Host prefix' });
    await input.fill(cidrs.hostPrefix);
    await input.press('Tab');
  }
}
```

### selectVpcAndSubnet

```typescript
async function selectVpcAndSubnet(page: Page, vpc: string, subnet: string) {
  await page.getByRole('button', { name: /Select a VPC/ }).click();
  await page.getByRole('option', { name: vpc }).click();
  await page.getByRole('button', { name: 'Select private subnet' }).click();
  await page.getByRole('option', { name: new RegExp(subnet) }).click();
}
```

## Mock Data Requirements

For CIDR overlap and subnet containment tests, ensure mock data includes:

### VPCs with Known CIDR Ranges
```typescript
// Example mock VPCs
const mockVpcs = [
  {
    id: 'vpc-1',
    name: 'test-vpc-1',
    cidr: '10.0.0.0/16',
    subnets: [
      { id: 'subnet-1a', cidr: '10.1.0.0/24', az: 'us-east-1a' },
      { id: 'subnet-1b', cidr: '10.2.0.0/24', az: 'us-east-1b' }
    ]
  },
  {
    id: 'vpc-2',
    name: 'test-vpc-2',
    cidr: '192.168.0.0/16',
    subnets: [
      { id: 'subnet-2a', cidr: '192.168.1.0/24', az: 'us-east-1a' }
    ]
  }
];
```

### Test Data Catalog

**Valid CIDRs:**
- `10.0.0.0/16`
- `172.30.0.0/16`
- `192.168.0.0/24`
- `10.128.0.0/14`

**Invalid CIDRs (format):**
- `10.0.0` (incomplete IP)
- `256.0.0.0/16` (invalid octet)
- `10.0.0.0` (missing prefix)
- `10.0.0.0/` (incomplete prefix)

**Boundary CIDRs:**
- `/16` (multi-AZ limit for Machine CIDR)
- `/24` (single-AZ limit for Machine CIDR)
- `/12` (Service CIDR max)

## Success Criteria

For each implemented test:
- ✅ Test passes in isolation (`npm test -- <test-file>`)
- ✅ Test passes with full suite (`npm run test:e2e`)
- ✅ Test uses accessibility-first selectors (role, label, testid)
- ✅ Test includes both error and success cases (when applicable)
- ✅ Test error messages use flexible regex matching
- ✅ Helper functions extracted when pattern repeats 3+ times

## Coverage Targets

From `packages/nxtcm-rosa-hcp-wizard/docs/testing/E2E-TEST-GAPS.md`:

**Phase 1 (Critical):** 5 tests
- Coverage: ~50% of High Priority gaps
- Focus: State management, CIDR validation core

**Phase 2 (Important):** +4 tests
- Coverage: ~75% of Medium Priority gaps  
- Focus: Navigation, comprehensive validation

**Phase 3 (Nice to Have):** +4 tests
- Coverage: ~90% total
- Focus: Edge cases, positive tests

## Related References

- **packages/nxtcm-rosa-hcp-wizard/docs/testing/E2E-TEST-GAPS.md** - comprehensive gap analysis with test IDs and priorities
- **packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md** - manual test scenarios (source for E2E tests)
- **playwright/e2e/rosa-wizard.spec.ts** - existing E2E tests (patterns to follow)
- **packages/nxtcm-rosa-hcp-wizard/src/yupSchemas/networkingFields.ts** - CIDR validation logic
- **.agents/skills/cidr-validation-testing/SKILL.md** - CIDR domain expertise

## Common Pitfalls

❌ **Using CSS selectors** - use role/label/testid instead
❌ **Not testing success cases** - always test valid input is accepted
❌ **Hardcoded waits** - use Playwright auto-waiting, only add explicit waits for race conditions
❌ **Testing implementation details** - test user-facing behavior, not internal state
❌ **Duplicate test logic** - extract helper functions
❌ **Unclear error messages** - use regex matchers that capture intent

## Example Test File Structure

```typescript
import { test, expect, Page } from './fixtures';

// Helper functions
async function fillDetailsStep(page: Page) { ... }
async function fillRolesStep(page: Page) { ... }
async function openCidrFields(page: Page) { ... }

test.describe('ROSA Wizard - State Management', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('VPC change resets subnet selection', async ({ page }) => { ... });
  test('Back button preserves entered data', async ({ page }) => { ... });
});

test.describe('ROSA Wizard - CIDR Validation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('Machine/Service/Pod CIDRs must be mutually disjoint', async ({ page }) => { ... });
  test('Machine CIDR must contain selected subnet', async ({ page }) => { ... });
  test('Service CIDR must not overlap selected subnet', async ({ page }) => { ... });
});
```

## Implementation Workflow

1. **Select test from packages/nxtcm-rosa-hcp-wizard/docs/testing/E2E-TEST-GAPS.md** (start with High Priority)
2. **Read test description** and understand validation logic
3. **Check if helper functions exist** for this pattern
4. **Write test** following pattern from this skill
5. **Run test in isolation** to verify
6. **Extract helpers** if pattern repeats
7. **Run full suite** to check for regressions
8. **Mark test as implemented** in gap tracking
