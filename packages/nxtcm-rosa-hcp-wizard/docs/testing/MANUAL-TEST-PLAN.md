# ROSA HCP Wizard - Manual User Acceptance Test Plan

**Target audience:** Experienced software developers with wizard domain knowledge  
**Purpose:** Comprehensive validation beyond happy path before release  
**Expected duration:** 45-60 minutes for full execution

---

## Prerequisites

- Local dev server running (`npm run dev`)
- Browser DevTools open (Console + Network tabs)
- Mock data loaded with diverse VPC/subnet/role options
- Test data ready (see Appendix)

---

## Test Structure

Each test case follows:
- **ID** - Unique identifier
- **Steps** - What to do
- **Expected** - What should happen
- **Notes** - Edge cases or common pitfalls

✅ = Pass | ❌ = Fail | ⚠️ = Needs investigation

---

## 1. Details Step - Cluster Name Validation

### 1.1 Required Field
**Steps:**
1. Focus cluster name input
2. Blur without entering value

**Expected:** "Required" error displays immediately

---

### 1.2 Invalid Characters
**Steps:**
1. Enter: `my cluster` (space)
2. Blur field

**Expected:** Error: "This value can only contain lowercase alphanumeric characters or '-' or '.'"

**Test variations:**
- `My-Cluster` (uppercase) → same error
- `cluster_name` (underscore) → same error
- `cluster@123` (special char) → same error

---

### 1.3 Numeric Start
**Steps:**
1. Enter: `1cluster`
2. Blur field

**Expected:** Error: "This value must not start with a number"

---

### 1.4 Invalid Ending
**Steps:**
1. Enter: `cluster-` (ends with hyphen)
2. Blur field

**Expected:** Error: "This value must end with an alphanumeric character"

**Test variations:**
- `cluster.` → same error
- `cluster-name.` → same error

---

### 1.5 Length Boundary
**Steps:**
1. Enter 54 chars: `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` ✅
2. Enter 55 chars: `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`

**Expected:**
- 54 chars: no error
- 55 chars: "This value can contain at most 54 characters"

**Notes:** Test exactly at boundary (54) to verify off-by-one errors

---

### 1.6 Valid Edge Cases
**Steps:** Verify these are **accepted**:
1. `a` (single char)
2. `cluster.v2`
3. `my-cluster-123`
4. `a`.repeat(54)

**Expected:** All pass validation

---

## 2. Roles & Policies Step - Operator Prefix

### 2.1 Invalid Characters
**Steps:**
1. Navigate to Roles step (fill Details first)
2. Modify "Operator roles prefix" to: `My Prefix`
3. Blur field

**Expected:** Error matching: "isn't valid, must consist of lower-case alphanumeric characters"

**Test variations:**
- `prefix_123` (underscore)
- `prefix-CAPS`

---

### 2.2 Length Boundary
**Steps:**
1. Enter 32 chars: `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa` ✅
2. Enter 33 chars: `aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa`

**Expected:**
- 32 chars: no error
- 33 chars: "may not exceed 32 characters"

---

## 3. Machine Pools Step - VPC & Subnet Selection

### 3.1 VPC Selection Required
**Steps:**
1. Navigate to Machine Pools step
2. Attempt to click "Next" without selecting VPC

**Expected:** Cannot proceed; VPC selection is required

---

### 3.2 Subnet Options Change With VPC
**Steps:**
1. Select VPC: `test-vpc-1`
2. Note available subnets
3. Change VPC to: `test-vpc-2`
4. Check subnet dropdown

**Expected:**
- Subnet field resets when VPC changes
- Only subnets belonging to selected VPC appear
- Previously selected subnet clears if not in new VPC

**Notes:** ⚠️ This is a common source of confusion - validate subnet list updates immediately

---

### 3.3 Instance Type Availability
**Steps:**
1. Select different VPCs
2. Observe instance type options

**Expected:** Instance types may vary by VPC's availability zones (though mock data may show same options)

---

## 4. Networking Step - CIDR Validation (CRITICAL SECTION)

⚠️ **Developer Note:** CIDR fields trip up users most frequently. Test thoroughly.

### 4.1 Access Advanced CIDR Fields
**Steps:**
1. Complete Details, Roles, Machine Pools steps
2. On Networking step, expand "Advanced networking configuration (optional)"
3. Uncheck "Use default values"

**Expected:** Machine CIDR, Service CIDR, Pod CIDR, Host prefix fields appear

---

### 4.2 Machine CIDR - Invalid Notation
**Steps:**
1. Enter Machine CIDR: `invalid text`
2. Blur field

**Expected:** Error: "isn't valid CIDR notation"

**Test variations:**
- `10.0.0` (incomplete IP)
- `10.0.0.0` (missing prefix)
- `10.0.0.0/` (incomplete prefix)
- `256.0.0.0/16` (invalid octet)

---

### 4.3 Machine CIDR - Valid Boundaries
**Steps:** Test these valid CIDRs:
1. `10.0.0.0/16` ✅
2. `192.168.1.0/24` ✅
3. `172.16.0.0/12` ✅

**Expected:** All validate successfully

---

### 4.4 Machine CIDR - Prefix Size Constraints (Multi-AZ)
**Context:** Multi-AZ clusters have different CIDR constraints

**Steps:**
1. Fill wizard with multi-AZ enabled
2. Set Machine CIDR: `10.0.0.0/9` (too large mask, prefix < min)
3. Set Machine CIDR: `10.0.0.0/17` (too small mask for multi-AZ, prefix > 16)

**Expected:**
- `/9`: Error about mask being too large
- `/17`: Error about mask being too small for multi-AZ

**Notes:** Min prefix = 16, Max multi-AZ = 16 based on `AWS_MACHINE_CIDR_MAX_MULTI_AZ`

---

### 4.5 Machine CIDR - Subnet Overlap Validation
**Steps:**
1. Select VPC with subnet CIDR: `10.1.0.0/24`
2. Set Machine CIDR: `192.168.0.0/16` (does NOT contain subnet)

**Expected:** Error: "Machine CIDR must include subnet starting IP"

**Valid test:**
1. Set Machine CIDR: `10.0.0.0/16` (contains `10.1.0.0`)

**Expected:** ✅ Validates

---

### 4.6 Service CIDR - Invalid Notation
**Steps:**
1. Enter Service CIDR: `not a cidr`
2. Blur field

**Expected:** Error: "isn't valid CIDR notation"

---

### 4.7 Service CIDR - Prefix Constraints
**Steps:**
1. Set Service CIDR: `172.30.0.0/13` (prefix > SERVICE_CIDR_MAX of 12)

**Expected:** Error about mask being too small (must allow enough services)

**Valid test:**
1. Set Service CIDR: `172.30.0.0/12` ✅

---

### 4.8 Service CIDR - Subnet Non-Overlap
**Steps:**
1. Select VPC with subnet: `10.1.0.0/24`
2. Set Machine CIDR: `10.0.0.0/16`
3. Set Service CIDR: `10.1.0.0/16` (overlaps subnet)

**Expected:** Error: "Service CIDR overlaps with subnet"

**Valid test:**
1. Set Service CIDR: `172.30.0.0/16` (completely disjoint) ✅

---

### 4.9 Pod CIDR - Invalid Notation
**Steps:**
1. Enter Pod CIDR: `abc def`
2. Blur field

**Expected:** Error: "isn't valid CIDR notation"

---

### 4.10 Pod CIDR - Subnet Non-Overlap
**Steps:**
1. With selected subnet: `10.1.0.0/24`
2. Set Pod CIDR: `10.1.0.0/14` (overlaps)

**Expected:** Error: "Pod CIDR overlaps with subnet"

**Valid test:**
1. Set Pod CIDR: `10.128.0.0/14` ✅

---

### 4.11 CIDR Fields - Mutual Disjoint Validation
**Steps:**
1. Set Machine CIDR: `10.0.0.0/16`
2. Set Service CIDR: `10.0.0.0/16` (overlaps Machine)

**Expected:** Error on Service CIDR: "overlaps with Machine CIDR"

**Test all combinations:**
- Machine ↔ Service
- Machine ↔ Pod  
- Service ↔ Pod

**Expected:** Any overlap between these three triggers error

---

### 4.12 Host Prefix - Invalid Format
**Steps:**
1. Enter Host prefix: `abc`
2. Blur field

**Expected:** Error: "isn't a valid subnet mask"

**Test variations:**
- `23` (missing `/`)
- `/` (incomplete)
- `/999` (out of range)

---

### 4.13 Host Prefix - Valid Format
**Steps:**
1. Enter: `/23` ✅
2. Enter: `/24` ✅

**Expected:** Both validate

---

## 5. Encryption Step - KMS Key ARN

### 5.1 Custom KMS - Required When Selected
**Steps:**
1. Navigate to Encryption step
2. Select radio: "Use custom AWS KMS key"
3. Leave "Key ARN" blank
4. Blur field

**Expected:** "Required" error displays

---

### 5.2 Custom KMS - Whitespace Rejection
**Steps:**
1. Select "Use custom AWS KMS key"
2. Enter Key ARN: `arn with spaces`
3. Blur field

**Expected:** Error: "Value must not contain whitespaces."

---

### 5.3 Custom KMS - Invalid ARN Format
**Steps:**
1. Enter Key ARN: `not-a-valid-arn`
2. Blur field

**Expected:** Error: "Key provided is not a valid ARN"

**Valid test:**
1. Enter: `arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012` ✅

---

### 5.4 etcd Encryption - Required When Enabled
**Steps:**
1. Check "Enable additional etcd encryption"
2. Leave "Key ARN" blank
3. Blur field

**Expected:** "Required" error displays

---

### 5.5 etcd Encryption - Whitespace Rejection
**Steps:**
1. Enable etcd encryption
2. Enter Key ARN: `arn with spaces`

**Expected:** "Value must not contain whitespaces."

---

## 6. Review Step - Data Accuracy

### 6.1 All Fields Display Correctly
**Steps:**
1. Complete full wizard with known values
2. Navigate to Review step
3. Verify each section displays correctly:
   - Details: cluster name, version, region, accounts
   - Roles: installer role ARN, OIDC config, operator prefix
   - Machine pools: VPC name, subnet, instance type, count/autoscaling
   - Networking: privacy, CIDRs (if customized)
   - Encryption: KMS selections
   - Updates: update strategy

**Expected:** All entered values match Review display

**Notes:** This catches data transformation bugs between form state and review

---

### 6.2 Edit from Review
**Steps:**
1. From Review, click any "Edit" link for a previous step
2. Modify a field
3. Click "Next" back to Review

**Expected:**
- Navigation works correctly
- Changed value appears in Review
- Other values remain unchanged

---

## 7. YAML Editor Workflow

### 7.1 Open YAML Editor
**Steps:**
1. Navigate to Review step
2. Click "Edit in YAML"

**Expected:**
- Monaco editor loads
- YAML content displays
- Contains: `kind: ROSAControlPlane`, `apiVersion: controlplane.cluster.x-k8s.io/v1beta2`
- Form values appear in YAML (cluster name, version, region, etc.)

---

### 7.2 YAML is Editable
**Steps:**
1. Click in Monaco editor
2. Type/edit content

**Expected:** Editor accepts input

---

### 7.3 Discard Confirmation
**Steps:**
1. In YAML editor, click "Discard changes and go back to Review step"
2. Modal appears with warning
3. Click "Cancel"

**Expected:** Modal closes, still in YAML editor

**Then:**
1. Click "Discard" again
2. Click "Yes"

**Expected:** Return to Review page, editor not visible

---

### 7.4 Schema Panel Toggle
**Steps:**
1. In YAML editor, locate "Toggle schema panel" button
2. Click it

**Expected:** Schema panel appears/disappears (implementation dependent)

---

## 8. Navigation & State Management

### 8.1 Back Button Preserves Data
**Steps:**
1. Fill Details step completely
2. Click "Next"
3. Fill Roles step
4. Click "Back"

**Expected:**
- Return to Details step
- All previously entered Details data still populated

**Repeat:** Navigate forward and back through all steps

---

### 8.2 Browser Refresh (if applicable)
**Steps:**
1. Fill form partially
2. Refresh browser

**Expected:** Depends on implementation:
- If session storage used: data may persist
- Otherwise: form resets (document behavior)

**Notes:** Document actual behavior for users

---

### 8.3 Validation on Navigation
**Steps:**
1. On Details step, enter invalid cluster name: `1invalid`
2. Click "Next"

**Expected:**
- Cannot proceed to next step
- Error displayed on invalid field

---

## 9. Error Handling - API Failures (Future)

⚠️ **Note:** Currently no API calls, but test when integrated

### 9.1 API Timeout
**Steps:**
1. Simulate API timeout for VPC list fetch
2. Observe UI

**Expected:**
- Loading state displays
- After timeout: error message
- Retry option available

---

### 9.2 API 500 Error
**Steps:**
1. Mock API returning 500 for roles fetch
2. Observe error handling

**Expected:**
- User-friendly error message
- Technical details available (DevTools)
- Can retry or continue with manual input

---

### 9.3 Partial API Failure
**Steps:**
1. VPC list loads successfully
2. Subnets for selected VPC fail to load

**Expected:**
- Clear indication which data failed
- Can still proceed with manual input (if allowed)

---

## 10. Accessibility & Keyboard Navigation

### 10.1 Tab Order
**Steps:**
1. Use Tab key to navigate through Details step
2. Verify logical order: cluster name → version → infrastructure account → billing account → region

**Expected:** Tab order matches visual layout

---

### 10.2 Dropdown Keyboard Access
**Steps:**
1. Tab to "OpenShift version" dropdown
2. Press Enter/Space to open
3. Use arrow keys to navigate
4. Press Enter to select

**Expected:** Full keyboard access without mouse

---

### 10.3 Error Focus
**Steps:**
1. Submit form with validation errors
2. Observe focus behavior

**Expected:** Focus moves to first invalid field (nice-to-have)

---

## 11. Edge Cases & Race Conditions

### 11.1 Rapid VPC Changes
**Steps:**
1. Select VPC 1
2. Immediately select VPC 2 before subnet list updates
3. Immediately select VPC 3

**Expected:**
- No race condition errors in console
- Final subnet list matches VPC 3
- No stale data from VPC 1/2

---

### 11.2 Concurrent Field Updates
**Steps:**
1. Type rapidly in cluster name field
2. Immediately blur
3. Validation fires

**Expected:** Validates against final value, not intermediate

---

### 11.3 Default Value Application
**Steps:**
1. Navigate to Networking
2. Expand CIDR fields
3. Check "Use default values" (if unchecked)

**Expected:** All CIDR fields populate with defaults:
- Machine: `10.0.0.0/16`
- Service: `172.30.0.0/16`
- Pod: `10.128.0.0/14`
- Host prefix: `/23`

---

## 12. Browser Compatibility (Spot Check)

**Browsers to test:**
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest, macOS only)

**For each:**
1. Run happy path flow
2. Test one complex CIDR validation
3. Verify Monaco editor loads in YAML view

**Expected:** Consistent behavior across browsers

---

## Appendix A: Test Data

### Valid Cluster Names
- `test-cluster`
- `my-cluster-123`
- `cluster.v2`
- `a` (minimal)
- `a`.repeat(54) (maximal)

### Invalid Cluster Names
- `Test-Cluster` (uppercase)
- `test cluster` (space)
- `test_cluster` (underscore)
- `1test` (starts with number)
- `test-` (ends with hyphen)
- `a`.repeat(55) (too long)

### Valid CIDRs
- `10.0.0.0/16`
- `172.30.0.0/16`
- `192.168.0.0/24`
- `10.128.0.0/14`

### Invalid CIDRs
- `not a cidr`
- `10.0.0` (incomplete)
- `256.0.0.0/16` (invalid octet)
- `10.0.0.0` (missing prefix)

### Valid KMS ARNs
- `arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012`
- `arn:aws:kms:us-west-2:123456789012:key/abcdef00-1234-5678-9abc-def012345678`

### Invalid KMS ARNs
- `not an arn`
- `arn with spaces`
- `arn:aws:kms` (incomplete)

---

## Appendix B: Console Checks

Throughout testing, monitor browser DevTools Console for:

❌ **Red Flags:**
- React errors/warnings
- Uncaught exceptions
- Network errors (when API integrated)
- `console.error` output

⚠️ **Acceptable (but note):**
- `console.log` in stories (allowed per lint config)
- Performance warnings (document, don't fail)

---

## Appendix C: Known Gotchas

Based on code review:

1. **VPC selection resets subnet** - Expected behavior, not a bug
2. **CIDR validation is complex** - Machine CIDR must contain selected subnet IPs
3. **Multi-AZ affects CIDR constraints** - Different validation for multi vs single AZ
4. **Two "Key ARN" fields** - One for custom KMS, one for etcd encryption (different contexts)
5. **"Use default values" is a toggle** - Checking it hides fields AND resets them
6. **Operator prefix auto-generated** - Based on cluster name, but can be edited
7. **Monaco editor requires async load** - May see loading state in YAML view

---

## Test Execution Log

| Test ID | Result | Notes | Tester | Date |
|---------|--------|-------|--------|------|
| 1.1 | ⬜ | | | |
| 1.2 | ⬜ | | | |
| ... | ⬜ | | | |

⬜ = Not tested | ✅ = Pass | ❌ = Fail | ⚠️ = Issue noted
