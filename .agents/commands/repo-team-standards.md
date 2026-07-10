# repo-team-standards

Discover team coding conventions, patterns, and standards from the repository for use in code reviews and new code.

## Purpose

Extract actionable patterns from the existing codebase to inform:
- Code review findings (what patterns to check for)
- Fix recommendations (what patterns to follow)
- New code generation (what conventions to use)

## What to discover

### 1. Build and test tooling

```bash
# Check package.json scripts
cat package.json | jq '.scripts'

# Check for CI configuration
ls -la .github/workflows/
```

Record:
- Available npm scripts (lint, test, build, type-check)
- CI pipeline checks
- Test frameworks in use

### 2. Code organization patterns

```bash
# Find common directory structures
find src -type d -maxdepth 3 | head -20

# Check for workspace packages
cat package.json | jq '.workspaces'
```

Record:
- Directory structure conventions (e.g., component co-location)
- Workspace organization (monorepo packages)
- Path aliases from tsconfig.json

### 3. Component patterns

For React/UI repos:

```bash
# Sample a few components to understand structure
find src -name "*.tsx" -type f | head -5
```

Look for:
- File naming conventions (PascalCase, camelCase)
- Component structure (props interface location, export pattern)
- Test file naming (`.spec.tsx`, `.test.ts`)
- Story file patterns (`.stories.tsx`)

### 4. Import patterns

```bash
# Check a sample of files for import ordering
head -20 src/components/*/index.tsx 2>/dev/null | grep -E "^import"
```

Record:
- Import grouping (React first, third-party, internal, CSS)
- Path alias usage (@/ patterns)
- Re-export patterns (index.ts barrels)

### 5. TypeScript patterns

```bash
# Check tsconfig for strictness
cat tsconfig.json | jq '.compilerOptions | {strict, noImplicitAny, strictNullChecks}'
```

Record:
- Type strictness settings
- Interface vs type usage patterns (sample existing code)
- Prop type documentation patterns

### 6. Documentation patterns

```bash
# Check for existing documentation
ls -la CLAUDE.md AGENTS.md README.md .cursor/rules/ 2>/dev/null
```

Record:
- Where project conventions are documented
- Whether AGENTS.md or CLAUDE.md exists
- AI tool configuration locations

### 7. Linting and formatting

```bash
# Check lint configuration
cat .eslintrc.json 2>/dev/null || cat eslint.config.js 2>/dev/null

# Check prettier config
cat .prettierrc 2>/dev/null || cat prettier.config.js 2>/dev/null
```

Record:
- Notable lint rules (especially those set to error)
- Formatting conventions
- Any disabled rules worth noting

## Output format

Structure findings as:

```markdown
## Team Standards Discovery

### Build & Test
- Scripts: [list key npm scripts]
- CI: [CI pipeline details]
- Test frameworks: [Jest, Playwright, etc.]

### Code Organization
- Structure: [directory patterns]
- Workspaces: [if applicable]
- Path aliases: [from tsconfig]

### Component Patterns
- File naming: [PascalCase for components, etc.]
- Test naming: [.spec.tsx, .test.ts]
- Co-location: [component, test, stories together]

### Import Conventions
1. React imports
2. Third-party libraries
3. Internal utilities
4. Relative imports
5. CSS/assets last

### TypeScript
- Strictness: [enabled strict mode features]
- Type patterns: [interface vs type preference]
- Prop documentation: [JSDoc on interfaces, etc.]

### Documentation
- Project docs: [AGENTS.md, CLAUDE.md locations]
- AI rules: [.cursor/rules, .claude/skills]

### Lint & Format
- Notable rules: [console: error, etc.]
- Auto-fix: [via lint-staged, git hooks]
```

## Usage in reviews

**Pattern priority for review/fix:**

1. This skill's companion checklists (GENERAL.md, SECURITY.md, etc.)
2. repo-team-standards findings (discovered conventions)
3. Same feature area / neighbors / existing helpers
4. Infer from context when none of the above apply

When reviewing code:
- Flag deviations from discovered patterns
- Suggest fixes that match discovered conventions
- Note when new patterns are introduced (document them)

When writing new code:
- Follow discovered conventions for naming, structure, imports
- Use discovered path aliases and tooling
- Match existing component/test patterns
