---
skill: manual-testing
description: Execute comprehensive manual test plan for ROSA HCP Wizard with focus on CIDR validation and state management
version: 1.0.0
tags: [testing, manual, qa, rosa-wizard]
---

# Manual Testing Execution Guide

Systematic guide for executing comprehensive manual test plans for the ROSA HCP Wizard before major releases or after significant changes.

## When to Use This Skill

Invoke this skill when:
- Preparing for a major release or production deployment
- After significant wizard changes (new steps, validation logic, state management)
- E2E test coverage is insufficient for a feature
- Investigating user-reported issues that require exploratory testing
- Testing cross-browser compatibility
- Validating accessibility features manually

**Note:** Manual testing complements but does not replace automated E2E tests.

## Pre-Test Setup

### 1. Environment Preparation

```bash
# Start development server
npm run dev

# Verify server is running
# Expected: Dev server at http://localhost:<port>
```

### 2. Browser DevTools Setup

Open browser DevTools (F12) with these tabs visible:
- **Console** - Monitor for errors, warnings, unexpected logs
- **Network** - Track API calls, check for failures (when APIs integrated)
- **Elements** (optional) - Inspect DOM for accessibility testing

### 3. Test Data Preparation

Reference `packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md` Appendix A for test data:

**Valid Cluster Names:**
- `test-cluster`
- `my-cluster-123`
- `cluster.v2`
- `a` (minimal)
- `a`.repeat(54) (maximal length)

**Invalid Cluster Names:**
- `Test-Cluster` (uppercase)
- `test cluster` (space)
- `test_cluster` (underscore)
- `1test` (starts with number)
- `test-` (ends with hyphen)
- `a`.repeat(55) (too long)

**Valid CIDRs:**
- `10.0.0.0/16`
- `172.30.0.0/16`
- `192.168.0.0/24`
- `10.128.0.0/14`

**Invalid CIDRs:**
- `not a cidr`
- `10.0.0` (incomplete)
- `256.0.0.0/16` (invalid octet)
- `10.0.0.0` (missing prefix)

**Valid KMS ARNs:**
- `arn:aws:kms:us-east-1:123456789012:key/12345678-1234-1234-1234-123456789012`

### 4. Test Execution Log

Create execution log (copy from `packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md` Appendix C):

| Test ID | Result | Notes | Tester | Date |
|---------|--------|-------|--------|------|
| 1.1 | ⬜ | | | |
| 1.2 | ⬜ | | | |

Legend:
- ⬜ = Not tested
- ✅ = Pass
- ❌ = Fail
- ⚠️ = Issue noted (not blocking)

## Test Execution Workflow

### Phase 1: Critical Path (30 min)

Execute these high-priority tests first to verify core functionality:

#### 1.1 Happy Path Flow
**Reference:** `packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md` Section 1 (full wizard flow)

**Steps:**
1. Fill all wizard steps with valid values
2. Navigate to Review page
3. Verify all values display correctly
4. (Do not submit - mock backend not implemented)

**Expected:** Smooth navigation, no errors in console, all data persists

**Critical checks:**
- No JavaScript errors in console
- All fields accept valid input
- Navigation buttons work correctly
- Review page displays all entered data

#### 1.2 CIDR Validation (HIGH PRIORITY - User Confusion Area)
**Reference:** `packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md` Section 4

**Focus on these scenarios:**
- Test ID 4.2: Machine CIDR invalid notation (`a b`)
- Test ID 4.7: Machine CIDR vs Service CIDR overlap
- Test ID 4.4: Machine CIDR prefix boundaries (multi-AZ)
- Test ID 4.11: CIDR mutual disjoint validation

**Why critical:** CIDR validation is most complex, highest user confusion

#### 1.3 VPC/Subnet Interaction
**Reference:** `packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md` Section 3

**Focus:**
- Test ID 3.2: VPC change resets subnet selection

**Steps:**
1. Select VPC 1, then select subnet
2. Change to VPC 2
3. Verify subnet field resets (shows placeholder)

**Expected:** Subnet selection clears when VPC changes

**Why critical:** Common user mistake, state management validation

### Phase 2: Validation Testing (15 min)

Systematic validation testing for each step:

#### 2.1 Details Step - Cluster Name
**Reference:** `packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md` Section 1

Execute test IDs: 1.1 - 1.6

**Focus on boundaries:**
- Exactly 54 chars (should pass)
- Exactly 55 chars (should fail)

#### 2.2 Roles & Policies - Operator Prefix
**Reference:** `packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md` Section 2

Execute test IDs: 2.1 - 2.2

#### 2.3 Encryption - KMS ARN
**Reference:** `packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md` Section 5

Execute test IDs: 5.1 - 5.5

**Focus:**
- Required field validation
- ARN format validation
- Two separate ARN fields (custom KMS vs etcd encryption)

### Phase 3: Navigation & State (10 min)

#### 3.1 Back Button
**Reference:** `packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md` Section 8.1

**Steps:**
1. Fill Details step completely
2. Navigate to Roles step
3. Fill some Roles fields
4. Click Back to Details
5. Verify all Details data preserved
6. Navigate forward to Roles
7. Verify Roles data preserved

**Expected:** No data loss when navigating back/forward

#### 3.2 Edit from Review
**Reference:** `packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md` Section 6.2

**Steps:**
1. Complete full wizard
2. From Review, click Edit link for Details
3. Change cluster name
4. Navigate back to Review
5. Verify change appears, other values unchanged

**Expected:** Edited value updates, other values persist

### Phase 4: YAML Editor (5 min)

**Reference:** `packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md` Section 7

#### 4.1 YAML Editor Workflow
- Open YAML editor from Review
- Verify YAML content displays
- Verify Monaco editor is interactive
- Test Discard confirmation modal
- Close YAML editor, verify return to Review

#### 4.2 Schema Panel
- Toggle schema panel button
- Verify panel appears/disappears

### Phase 5: Edge Cases (5 min)

#### 5.1 Rapid VPC Changes
**Reference:** `packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md` Section 11.1

**Steps:**
1. Rapidly select VPC 1 → VPC 2 → VPC 3
2. Wait for state to settle
3. Verify final state matches VPC 3
4. Check console for errors

**Expected:** No race condition errors, final state correct

#### 5.2 Default CIDR Values
**Reference:** `packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md` Section 11.3

**Steps:**
1. Navigate to Networking step
2. Expand advanced CIDR fields
3. Uncheck "Use default values"
4. Re-check "Use default values"
5. Verify fields populate with defaults:
   - Machine: `10.0.0.0/16`
   - Service: `172.30.0.0/16`
   - Pod: `10.128.0.0/14`
   - Host prefix: `/23`

## Console Monitoring

Throughout testing, actively monitor browser console for:

### Red Flags (❌ - Must be fixed)
- Uncaught exceptions
- React errors/warnings
- `console.error` output
- Network errors (when APIs integrated)
- Failed PropTypes validation

### Warnings (⚠️ - Note but may not block)
- `console.warn` output
- Performance warnings
- Deprecation warnings

### Acceptable
- `console.log` in story files (lint allows this)
- Development-mode React warnings about performance

### Console Check Template

For each test section, note:
```
Section: [e.g., "CIDR Validation"]
Console Errors: [None / List errors]
Console Warnings: [None / List warnings]
Network Issues: [None / List issues]
```

## Browser Compatibility Testing

### Browsers to Test

Minimum: Test on **two browsers** (one Chromium, one non-Chromium)

**High Priority:**
1. Chrome/Edge (latest) - Primary development browser
2. Firefox (latest) - Different rendering engine

**Medium Priority (if time permits):**
3. Safari (latest, macOS only) - Webkit engine

### Per-Browser Test Checklist

For each browser, execute:
1. ✅ Happy path flow (full wizard)
2. ✅ One CIDR validation test (e.g., overlap check)
3. ✅ Monaco editor loads in YAML view
4. ✅ No console errors specific to this browser

**Expected:** Consistent behavior across all browsers

**Document browser-specific issues:**
```
Browser: [Chrome/Firefox/Safari]
Issue: [Description]
Reproducible: [Yes/No]
Severity: [High/Medium/Low]
```

## Accessibility Spot Checks

### Keyboard Navigation
**Reference:** `packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md` Section 10

**Test:**
1. Use Tab key to navigate through Details step
2. Verify tab order is logical (matches visual layout)
3. Test dropdown keyboard access:
   - Tab to dropdown
   - Enter/Space to open
   - Arrow keys to navigate options
   - Enter to select

**Expected:** Full keyboard access without mouse

### Screen Reader (Optional - if time permits)
1. Enable screen reader (macOS VoiceOver, NVDA on Windows)
2. Navigate through one wizard step
3. Verify labels are announced correctly
4. Verify error messages are announced

## Test Data Management

### Test Data Variations

For thorough testing, vary test data across test runs:

**Run 1:** Minimal valid data
- Shortest cluster name (`a`)
- First option in each dropdown
- Default CIDR values

**Run 2:** Maximal valid data
- Longest cluster name (54 chars)
- Last option in each dropdown
- Custom CIDR values

**Run 3:** Mixed data
- Mid-length cluster name
- Random dropdown selections
- Some default, some custom CIDRs

### Data Persistence Testing

Between runs, test:
- Browser refresh (does data persist? - document behavior)
- Session storage behavior (if implemented)
- Local storage behavior (if implemented)

## Known Gotchas (from `packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md` Appendix C)

Be aware of these expected behaviors (not bugs):

1. **VPC selection resets subnet** - Expected, not a bug
2. **CIDR validation is complex** - Machine CIDR must CONTAIN subnet, Service/Pod must NOT overlap
3. **Multi-AZ affects CIDR constraints** - Different validation for multi vs single AZ
4. **Two "Key ARN" fields** - Custom KMS and etcd encryption have separate ARN inputs
5. **"Use default values" is a toggle** - Checking it hides AND resets CIDR fields
6. **Operator prefix auto-generated** - Based on cluster name, but editable
7. **Monaco editor async load** - May see loading state in YAML view

## Test Execution Tips

### 1. Systematic Approach
- Execute tests in order (don't skip around)
- Complete one section before moving to next
- Mark results immediately (don't rely on memory)

### 2. Note-Taking
For each failure or issue:
- Test ID
- Steps to reproduce
- Expected vs actual behavior
- Screenshot (if UI issue)
- Console errors (if any)
- Browser/OS

### 3. Time Management
- Set timer for each phase
- If running over time, skip Low Priority tests
- Focus on HIGH priority critical path

### 4. Don't Fix Bugs During Testing
- Document issues, don't stop to fix them
- Complete test execution first
- Triage and fix after testing complete

## Post-Test Actions

### 1. Results Summary

Calculate coverage:
```
Total tests: [X]
Executed: [Y]
Passed: [Z]
Failed: [F]
Skipped: [S]
Coverage: [Y/X * 100]%
```

### 2. Issue Triage

Classify failures by severity:

**High (Blocking Release):**
- Broken critical path (cannot complete wizard)
- Data loss on navigation
- JavaScript errors on core features

**Medium (Should Fix Before Release):**
- Validation not working as designed
- Confusing UX
- Edge case failures

**Low (Can defer):**
- Minor visual issues
- Rare edge cases
- Nice-to-have improvements

### 3. File Issues

For each failure, create ticket with:
- Title: `[Component] Brief description`
- Steps to reproduce
- Expected vs actual behavior
- Screenshots
- Console errors
- Browser/OS
- Severity classification

## Success Criteria

Manual testing is successful if:
- ✅ No High severity issues found
- ✅ Critical path (Happy path + CIDR + VPC/Subnet) passes
- ✅ No JavaScript console errors on core features
- ✅ Works in at least 2 browsers (Chrome + Firefox)
- ✅ Keyboard navigation functional
- ✅ Test execution log complete with results

## Related References

- **packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md** - Full test plan with all test cases
- **packages/nxtcm-rosa-hcp-wizard/docs/testing/E2E-TEST-GAPS.md** - Comparison of manual vs automated coverage
- **.agents/skills/cidr-validation-testing/SKILL.md** - CIDR validation domain knowledge
- **playwright/e2e/rosa-wizard.spec.ts** - Automated E2E tests (reference for expected behavior)

## Quick Start Checklist

Before beginning manual test session:

```
Pre-Test Setup:
- [ ] Dev server running (npm run dev)
- [ ] DevTools open (Console + Network tabs)
- [ ] Test data prepared (see Appendix A of packages/nxtcm-rosa-hcp-wizard/docs/testing/MANUAL-TEST-PLAN.md)
- [ ] Execution log ready
- [ ] Timer set for each phase

Test Execution:
- [ ] Phase 1: Critical Path (30 min)
- [ ] Phase 2: Validation Testing (15 min)
- [ ] Phase 3: Navigation & State (10 min)
- [ ] Phase 4: YAML Editor (5 min)
- [ ] Phase 5: Edge Cases (5 min)
- [ ] Browser Compatibility (10 min)

Post-Test:
- [ ] Results summary calculated
- [ ] Issues triaged by severity
- [ ] Tickets filed for failures
- [ ] Test log saved
```

Total estimated time: **75 minutes** (full execution with browser compatibility)

Minimum viable test: **45 minutes** (Phase 1-3 only, single browser)
