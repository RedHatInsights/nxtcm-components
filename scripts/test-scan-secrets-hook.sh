#!/bin/bash
# tests for .cursor/hooks/scan-secrets.sh
# verifies secret detection, bypass prevention, file exclusions, and error handling.
#
# usage: bash scripts/test-scan-secrets-hook.sh
# requires: jq, grep -E

set -uo pipefail

HOOK=".cursor/hooks/scan-secrets.sh"
PASS=0
FAIL=0
TOTAL=0

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

run_test() {
  local desc="$1"
  local input="$2"
  local expect="$3" # "allow" or "deny"
  TOTAL=$((TOTAL + 1))

  result=$(echo "$input" | bash "$HOOK" 2>/dev/null)

  if echo "$result" | grep -q "\"permission\": \"$expect\""; then
    echo -e "  ${GREEN}PASS${NC}: $desc"
    PASS=$((PASS + 1))
  else
    echo -e "  ${RED}FAIL${NC}: $desc — expected $expect, got: $(echo "$result" | head -1)"
    FAIL=$((FAIL + 1))
  fi
}

# ── non-git commands (should allow) ──────────────────────────────────────

echo "=== non-git commands ==="
run_test "npm install" '{"command": "npm install"}' "allow"
run_test "ls -la" '{"command": "ls -la"}' "allow"
run_test "git status" '{"command": "git status"}' "allow"
run_test "git diff" '{"command": "git diff"}' "allow"
run_test "git push" '{"command": "git push origin main"}' "allow"
run_test "empty command" '{"command": ""}' "allow"
run_test "no command field" '{"other": "stuff"}' "allow"

# ── clean files (should allow) ───────────────────────────────────────────

echo ""
echo "=== clean files ==="
echo "const x = 42;" > /tmp/_test_clean.ts
run_test "git add clean file" '{"command": "git add /tmp/_test_clean.ts"}' "allow"

# ── secret pattern detection (should deny) ───────────────────────────────

echo ""
echo "=== secret pattern detection ==="

echo 'const key = "AKIAIOSFODNN7EXAMPLE1";' > /tmp/_test_aws.ts
echo 'const t = "ghp_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijk";' > /tmp/_test_gh.ts
echo 'const p = "github_pat_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij";' > /tmp/_test_ghpat.ts
echo 'const g = "glpat-ABCDEFGHIJKLMNOPQRST";' > /tmp/_test_gitlab.ts
echo '-----BEGIN RSA PRIVATE KEY-----' > /tmp/_test_privkey.ts
echo 'const db = "postgres://user:pass@host:5432/dbname";' > /tmp/_test_dburl.ts
echo 'const s = "xoxb-ABCDEFGHIJKLMNOPQRSTU";' > /tmp/_test_slack.ts
echo 'const n = "npm_ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghij";' > /tmp/_test_npm.ts
echo 'password = "mysecretpassword123"' > /tmp/_test_secret.ts
echo 'api_key = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcd"' > /tmp/_test_apikey.ts
echo 'const o = "sk-ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuv";' > /tmp/_test_openai.ts

run_test "AWS access key" '{"command": "git add /tmp/_test_aws.ts"}' "deny"
run_test "GitHub token" '{"command": "git add /tmp/_test_gh.ts"}' "deny"
run_test "GitHub fine-grained PAT" '{"command": "git add /tmp/_test_ghpat.ts"}' "deny"
run_test "GitLab token" '{"command": "git add /tmp/_test_gitlab.ts"}' "deny"
run_test "private key" '{"command": "git add /tmp/_test_privkey.ts"}' "deny"
run_test "database URL" '{"command": "git add /tmp/_test_dburl.ts"}' "deny"
run_test "Slack token" '{"command": "git add /tmp/_test_slack.ts"}' "deny"
run_test "NPM token" '{"command": "git add /tmp/_test_npm.ts"}' "deny"
run_test "generic secret" '{"command": "git add /tmp/_test_secret.ts"}' "deny"
run_test "generic API key" '{"command": "git add /tmp/_test_apikey.ts"}' "deny"
run_test "OpenAI API key" '{"command": "git add /tmp/_test_openai.ts"}' "deny"

# ── file exclusions (should allow even with secrets) ─────────────────────

echo ""
echo "=== file exclusions ==="
mkdir -p /tmp/_test_excl
echo 'const key = "AKIAIOSFODNN7EXAMPLE1";' > /tmp/_test_excl/Foo.spec.ts
echo 'const key = "AKIAIOSFODNN7EXAMPLE1";' > /tmp/_test_excl/Foo.spec.tsx
echo 'const key = "AKIAIOSFODNN7EXAMPLE1";' > /tmp/_test_excl/Foo.stories.ts
echo 'const key = "AKIAIOSFODNN7EXAMPLE1";' > /tmp/_test_excl/Foo.stories.tsx
echo 'const key = "AKIAIOSFODNN7EXAMPLE1";' > /tmp/_test_excl/data.fixtures.ts

run_test "*.spec.ts excluded" '{"command": "git add /tmp/_test_excl/Foo.spec.ts"}' "allow"
run_test "*.spec.tsx excluded" '{"command": "git add /tmp/_test_excl/Foo.spec.tsx"}' "allow"
run_test "*.stories.ts excluded" '{"command": "git add /tmp/_test_excl/Foo.stories.ts"}' "allow"
run_test "*.stories.tsx excluded" '{"command": "git add /tmp/_test_excl/Foo.stories.tsx"}' "allow"
run_test "*.fixtures.ts excluded" '{"command": "git add /tmp/_test_excl/data.fixtures.ts"}' "allow"

# ── bypass prevention (git add variants) ─────────────────────────────────

echo ""
echo "=== bypass prevention: git add variants ==="

# create an untracked file with a secret inside the repo
mkdir -p _test_bypass
echo 'const key = "AKIAIOSFODNN7EXAMPLE1";' > _test_bypass/leak.ts

run_test "git add <directory>" '{"command": "git add _test_bypass"}' "deny"
run_test "git add ." '{"command": "git add ."}' "deny"
run_test "git add ./" '{"command": "git add ./"}' "deny"
run_test "git add -A" '{"command": "git add -A"}' "deny"
run_test "git add --all" '{"command": "git add --all"}' "deny"
run_test "git add -u" '{"command": "git add -u"}' "deny"
run_test "git add --update" '{"command": "git add --update"}' "deny"

rm -rf _test_bypass

# ── bypass prevention (git commit variants) ──────────────────────────────

echo ""
echo "=== bypass prevention: git commit variants ==="

# git commit -a scans tracked modified files.
# we can't easily stage a tracked+modified secret from a test script without
# actually modifying a tracked file, so we verify the code path doesn't crash
# and correctly returns allow when there are no modified files with secrets.
run_test "git commit -am (no tracked secrets)" '{"command": "git commit -am \"msg\""}' "allow"
run_test "git commit --all (no tracked secrets)" '{"command": "git commit --all -m \"msg\""}' "allow"
run_test "git commit -a (no tracked secrets)" '{"command": "git commit -a"}' "allow"

# ── error handling (fail closed) ─────────────────────────────────────────

echo ""
echo "=== error handling ==="
run_test "malformed JSON denies (fail closed)" 'not json at all' "deny"
run_test "empty JSON allows" '{}' "allow"

# ── output format validation ─────────────────────────────────────────────

echo ""
echo "=== output format ==="

result=$(echo '{"command": "git add /tmp/_test_aws.ts"}' | bash "$HOOK" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if echo "$result" | python3 -c "import sys,json; json.load(sys.stdin)" 2>/dev/null; then
  echo -e "  ${GREEN}PASS${NC}: deny output is valid JSON"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}FAIL${NC}: deny output is not valid JSON"
  FAIL=$((FAIL + 1))
fi

TOTAL=$((TOTAL + 1))
if echo "$result" | python3 -c "
import sys, json
msg = json.load(sys.stdin)['agentMessage']
assert '\n' in msg, 'no real newlines'
" 2>/dev/null; then
  echo -e "  ${GREEN}PASS${NC}: agentMessage contains real newlines (not literal \\\\n)"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}FAIL${NC}: agentMessage has literal \\\\n instead of real newlines"
  FAIL=$((FAIL + 1))
fi

TOTAL=$((TOTAL + 1))
if echo "$result" | python3 -c "
import sys, json
msg = json.load(sys.stdin)['agentMessage']
assert 'AWS Access Key' in msg
assert 'Blocked' in msg
" 2>/dev/null; then
  echo -e "  ${GREEN}PASS${NC}: agentMessage includes pattern label and blocked prefix"
  PASS=$((PASS + 1))
else
  echo -e "  ${RED}FAIL${NC}: agentMessage missing expected content"
  FAIL=$((FAIL + 1))
fi

# ── cleanup ──────────────────────────────────────────────────────────────

rm -f /tmp/_test_clean.ts /tmp/_test_aws.ts /tmp/_test_gh.ts /tmp/_test_ghpat.ts
rm -f /tmp/_test_gitlab.ts /tmp/_test_privkey.ts /tmp/_test_dburl.ts /tmp/_test_slack.ts
rm -f /tmp/_test_npm.ts /tmp/_test_secret.ts /tmp/_test_apikey.ts /tmp/_test_openai.ts
rm -rf /tmp/_test_excl

echo ""
echo "==============================="
echo "  Total: $TOTAL  Passed: $PASS  Failed: $FAIL"
echo "==============================="

[ "$FAIL" -eq 0 ] && exit 0 || exit 1
