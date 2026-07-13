---
skill: cidr-validation-testing
description: Comprehensive guide for testing CIDR validation logic including overlap detection, subnet containment, and multi-AZ constraints
version: 1.0.0
tags: [testing, validation, networking, rosa-wizard, cidr]
---

# CIDR Validation Testing Guide

Domain expertise for testing complex CIDR validation logic in the ROSA HCP Wizard. CIDR (Classless Inter-Domain Routing) validation is the most complex part of wizard validation, with multiple overlapping constraints and multi-AZ differences.

## When to Use This Skill

Invoke this skill when:
- Testing CIDR validation (Machine/Service/Pod/Host Prefix fields)
- Investigating CIDR-related bugs or user-reported issues
- Implementing CIDR validation logic
- Writing E2E or unit tests for networking step
- Understanding CIDR overlap/containment rules

**Note:** Users frequently misunderstand CIDR validation - it's a common source of confusion and support tickets.

## CIDR Validation Rules

### Machine CIDR

**Purpose:** Defines the IP address block for the VPC that hosts the cluster

**Validation Rules:**

1. **Must be valid CIDR notation** - Format: `x.x.x.x/y` where `x` is 0-255, `y` is 0-32
   - Valid: `10.0.0.0/16`, `192.168.1.0/24`
   - Invalid: `10.0.0`, `256.0.0.0/16`, `10.0.0.0/`

2. **Must be a subnet address** - The IP must be the network address for the CIDR block
   - Valid: `10.0.0.0/16` (network address)
   - Invalid: `10.0.0.1/16` (host address, not network)

3. **Prefix length boundaries**
   - **Minimum prefix:** `AWS_MACHINE_CIDR_MIN = 16` (smallest mask)
   - **Maximum prefix (multi-AZ):** `AWS_MACHINE_CIDR_MAX_MULTI_AZ = 16`
   - **Maximum prefix (single-AZ):** `AWS_MACHINE_CIDR_MAX_SINGLE_AZ = 24`
   
   Examples:
   - `/15` → Error: "mask too large" (prefix < 16)
   - `/17` (multi-AZ) → Error: "mask too small for multi-AZ" (prefix > 16)
   - `/25` (single-AZ) → Error: "mask too small for single-AZ" (prefix > 24)

4. **Must CONTAIN selected subnet CIDR** - The Machine CIDR must encompass the selected subnet's IP range
   - Selected subnet: `10.1.0.0/24`
   - Valid Machine CIDR: `10.0.0.0/16` (contains `10.1.0.0`)
   - Invalid Machine CIDR: `192.168.0.0/16` (does not contain subnet)
   
   Error message pattern: "Machine CIDR must include subnet starting IP"

5. **Must NOT overlap with Service/Pod CIDRs** - Machine, Service, and Pod must be mutually disjoint
   - Machine: `10.0.0.0/16`
   - Service: `10.0.0.0/16` → Error: "overlaps with Machine CIDR"
   - Valid Service: `172.30.0.0/16` (disjoint)

**Constants:**
- File: `packages/nxtcm-rosa-hcp-wizard/src/constants.ts`
- `AWS_MACHINE_CIDR_MIN = 16`
- `AWS_MACHINE_CIDR_MAX_MULTI_AZ = 16`
- `AWS_MACHINE_CIDR_MAX_SINGLE_AZ = 24`

**Code References:**
- Validation: `packages/nxtcm-rosa-hcp-wizard/src/yupSchemas/networkingFields.ts:70-149`
- Helper: `isValidCidr()`, `isCidrSubnetAddress()`, `containsCidr()` (from `cidr-tools`)

### Service CIDR

**Purpose:** Defines the IP address block for Kubernetes services

**Validation Rules:**

1. **Must be valid CIDR notation** (same as Machine CIDR)

2. **Must be a subnet address** (same as Machine CIDR)

3. **Prefix length boundaries**
   - **Maximum prefix:** `SERVICE_CIDR_MAX = 12`
   - **Minimum prefix:** `1`
   
   Examples:
   - `/13` → Error: "mask too small" (prefix > 12)
   - `/12` → Valid
   - `/0` → Error: "subnet mask must be between 1 and 12"

4. **Must NOT overlap with selected subnet** - Service CIDR and VPC subnet must be disjoint
   - Selected subnet: `10.1.0.0/24`
   - Invalid Service CIDR: `10.1.0.0/16` (overlaps)
   - Valid Service CIDR: `172.30.0.0/16` (disjoint)
   
   Error message pattern: "Service CIDR overlaps with subnet"

5. **Must NOT contain selected subnet starting IP**
   - If Service CIDR *contains* the subnet's starting IP, error
   - This is different from Machine CIDR which *must* contain it

6. **Must NOT overlap with Machine/Pod CIDRs** - Mutually disjoint rule

**Constants:**
- `SERVICE_CIDR_MAX = 12`

**Code References:**
- Validation: `packages/nxtcm-rosa-hcp-wizard/src/yupSchemas/networkingFields.ts:151-227`
- Helper: `overlapCidr()`, `containsCidr()` (from `cidr-tools`)

### Pod CIDR

**Purpose:** Defines the IP address block for pod networking

**Validation Rules:**

1. **Must be valid CIDR notation** (same as Machine CIDR)

2. **Must be a subnet address** (same as Machine CIDR)

3. **Prefix length boundaries**
   - **Maximum prefix:** `POD_CIDR_MAX = 18` (check constants)
   - Affects maximum pod nodes calculation:
     - `maxPodIPs = 2^(32 - hostPrefixLen)`
     - `maxPodNodes = floor(2^(32 - podCidrPrefix) / maxPodIPs)`
     - Must support `POD_NODES_MIN` (check constants) nodes
   
   Error: "Pod CIDR prefix too large - not enough nodes"

4. **Must NOT overlap with selected subnet** (same logic as Service CIDR)

5. **Must NOT contain selected subnet starting IP** (same logic as Service CIDR)

6. **Must NOT overlap with Machine/Service CIDRs** - Mutually disjoint rule

**Constants:**
- `POD_CIDR_MAX = 18` (verify in constants file)
- `POD_NODES_MIN` (check constants file)

**Code References:**
- Validation: `packages/nxtcm-rosa-hcp-wizard/src/yupSchemas/networkingFields.ts:229-303`

### Host Prefix

**Purpose:** Defines the subnet prefix length for pod IP allocation per node

**Validation Rules:**

1. **Must match format:** `/\d+` (slash followed by digits)
   - Valid: `/23`, `/24`, `/32`
   - Invalid: `23` (missing `/`), `/` (no number), `/999` (out of range)

2. **Prefix length boundaries**
   - **Minimum prefix:** `HOST_PREFIX_MIN = 8`
   - **Maximum prefix:** `HOST_PREFIX_MAX = 32`
   
   Examples:
   - `/7` → Error: "mask too large" (prefix < 8)
   - `/33` → Error: "mask too small" (prefix > 32)

3. **Default value:** `/23`

**Constants:**
- `HOST_PREFIX_MIN = 8`
- `HOST_PREFIX_MAX = 32`
- `HOST_PREFIX_REGEXP` - regex for format validation

**Code References:**
- Validation: `packages/nxtcm-rosa-hcp-wizard/src/yupSchemas/networkingFields.ts:305-342`

### Cross-Field Validation: Mutual Disjoint CIDRs

**Rule:** Machine, Service, and Pod CIDRs must NOT overlap each other

**Implementation:** `findOverlappingCidrFields()` helper function

**Test all combinations:**
- Machine ↔ Service overlap
- Machine ↔ Pod overlap
- Service ↔ Pod overlap

**Example:**
- Machine: `10.0.0.0/16`
- Service: `10.0.0.0/16` → Error
- Pod: `10.128.0.0/14` → Error (overlaps Machine)

**Valid configuration:**
- Machine: `10.0.0.0/16`
- Service: `172.30.0.0/16`
- Pod: `192.168.0.0/14`

**Code Reference:**
- Helper: `packages/nxtcm-rosa-hcp-wizard/src/yupSchemas/helpers.ts:findOverlappingCidrFields()`

## Test Data Catalog

### Valid CIDRs

```typescript
const validCidrs = {
  machine: [
    '10.0.0.0/16',
    '172.16.0.0/16',
    '192.168.0.0/16',
  ],
  service: [
    '172.30.0.0/16',
    '10.43.0.0/16',
  ],
  pod: [
    '10.128.0.0/14',
    '192.168.0.0/14',
  ],
  hostPrefix: [
    '/23',
    '/24',
    '/16',
  ],
};
```

### Invalid CIDR Formats

```typescript
const invalidFormats = [
  '10.0.0',         // Incomplete IP
  '256.0.0.0/16',   // Invalid octet (> 255)
  '10.0.0.0',       // Missing prefix
  '10.0.0.0/',      // Incomplete prefix
  'not-a-cidr',     // Text
  '10.0.0.0/33',    // Prefix out of range
];
```

### Boundary Test Cases

```typescript
const boundaryCases = {
  machineCidr: {
    tooLargeMask: '10.0.0.0/15',      // prefix < 16
    multiAzTooSmall: '10.0.0.0/17',   // prefix > 16 (multi-AZ)
    singleAzTooSmall: '10.0.0.0/25',  // prefix > 24 (single-AZ)
    validMultiAz: '10.0.0.0/16',      // exactly at limit
    validSingleAz: '10.0.0.0/24',     // exactly at limit
  },
  serviceCidr: {
    tooSmallMask: '172.30.0.0/13',    // prefix > 12
    valid: '172.30.0.0/12',           // exactly at limit
  },
  hostPrefix: {
    tooLarge: '/7',                   // prefix < 8
    tooSmall: '/33',                  // prefix > 32
    valid: '/23',                     // default
  },
};
```

### Overlap Test Scenarios

```typescript
const overlapScenarios = {
  // Machine vs Service overlap
  machineServiceOverlap: {
    machine: '10.0.0.0/16',
    service: '10.0.0.0/16',  // Exact overlap
    shouldError: true,
  },
  
  // Machine must contain subnet
  machineContainsSubnet: {
    subnet: '10.1.0.0/24',
    validMachine: '10.0.0.0/16',      // Contains subnet
    invalidMachine: '192.168.0.0/16', // Does not contain
  },
  
  // Service must not overlap subnet
  serviceNoOverlapSubnet: {
    subnet: '10.1.0.0/24',
    invalidService: '10.1.0.0/16',    // Overlaps
    validService: '172.30.0.0/16',    // Disjoint
  },
};
```

## Common Validation Errors

### Error: "isn't valid CIDR notation"
**Cause:** Invalid format (not `x.x.x.x/y`)
**Test cases:** `'10.0.0'`, `'256.0.0.0/16'`, `'not-a-cidr'`

### Error: "mask too large"
**Cause:** Prefix length < minimum
**Test cases:**
- Machine CIDR: `'10.0.0.0/15'` (prefix < 16)
- Host prefix: `'/7'` (prefix < 8)

### Error: "mask too small for multi-AZ"
**Cause:** Machine CIDR prefix > 16 when multi-AZ enabled
**Test case:** `'10.0.0.0/17'` with `multi_az = 'true'`

### Error: "mask too small for single-AZ"
**Cause:** Machine CIDR prefix > 24 when single-AZ
**Test case:** `'10.0.0.0/25'` with `multi_az = 'false'`

### Error: "Machine CIDR must include subnet starting IP"
**Cause:** Machine CIDR does not contain selected subnet's IP range
**Test case:**
- Subnet: `10.1.0.0/24`
- Machine CIDR: `192.168.0.0/16`

### Error: "overlaps with Machine CIDR" / "overlaps with Service CIDR"
**Cause:** Two CIDRs (Machine/Service/Pod) are not disjoint
**Test case:**
- Machine: `10.0.0.0/16`
- Service: `10.0.0.0/16`

### Error: "Service CIDR overlaps with subnet"
**Cause:** Service CIDR overlaps with selected VPC subnet
**Test case:**
- Subnet: `10.1.0.0/24`
- Service CIDR: `10.1.0.0/16`

### Error: "isn't a valid subnet mask"
**Cause:** Host prefix format invalid
**Test cases:** `'23'` (missing `/`), `'/abc'`, `'/999'`

## Testing Strategies

### Unit Testing (yup schemas)

Test the validation functions directly:

```typescript
// Test Machine CIDR validation
import { networkMachineCidrSchema } from './networkingFields';

test('Machine CIDR rejects prefix > 16 for multi-AZ', async () => {
  const context = {
    parent: { multi_az: 'true' },
    createError: jest.fn(),
  };
  
  const result = await networkMachineCidrSchema.validate(
    '10.0.0.0/17',
    { context }
  );
  
  expect(context.createError).toHaveBeenCalledWith(
    expect.objectContaining({
      message: expect.stringMatching(/mask too small.*multi.*az/i)
    })
  );
});
```

### E2E Testing (Playwright)

Test the user-facing validation behavior:

```typescript
test('Machine CIDR validation', async ({ page }) => {
  await openCidrFields(page);
  
  const input = page.getByRole('textbox', { name: 'Machine CIDR' });
  
  // Test invalid format
  await input.fill('invalid');
  await input.press('Tab');
  await expect(page.getByText(/isn't valid CIDR notation/i)).toBeVisible();
  
  // Test valid CIDR
  await input.fill('10.0.0.0/16');
  await input.press('Tab');
  await expect(page.getByText(/isn't valid CIDR notation/i)).not.toBeVisible();
});
```

### Component Testing (Playwright CT)

Test form component behavior with CIDR validation:

```typescript
test('CIDR fields validate on blur', async ({ mount }) => {
  const component = await mount(<NetworkingStep {...props} />);
  
  const machineCidr = component.getByRole('textbox', { name: 'Machine CIDR' });
  await machineCidr.fill('invalid');
  await machineCidr.blur();
  
  await expect(component.getByText(/isn't valid CIDR notation/i)).toBeVisible();
});
```

## Debugging CIDR Issues

### Check Multi-AZ vs Single-AZ State

CIDR constraints differ based on `multi_az` field value:

```typescript
// In form state or yup context
const isMultiAz = formData.multi_az === 'true';
const maxPrefix = isMultiAz ? AWS_MACHINE_CIDR_MAX_MULTI_AZ : AWS_MACHINE_CIDR_MAX_SINGLE_AZ;
```

### Verify Subnet CIDR in Mock Data

Ensure test fixtures have realistic subnet CIDRs:

```typescript
const mockSubnet = {
  cidr_block: '10.1.0.0/24',  // Must be within selected VPC CIDR
  name: 'test-subnet-1a',
  subnet_id: 'subnet-abc123',
};
```

### Check CIDR Helper Functions

Import and test helpers directly:

```typescript
import { isValidCidr, isCidrSubnetAddress } from './helpers';
import { containsCidr, overlapCidr } from 'cidr-tools';

// Test containment
const machine = '10.0.0.0/16';
const subnet = '10.1.0.0/24';
const contains = containsCidr(machine, subnet); // true

// Test overlap
const service = '10.0.0.0/16';
const overlaps = overlapCidr(machine, service); // true
```

## Edge Cases & Gotchas

### 1. Subnet Starting IP vs Full CIDR

**Gotcha:** Machine CIDR must contain subnet's **starting IP**, not necessarily the full CIDR block

```typescript
// Subnet: 10.1.0.0/24
// Machine CIDR: 10.0.0.0/8  ✅ Contains 10.1.0.0
// Machine CIDR: 192.168.0.0/16  ❌ Does not contain 10.1.0.0
```

Code uses: `containsCidr(machineCidr, getStartingIP(subnet.cidr_block))`

### 2. Multi-AZ Detection

**Gotcha:** Multi-AZ state affects Machine CIDR validation but not Service/Pod

Multi-AZ is determined from:
- `formData.multi_az === 'true'` OR
- `formData.hypershift === 'true'`

### 3. Default Values

**Gotcha:** Default CIDRs are set when "Use default values" is checked

Defaults:
- Machine CIDR: `10.0.0.0/16`
- Service CIDR: `172.30.0.0/16`
- Pod CIDR: `10.128.0.0/14`
- Host Prefix: `/23`

These defaults are mutually disjoint and should always pass validation.

### 4. CIDR Validation is Debounced

**Gotcha:** In the UI, validation may not trigger immediately on keystroke

Yup validation runs on blur or form submission, not on every character typed.

### 5. Validation Order Matters

**Gotcha:** Some validations depend on other field values

Example: Machine CIDR subnet containment check requires `selectedSubnets` from context.

Ensure test context includes all dependencies:

```typescript
const context = {
  parent: formData,
  options: {
    context: {
      selectedSubnets: mockSubnets,
      msgs: validationMessages,
    }
  }
};
```

## Related References

- **networkingFields.ts**: `packages/nxtcm-rosa-hcp-wizard/src/yupSchemas/networkingFields.ts`
- **helpers.ts**: `packages/nxtcm-rosa-hcp-wizard/src/yupSchemas/helpers.ts`
- **constants.ts**: `packages/nxtcm-rosa-hcp-wizard/src/constants.ts`
- **cidr-tools library**: https://www.npmjs.com/package/cidr-tools
- **E2E tests**: `playwright/e2e/rosa-wizard.spec.ts` (lines 190-223)
- **E2E-TEST-GAPS.md**: Section 4 - Networking CIDR validation gaps
- **MANUAL-TEST-PLAN.md**: Section 4 - CIDR field manual test cases

## Quick Reference: Validation Constants

```typescript
// Machine CIDR
AWS_MACHINE_CIDR_MIN = 16
AWS_MACHINE_CIDR_MAX_MULTI_AZ = 16
AWS_MACHINE_CIDR_MAX_SINGLE_AZ = 24

// Service CIDR
SERVICE_CIDR_MAX = 12

// Pod CIDR
POD_CIDR_MAX = 18  // verify
POD_NODES_MIN = ?  // check constants

// Host Prefix
HOST_PREFIX_MIN = 8
HOST_PREFIX_MAX = 32
HOST_PREFIX_REGEXP = /^\/\d+$/

// CIDR Format
CIDR_REGEXP = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\/\d{1,2}$/
```

## Validation Flow Diagram

```
User enters CIDR → Blur event
  ↓
Format validation (CIDR_REGEXP)
  ↓
Subnet address validation (isCidrSubnetAddress)
  ↓
Prefix boundary validation (min/max checks)
  ↓
Cross-field validation
  ├─ Machine CIDR: contains subnet? ✅
  ├─ Service/Pod CIDR: overlaps subnet? ❌
  └─ All CIDRs: mutually disjoint? ✅
  ↓
Display error or clear field
```
