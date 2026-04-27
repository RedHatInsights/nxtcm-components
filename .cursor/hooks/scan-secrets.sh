#!/bin/bash
# scans files in git add/commit commands for hardcoded secrets.
# blocks the command if secrets are detected so they never reach version control.
# runs as a beforeShellExecution cursor hook.
#
# beforeShellExecution hooks must return JSON:
#   {"permission": "allow"} to let the command run
#   {"permission": "deny", "agentMessage": "..."} to block it

set -uo pipefail

allow='{"permission": "allow"}'

deny_msg() {
  local escaped
  escaped=$(printf '%s' "$1" | jq -Rs '.')
  echo "{\"permission\": \"deny\", \"agentMessage\": $escaped}"
  exit 0
}

# fail closed if jq is missing
if ! command -v jq >/dev/null 2>&1; then
  deny_msg "scan-secrets hook: jq not found on PATH. Install jq or run the git command directly in terminal."
fi

input=$(cat)
command=$(echo "$input" | jq -r '.command // empty')

# if jq failed to parse, fail closed
if [ $? -ne 0 ] || [ -z "$command" ]; then
  echo "$allow"
  exit 0
fi

# only intercept git add and git commit commands
case "$command" in
  git\ add*|git\ commit*)
    ;;
  *)
    echo "$allow"
    exit 0
    ;;
esac

# collect files to scan
files_to_scan=()

if [[ "$command" == git\ commit* ]]; then
  # always scan what's already staged
  while IFS= read -r file; do
    [ -n "$file" ] && files_to_scan+=("$file")
  done < <(git diff --cached --name-only 2>/dev/null)

  # git commit -a/-am/--all auto-stages tracked modified files at commit time,
  # but they aren't in --cached yet when this hook fires (runs before git)
  if [[ "$command" =~ (^|[[:space:]])(-a[a-zA-Z]*|--all)([[:space:]]|$) ]]; then
    while IFS= read -r file; do
      [ -n "$file" ] && files_to_scan+=("$file")
    done < <(git diff --name-only 2>/dev/null)
  fi

elif [[ "$command" == git\ add* ]]; then
  # detect flag-based staging that covers everything (-A/--all/-u/--update)
  if [[ "$command" =~ (^|[[:space:]])(-A|--all|-u|--update)([[:space:]]|$) ]]; then
    while IFS= read -r file; do
      [ -n "$file" ] && files_to_scan+=("$file")
    done < <(git diff --name-only 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null)
  else
    read -r -a tokens <<< "${command#git add}"
    for arg in "${tokens[@]}"; do
      case "$arg" in
        -*) continue ;;
        .|./)
          while IFS= read -r file; do
            [ -n "$file" ] && files_to_scan+=("$file")
          done < <(git diff --name-only 2>/dev/null; git ls-files --others --exclude-standard 2>/dev/null)
          ;;
        *)
          if [ -d "$arg" ]; then
            while IFS= read -r file; do
              [ -n "$file" ] && files_to_scan+=("$file")
            done < <(git diff --name-only -- "$arg" 2>/dev/null; git ls-files --others --exclude-standard -- "$arg" 2>/dev/null)
          elif [ -f "$arg" ]; then
            files_to_scan+=("$arg")
          fi
          ;;
      esac
    done
  fi
fi

if [ ${#files_to_scan[@]} -eq 0 ]; then
  echo "$allow"
  exit 0
fi

# secret patterns — case-sensitive patterns use grep -En,
# case-insensitive ones use grep -Ein.
# format: label:::mode:::regex
# mode: "i" for case-insensitive, "s" for case-sensitive
secret_patterns=(
  "AWS Access Key:::s:::AKIA[0-9A-Z]{16}"
  "AWS Secret Key:::i:::(aws_secret_access_key|aws_secret)[[:space:]]*[=:][[:space:]]*[A-Za-z0-9/+=]{40}"
  "GitHub Token:::s:::gh[ps]_[A-Za-z0-9_]{36,}"
  "GitLab Token:::s:::glpat-[A-Za-z0-9_-]{20,}"
  "Generic API Key:::i:::(api[_-]?key|apikey)[[:space:]]*[=:][[:space:]]*['\"]?[A-Za-z0-9_-]{20,}"
  "Generic Secret:::i:::(secret|password|passwd|pwd)[[:space:]]*[=:][[:space:]]*['\"][^'\"]{8,}['\"]"
  "Bearer Token:::i:::bearer[[:space:]]+[A-Za-z0-9._~+/-]+={0,2}"
  "Private Key:::s:::-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----"
  "Database URL:::i:::(postgres|mysql|mongodb|redis)://[^[:space:]]{10,}"
  "Slack Token:::s:::xox[bpras]-[A-Za-z0-9-]{10,}"
  "NPM Token:::s:::npm_[A-Za-z0-9]{36}"
)

found_secrets=()

for file in "${files_to_scan[@]}"; do
  case "$file" in
    node_modules/*|*.lock|package-lock.json|*.png|*.jpg|*.jpeg|*.gif|*.svg|*.ico|*.woff|*.woff2|*.ttf|*.eot|dist/*|.git/*|.cursor/hooks/*)
      continue
      ;;
    # test, mock, story, and fixture files contain intentional fake credentials
    *.spec.ts|*.spec.tsx|*.stories.ts|*.stories.tsx|*.story.ts|*.story.tsx|*.fixtures.ts)
      continue
      ;;
    *TestMocks*|e2e-app/*|playwright/e2e/*|src/examples/*|packages/react-form-wizard/cypress/*|scripts/test-secret-prevention.sh)
      continue
      ;;
    # schema and template files contain AWS field descriptions and placeholder values
    schemas/*.json|*.hbs)
      continue
      ;;
  esac

  [ -f "$file" ] || continue
  file_size=$(wc -c < "$file" 2>/dev/null)
  [ "${file_size:-0}" -gt 1048576 ] && continue

  for pattern_entry in "${secret_patterns[@]}"; do
    label="${pattern_entry%%:::*}"
    rest="${pattern_entry#*:::}"
    mode="${rest%%:::*}"
    regex="${rest#*:::}"

    grep_flags="-En"
    [ "$mode" = "i" ] && grep_flags="-Ein"

    if matches=$(grep $grep_flags -e "$regex" -- "$file" 2>/dev/null); then
      while IFS= read -r match; do
        line_num="${match%%:*}"
        found_secrets+=("$label in $file:$line_num")
      done <<< "$matches"
    fi
  done
done

if [ ${#found_secrets[@]} -gt 0 ]; then
  nl=$'\n'
  msg="Blocked: found potential secrets in files being staged.${nl}${nl}"
  for secret in "${found_secrets[@]}"; do
    msg+="- ${secret}${nl}"
  done
  msg+="${nl}Remove the secrets or bypass by running the git command directly in terminal."

  deny_msg "$msg"
fi

echo "$allow"
exit 0
