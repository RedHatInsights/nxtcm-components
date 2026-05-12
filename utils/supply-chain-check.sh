#!/usr/bin/env bash
# lightweight supply chain tripwire - checks for known IOC patterns after npm install.
# not a replacement for Socket/Snyk, just a fast sanity check in CI.
# ref: https://socket.dev/blog/tanstack-npm-packages-compromised-mini-shai-hulud-supply-chain-attack

set -euo pipefail

EXIT_CODE=0

# known malicious filenames from Mini Shai-Hulud campaign
MALICIOUS_FILES=(
  "router_init.js"
  "router_runtime.js"
  "tanstack_runner.js"
)

echo "=== supply chain tripwire ==="

# 1. check node_modules for known IOC filenames
for filename in "${MALICIOUS_FILES[@]}"; do
  matches=$(find node_modules -maxdepth 4 -name "$filename" 2>/dev/null || true)
  if [ -n "$matches" ]; then
    echo "::error::known malicious file found: $matches"
    EXIT_CODE=1
  fi
done

# 2. check for suspicious lifecycle scripts in dependencies
# (prepare/postinstall that exec bun, curl, wget, or reference suspicious domains)
if [ -d node_modules ]; then
  suspicious=$(find node_modules -name "package.json" -exec \
    grep -lE '"(prepare|postinstall|preinstall)":\s*"[^"]*\b(bun run|curl |wget |getsession|git-tanstack)' {} \; 2>/dev/null || true)
  if [ -n "$suspicious" ]; then
    echo "::error::suspicious lifecycle script found in: $suspicious"
    EXIT_CODE=1
  fi
fi

# 3. check for .claude/ or .vscode/ persistence artifacts in the project root
PERSISTENCE_FILES=(
  ".claude/router_runtime.js"
  ".claude/setup.mjs"
  ".vscode/setup.mjs"
)

for pfile in "${PERSISTENCE_FILES[@]}"; do
  if [ -f "$pfile" ]; then
    echo "::error::supply chain persistence file found: $pfile"
    EXIT_CODE=1
  fi
done

# 4. check for git-based deps in lockfile (same as CI step, but usable locally)
if [ -f package-lock.json ]; then
  if grep -qE '"resolved":\s*"git[+:]|"github:' package-lock.json; then
    echo "::error::git-based dependency found in package-lock.json"
    EXIT_CODE=1
  fi
fi

if [ "$EXIT_CODE" -eq 0 ]; then
  echo "all clear, no known IOC patterns detected"
fi

exit $EXIT_CODE
