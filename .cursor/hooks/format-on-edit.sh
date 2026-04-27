#!/bin/bash
# runs prettier on files the agent just edited.
# lint-staged catches this at commit time too, but this keeps
# the diff clean in real-time while the agent works.

input=$(cat)
filepath=$(echo "$input" | jq -r '.file_path // empty')

if [ -z "$filepath" ]; then
  exit 0
fi

# only format file types prettier handles in this repo
case "$filepath" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.json|*.css|*.scss|*.md)
    npx prettier --write "$filepath" 2>/dev/null
    ;;
esac

exit 0
