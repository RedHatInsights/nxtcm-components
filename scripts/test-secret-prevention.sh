#!/bin/bash
# test harness for secret leak prevention layers
# run from repo root: bash scripts/test-secret-prevention.sh

PASS=0
FAIL=0
SKIP=0

pass() { echo "  PASS: $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }
skip() { echo "  SKIP: $1"; SKIP=$((SKIP + 1)); }

echo ""
echo "=== Secret Leak Prevention — Test Suite ==="
echo ""

# ------------------------------------------------------------------
echo "--- Test 1: scan-secrets.sh (Cursor hook) ---"

HOOK=".cursor/hooks/scan-secrets.sh"
if [ ! -f "$HOOK" ]; then
  skip "scan-secrets.sh not found (FCN-353 not merged yet)"
else
  # test: git add with a file containing a secret should be denied
  tmpfile=$(mktemp /tmp/secret-test-XXXX.ts)
  echo 'const key = "AKIAZ5RQWLTGBHEC4J72";' > "$tmpfile"
  result=$(echo "{\"command\": \"git add $tmpfile\"}" | bash "$HOOK" 2>/dev/null || true)
  if echo "$result" | grep -q '"deny"' 2>/dev/null; then
    pass "scan-secrets blocks git add with AWS key"
  elif echo "$result" | grep -q '"allow"' 2>/dev/null; then
    fail "scan-secrets allowed git add with AWS key"
  else
    skip "scan-secrets output format unexpected: $result"
  fi
  rm -f "$tmpfile"

  # test: safe command should be allowed
  result=$(echo '{"command": "npm run build"}' | bash "$HOOK" 2>/dev/null || true)
  if echo "$result" | grep -q '"allow"' 2>/dev/null; then
    pass "scan-secrets allows safe command (npm run build)"
  else
    fail "scan-secrets blocked safe command"
  fi
fi

echo ""

# ------------------------------------------------------------------
echo "--- Test 2: gitleaks baseline ---"

if ! command -v gitleaks >/dev/null 2>&1; then
  skip "gitleaks not installed (brew install gitleaks)"
else
  # test: full repo scan with allowlist should find 0 leaks
  echo "  scanning repo (this takes ~30-60s)..."
  if gitleaks detect --source . --no-git --config .gitleaks.toml 2>/dev/null; then
    pass "gitleaks finds 0 leaks with .gitleaks.toml allowlist"
  else
    fail "gitleaks found leaks even with allowlist"
  fi

  # test: real secret in source file should be caught (with config — verifies [extend] useDefault works)
  printf 'aws_access_key_id = AKIAZ5RQWLTGBHEC4J72\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n' > src/test-secret-regression.ts
  if gitleaks detect --source src/test-secret-regression.ts --no-git --config .gitleaks.toml --verbose 2>/dev/null; then
    fail "gitleaks missed a real AWS secret in source file"
  else
    pass "gitleaks catches real AWS secret in source file (with config)"
  fi
  rm -f src/test-secret-regression.ts

  # test: same secret in test file should be allowed
  printf 'aws_access_key_id = AKIAZ5RQWLTGBHEC4J72\naws_secret_access_key = wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n' > src/test-secret-regression.spec.ts
  if gitleaks detect --source src/test-secret-regression.spec.ts --no-git --config .gitleaks.toml 2>/dev/null; then
    pass "gitleaks skips test files per allowlist"
  else
    fail "gitleaks flagged a test file that should be allowlisted"
  fi
  rm -f src/test-secret-regression.spec.ts
fi

echo ""

# ------------------------------------------------------------------
echo "--- Test 3: mock data standardization ---"

# test: no more non-doc account IDs
if grep -r "720424066366" src/ e2e-app/ playwright/ 2>/dev/null; then
  fail "found old account ID 720424066366 — should be 123456789012"
else
  pass "no non-doc AWS account IDs (720424066366 fully replaced)"
fi

# test: no more high-entropy OIDC paths
if grep -rE "oidc\.os1\.devshift\.org/[a-z0-9]{20,}" src/ e2e-app/ playwright/ 2>/dev/null; then
  fail "found high-entropy OIDC paths — should be simplified"
else
  pass "no high-entropy OIDC paths in mocks"
fi

echo ""

# ------------------------------------------------------------------
echo "--- Test 4: build verification ---"

echo "  running type-check..."
if npm run type-check >/dev/null 2>&1; then
  pass "TypeScript type-check passes"
else
  fail "TypeScript type-check failed"
fi

echo "  running lint..."
if npm run lint >/dev/null 2>&1; then
  pass "ESLint passes"
else
  fail "ESLint failed"
fi

echo ""

# ------------------------------------------------------------------
echo "=== Results ==="
echo "  Passed: $PASS"
echo "  Failed: $FAIL"
echo "  Skipped: $SKIP"
echo ""

if [ "$FAIL" -gt 0 ]; then
  echo "SOME TESTS FAILED"
  exit 1
else
  echo "ALL TESTS PASSED"
  exit 0
fi
