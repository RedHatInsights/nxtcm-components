# E2E Test Coverage Gaps vs Manual Test Plan

This document identifies test scenarios in the manual test plan that are **NOT** currently covered by our E2E tests.

---

## ✅ Already Covered in E2E

### Details Step - Cluster Name
- ✅ Required field validation
- ✅ Invalid characters (`a b`)
- ✅ Starting with number (`1cluster`)
- ✅ Ending with non-alphanumeric (`cluster-`)
- ✅ Max length boundary (55 chars rejected)

### Roles & Policies - Operator Prefix
- ✅ Invalid characters (`a b`)
- ✅ Max length boundary (33 chars rejected)

### Networking - CIDR Fields
- ✅ Machine CIDR - invalid notation (`a b`)
- ✅ Service CIDR - invalid notation (`a b`)
- ✅ Pod CIDR - invalid notation (`a b`)
- ✅ Host prefix - invalid format (`a b`)

### Encryption
- ✅ Custom KMS - required when selected
- ✅ Custom KMS - whitespace rejection (`a b`)
- ✅ Custom KMS - invalid ARN format (`not-a-valid-arn`)
- ✅ etcd encryption - required when enabled
- ✅ etcd encryption - whitespace rejection

### YAML Editor
- ✅ Opens from Review page
- ✅ Monaco editor loads
- ✅ Initial YAML content contains expected fields
- ✅ Editor is editable
- ✅ Discard confirmation modal flow
- ✅ Cancel discard
- ✅ Schema panel toggle button exists
- ✅ Create cluster button visible
- ✅ Cancel button visible

### Happy Path
- ✅ Full wizard flow completion
- ✅ Review page displays correct values

---

## ❌ NOT Covered - Should Add to E2E

### 1. Details Step - Cluster Name

#### 1.1 Valid Edge Cases
**Gap:** E2E doesn't verify these are **accepted**:
- Single character: `a`
- With dot: `cluster.v2`
- With hyphen and numbers: `my-cluster-123`
- Exactly 54 characters (max boundary)

**Why add:**
- Verifies we don't reject valid inputs
- Catches overly strict validation
- Boundary testing (54 chars accepted, 55 rejected)

**Priority:** Medium (boundary case especially important)

---

#### 1.2 Multiple Invalid Character Types
**Gap:** Only tests space. Doesn't test:
- Uppercase: `My-Cluster`
- Underscore: `cluster_name`
- Special chars: `cluster@123`

**Why add:**
- Regex validation can miss edge cases
- Different invalid chars may bypass different validation logic

**Priority:** Low (space test likely covers the regex)

---

### 2. Roles & Policies - Operator Prefix

#### 2.1 Valid Prefix Accepted
**Gap:** No test that valid prefix is **accepted**
- Valid: `my-prefix-123`
- Valid at boundary: 32 chars exactly

**Why add:**
- Ensures we accept valid inputs
- Boundary testing

**Priority:** Low

---

### 3. Machine Pools Step

#### 3.1 VPC Selection Required
**Gap:** No test verifying VPC is required before proceeding

**Why add:**
- Critical path validation
- Ensures Next button behavior

**Priority:** Medium

---

#### 3.2 VPC Change Resets Subnet
**Gap:** No test for VPC change cascading effects
- Select VPC 1 → select subnet
- Change to VPC 2 → subnet should reset

**Why add:**
- Common user confusion point (mentioned in requirements)
- State management validation
- Prevents stale subnet selection

**Priority:** HIGH ⚠️

**Suggested test:**
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

---

#### 3.3 Subnet Options Filter by VPC
**Gap:** No test that subnet options match selected VPC

**Why add:**
- Ensures data integrity
- Options filtering logic validation

**Priority:** Medium

---

### 4. Networking - CIDR Advanced Validation

#### 4.1 Valid CIDR Formats Accepted
**Gap:** Only tests **invalid** CIDRs. Doesn't verify these are **accepted**:
- `10.0.0.0/16`
- `172.30.0.0/16`
- `192.168.0.0/24`

**Why add:**
- Positive test cases
- Ensures validation doesn't over-reject

**Priority:** Medium

---

#### 4.2 CIDR Incomplete Formats
**Gap:** Only tests `a b`. Doesn't test partial IPs:
- `10.0.0` (incomplete IP)
- `10.0.0.0` (missing prefix)
- `10.0.0.0/` (incomplete prefix)
- `256.0.0.0/16` (invalid octet)

**Why add:**
- Common user typos
- Edge case validation

**Priority:** Low (basic invalid test likely covers)

---

#### 4.3 Machine CIDR - Prefix Size Constraints
**Gap:** No tests for prefix min/max boundaries:
- Too large mask: `/9` (prefix < AWS_MACHINE_CIDR_MIN)
- Too small mask multi-AZ: `/17` (prefix > 16)
- Too small mask single-AZ: `/25` (prefix > 24)

**Why add:**
- Complex business logic validation
- Multi-AZ vs single-AZ different constraints
- Critical for cluster provisioning success

**Priority:** HIGH ⚠️

**Suggested test:**
```typescript
test('Machine CIDR - rejects mask too small for multi-AZ', async ({ page }) => {
  await openCidrFields(page);
  const input = page.getByRole('textbox', { name: 'Machine CIDR' });
  await input.fill('10.0.0.0/17'); // prefix > 16 for multi-AZ
  await input.press('Tab');
  await expect(page.getByText(/mask too small.*multi.*az/i)).toBeVisible();
});
```

---

#### 4.4 Machine CIDR - Subnet Containment Validation
**Gap:** No test that Machine CIDR must **contain** selected subnet CIDR

**Example:**
- Selected subnet: `10.1.0.0/24`
- Machine CIDR: `192.168.0.0/16` → Should error (doesn't contain subnet)
- Machine CIDR: `10.0.0.0/16` → Should pass (contains subnet)

**Why add:**
- Complex cross-field validation
- Common VPC configuration issue
- Mentioned as user confusion point

**Priority:** HIGH ⚠️

**Suggested test:**
```typescript
test('Machine CIDR - must contain selected subnet', async ({ page }) => {
  await openCidrFields(page);
  // Assume selected subnet is 10.x.x.x range
  const input = page.getByRole('textbox', { name: 'Machine CIDR' });
  await input.fill('192.168.0.0/16'); // Different network
  await input.press('Tab');
  await expect(page.getByText(/must include.*subnet/i)).toBeVisible();
  
  // Valid case
  await input.fill('10.0.0.0/16');
  await input.press('Tab');
  await expect(page.getByText(/must include.*subnet/i)).not.toBeVisible();
});
```

---

#### 4.5 Service CIDR - Prefix Constraints
**Gap:** No test for Service CIDR prefix max (SERVICE_CIDR_MAX = 12)
- Invalid: `172.30.0.0/13` (prefix > 12)
- Valid: `172.30.0.0/12`

**Why add:**
- Business rule validation
- Different constraint than Machine CIDR

**Priority:** Medium

---

#### 4.6 Service/Pod CIDR - Subnet Non-Overlap
**Gap:** No test that Service/Pod CIDRs must NOT overlap selected subnets

**Example:**
- Selected subnet: `10.1.0.0/24`
- Service CIDR: `10.1.0.0/16` → Should error (overlaps)
- Service CIDR: `172.30.0.0/16` → Should pass (disjoint)

**Why add:**
- Complex cross-field validation
- Different logic than Machine CIDR (contains vs overlaps)
- Networking misconfiguration prevention

**Priority:** HIGH ⚠️

---

#### 4.7 CIDR Mutual Disjoint Validation
**Gap:** No test for overlap between Machine/Service/Pod CIDRs

**Example:**
- Machine CIDR: `10.0.0.0/16`
- Service CIDR: `10.0.0.0/16` → Should error (overlaps Machine)

**Test combinations:**
- Machine ↔ Service overlap
- Machine ↔ Pod overlap
- Service ↔ Pod overlap

**Why add:**
- Critical networking validation
- Referenced in code (`findOverlappingCidrFields`)
- Common configuration mistake

**Priority:** HIGH ⚠️

**Suggested test:**
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

---

#### 4.8 Host Prefix - Boundary Testing
**Gap:** No test for valid Host prefix formats
- Valid: `/23`, `/24`
- Invalid: `23` (missing `/`), `/999` (out of range)

**Why add:**
- Positive test cases
- Boundary validation

**Priority:** Low

---

### 5. Review Step

#### 5.1 All Fields Display Correctly
**Gap:** E2E only checks subset of fields on review:
- ✅ Cluster name, version, installer role, OIDC, instance type
- ❌ Missing: AWS accounts, region, VPC name, subnet, operator prefix, encryption settings, update strategy

**Why add:**
- Data transformation bugs
- End-to-end integration validation
- User-facing display correctness

**Priority:** Medium

**Suggested test:**
```typescript
test('review page displays all entered values correctly', async ({ page }) => {
  // Fill with specific known values
  await fillFullWizard(page, {
    clusterName: 'my-test-cluster',
    version: '4.12.0',
    infraAccount: 'AWS Account - Production',
    billingAccount: 'Billing Account - Main',
    region: 'US East (N. Virginia)',
    // ... all fields
  });
  
  // Verify each section
  await expect(page.getByText('my-test-cluster')).toBeVisible();
  await expect(page.getByText('AWS Account - Production')).toBeVisible();
  await expect(page.getByText('Billing Account - Main')).toBeVisible();
  // ... etc
});
```

---

#### 5.2 Edit from Review Navigation
**Gap:** No test for:
- Click "Edit" link on review
- Modify field
- Navigate back to review
- Verify change appears

**Why add:**
- Critical user workflow
- State persistence validation
- Navigation state management

**Priority:** HIGH ⚠️

**Suggested test:**
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

---

### 6. Navigation & State Management

#### 6.1 Back Button Preserves Data
**Gap:** No test that navigating back preserves entered data

**Why add:**
- State management validation
- Common user workflow
- Prevents data loss

**Priority:** HIGH ⚠️

**Suggested test:**
```typescript
test('back button preserves entered data', async ({ page }) => {
  // Fill Details step
  await page.getByRole('textbox', { name: 'Cluster name' }).fill('test-cluster');
  await page.getByRole('combobox', { name: 'Select an OpenShift version' }).click();
  await page.getByRole('option', { name: 'OpenShift 4.12.0' }).click();
  // ... fill all Details fields
  await page.getByRole('button', { name: 'Next' }).click();
  
  // Fill some of Roles step
  await page.getByTestId('installer-role-select').click();
  await page.getByRole('option', { name: /Installer-Role/ }).click();
  await page.getByRole('button', { name: 'Next' }).click();
  
  // Go back to Details
  await page.getByRole('button', { name: 'Back' }).click();
  await page.getByRole('button', { name: 'Back' }).click();
  
  // Verify data preserved
  await expect(page.getByRole('textbox', { name: 'Cluster name' })).toHaveValue('test-cluster');
  await expect(page.getByText('OpenShift 4.12.0')).toBeVisible();
});
```

---

#### 6.2 Validation Blocks Navigation
**Gap:** No test that invalid field prevents Next button

**Why add:**
- Form validation enforcement
- UX validation

**Priority:** Medium

**Suggested test:**
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

---

### 7. Edge Cases & Race Conditions

#### 7.1 Rapid VPC Changes
**Gap:** No test for rapid selection changes (race conditions)

**Why add:**
- Prevents race condition bugs
- Tests async state updates
- Real user behavior

**Priority:** Medium

**Suggested test:**
```typescript
test('rapid VPC selection changes handle gracefully', async ({ page }) => {
  await fillDetailsStep(page);
  await fillRolesStep(page);
  
  const vpcButton = page.getByRole('button', { name: /Select a VPC/ });
  
  // Rapidly change VPC selections
  await vpcButton.click();
  await page.getByRole('option', { name: 'test-vpc-1' }).click();
  
  await vpcButton.click();
  await page.getByRole('option', { name: 'test-vpc-2' }).click();
  
  await vpcButton.click();
  await page.getByRole('option', { name: 'test-vpc-3' }).click();
  
  // Wait for state to settle
  await page.waitForTimeout(500);
  
  // Verify final state matches VPC 3
  await expect(page.getByText('test-vpc-3')).toBeVisible();
  
  // No console errors
  // (Would need custom console monitoring setup)
});
```

---

#### 7.2 Default CIDR Value Application
**Gap:** No test that checking "Use default values" populates CIDRs

**Why add:**
- Feature validation
- Default value application logic

**Priority:** Medium

**Suggested test:**
```typescript
test('checking Use default values populates CIDR fields', async ({ page }) => {
  await openCidrFields(page); // This unchecks the default checkbox
  
  // Verify fields are editable (not default)
  const machineCidr = page.getByRole('textbox', { name: 'Machine CIDR' });
  await expect(machineCidr).toBeEditable();
  
  // Re-check "Use default values"
  await page.getByRole('checkbox', { name: 'Use default values' }).check();
  
  // Fields should be hidden or reset to defaults
  // (Implementation dependent - verify actual behavior)
});
```

---

### 8. Accessibility

#### 8.1 Tab Order
**Gap:** No test for keyboard navigation order

**Why add:**
- Accessibility validation
- Keyboard-only user support

**Priority:** Low (manual testing sufficient)

---

#### 8.2 Dropdown Keyboard Access
**Gap:** No test for keyboard-only dropdown interaction

**Why add:**
- Accessibility validation

**Priority:** Low

---

## 🔍 NOT Covered - Manual Testing Only

These scenarios are impractical or impossible to automate:

### Browser Compatibility
- Visual rendering differences across browsers
- Monaco editor behavior in Safari/Firefox
- Manual spot-check sufficient

### Performance/Console Monitoring
- Watching DevTools console during testing
- Performance warnings
- Best as manual observation

### Browser Refresh Behavior
- Session storage persistence (if implemented)
- Depends on implementation details

---

## Summary of HIGH Priority Gaps

| # | Test | Why Critical |
|---|------|--------------|
| 1 | VPC change resets subnet | User confusion point, state management |
| 2 | Machine CIDR prefix boundaries | Complex business logic, multi-AZ constraints |
| 3 | Machine CIDR contains subnet | Cross-field validation, common misconfiguration |
| 4 | Service/Pod CIDR non-overlap with subnets | Complex validation logic |
| 5 | CIDR mutual disjoint validation | Critical networking config, common mistake |
| 6 | Edit from Review navigation | Critical user workflow |
| 7 | Back button preserves data | State management, prevents data loss |

---

## Recommended E2E Test Additions

### Phase 1 (Critical - Add First)
1. VPC change resets subnet
2. CIDR overlap validations (Machine/Service/Pod mutual disjoint)
3. Machine CIDR subnet containment
4. Edit from Review workflow
5. Back button state preservation

### Phase 2 (Important)
6. Machine CIDR prefix boundaries (multi-AZ vs single-AZ)
7. Service/Pod CIDR subnet non-overlap
8. Review page comprehensive field verification
9. Validation blocks navigation

### Phase 3 (Nice to Have)
10. Valid input acceptance tests (positive cases)
11. Rapid selection change race conditions
12. Default CIDR value application
13. Service CIDR prefix boundaries

---

## Test Implementation Notes

### Helper Functions Needed

```typescript
// For comprehensive review testing
async function fillFullWizardWithKnownValues(page: Page, values: WizardValues) {
  // Parameterized wizard fill
}

// For VPC/subnet testing
async function selectVpcAndSubnet(page: Page, vpc: string, subnet: string) {
  // Reusable VPC selection
}

// For CIDR testing
async function setCidrFields(page: Page, cidrs: {
  machine?: string;
  service?: string;
  pod?: string;
  hostPrefix?: string;
}) {
  // Batch CIDR field setting
}
```

### Mock Data Requirements

For new tests, ensure mock data includes:
- Multiple VPCs with different subnet ranges
- Subnets with known CIDR blocks for overlap testing
- Multi-AZ and single-AZ configurations

---

## Conclusion

**Current E2E coverage:** ~30% of manual test scenarios  
**Coverage focused on:** Basic validation (required, format, length)  
**Major gaps:** Cross-field validation, state management, navigation workflows

**Recommended action:**
1. Add Phase 1 critical tests (5 tests)
2. Evaluate Phase 2 after Phase 1 completion
3. Keep Phase 3 tests as manual-only or add as time permits

The manual test plan will remain valuable for:
- Comprehensive validation before releases
- Browser compatibility checks
- Visual/UX validation
- Exploratory testing
