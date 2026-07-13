# nxtcm-components

A shared component library for Red Hat Insights projects, specifically designed for Advanced Cluster Management (ACM) and OpenShift Cluster Manager (OCM).

## Overview

This repository provides reusable React components built with PatternFly that serve the common needs of both ACM and OCM applications. The components are designed to be generic enough to accommodate both products while maintaining consistency and reducing code duplication.

## Key Features

- **Shared Components**: Reusable React components for ACM and OCM
- **PatternFly Integration**: Built on top of PatternFly React components
- **TypeScript Support**: Fully typed components with TypeScript
- **Storybook**: Interactive component documentation and development environment
- **Testing**: Comprehensive unit tests with Jest and React Testing Library
- **Modern Tooling**: Vite, modern JavaScript features, and fast HMR

## Documentation

View our live component documentation and examples at:

**https://redhatinsights.github.io/nxtcm-components/**

The documentation site is automatically updated when changes are merged to the main branch and provides interactive examples of all components.

## Prerequisites

- Node.js 24.15+ (see `engines.node` in `package.json`)

## Quick Start

```bash
# Clone the repository
git clone https://github.com/RedHatInsights/nxtcm-components.git
cd nxtcm-components

# Install dependencies
npm install

# Start development server
npm start

# Or start Storybook
npm run storybook
```

## Installation

### For Development

1. Clone the repository:
   ```bash
   git clone https://github.com/RedHatInsights/nxtcm-components.git
   cd nxtcm-components
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### As a Package

Once published, you can install this package in your project:

```bash
npm install nxtcm-components
```

## Development

### Running Storybook

To develop and test components in isolation:

```bash
npm run storybook
```

This will start Storybook on `http://localhost:6006` where you can interact with components and see their documentation.

### Building the Library

To build the library for production:

```bash
npm run build
```

This creates a `dist` folder with the compiled components.

### Running Tests

Run all unit tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm test:watch
```
### Playwright Tests

Run playwright tests:
```bash
npx playwright test
```

Run playwright component tests:
```bash
npm run test-ct
```

### Mutation Testing (Stryker)

[Stryker](https://stryker-mutator.io/) is a mutation testing framework. **Mutation testing** measures how effective your tests are at catching bugs — not just whether they pass.

Stryker makes small, deliberate changes (*mutants*) to your source code — for example, flipping a condition, removing a statement, or changing an operator. For each mutant, it re-runs your tests:

- If a test **fails**, the mutant was **killed** — your tests caught the change.
- If all tests **still pass**, the mutant **survived** — your tests may not be exercising that behavior.

The **mutation score** (killed mutants ÷ total mutants) is a rough signal of test quality: are your tests actually detecting potential bugs, or only checking happy paths?

#### How it works in this repo

Our Stryker setup is scoped to individual components:

- Pass a **component** `.tsx` file as the target — not the spec file.
- Stryker mutates that component and runs **only the co-located Playwright component test** (`ComponentName.spec.tsx` next to `ComponentName.tsx`).
- **Jest unit tests are not run** by Stryker today; only Playwright CT (`*.spec.tsx`) specs are supported.
- E2E tests are not included.

Reach for mutation testing anytime you are updating tests, reviewing a PR that touches specs, or suspect a component test is not fully exercising the component — for example, it passes but only covers rendering or a single happy path. It is also useful before refactoring, when you want confidence that existing tests would catch regressions.

#### Running a mutation test

From the repo root, pass one or more component paths after `--`:

```bash
npm run test:stryker -- packages/nxtcm-rosa-hcp-wizard/src/Steps/BasicSetup/ClusterWideProxy/ClusterWideProxy.tsx
```

Multiple components in one run:

```bash
npm run test:stryker -- \
  packages/nxtcm-rosa-hcp-wizard/src/Steps/BasicSetup/ClusterWideProxy/ClusterWideProxy.tsx \
  packages/nxtcm-rosa-hcp-wizard/src/Footer/RosaHcpWizardFooter.tsx
```

Generate an HTML report when finished:

```bash
npm run test:stryker:report -- packages/nxtcm-rosa-hcp-wizard/src/Steps/BasicSetup/ClusterWideProxy/ClusterWideProxy.tsx
```

Limit parallel workers on a laptop or while you are working on other tasks:

```bash
STRYKER_CONCURRENCY=2 npm run test:stryker -- path/to/Component.tsx
```

#### Building commands with natural language

You can describe what you want to mutate in Cursor instead of assembling paths by hand. Attach or invoke the **stryker-mutation-test** skill (`.agents/skills/stryker-mutation-test/SKILL.md`) and ask in plain language — it will output a copy-paste command without running it.

Example prompt:

> I want to run /stryker-mutation-test on all files that have tests located in nxtcm-components/packages/nxtcm-rosa-hcp-wizard/src/Steps/BasicSetup and its subdirectories

#### Runtime expectations

Mutation testing is **slow**. Each mutant spins up Playwright CT with a fresh cache and port. A single component can take several minutes; runs across many files or directories can take **multiple hours**, depending on mutant count and your machine. Plan accordingly — this is a local quality check, not part of CI.

When the run completes, Stryker prints a summary (mutation score, killed/survived counts). Paste that output into a chat if you want help interpreting survived mutants.

### Type Checking

Run TypeScript type checking:

```bash
npm run type-check
```

### Code Formatting

Format code with Prettier:

```bash
npm run prettier:fix
```

### Development Server

Start the Vite development server:

```bash
npm start
```

Preview the production build:

```bash
npm run preview
```

## Project Structure

```
nxtcm-components/
├── .github/              # GitHub configuration files
│   ├── REVIEW_PROCESS.md # PR review guidelines
│   └── pull_request_template.md
├── .storybook/           # Storybook configuration
├── public/               # Public assets
├── src/                  # Source code
│   ├── index.ts          # Main entry point
│   └── index.scss        # Global styles
├── babel.config.js       # Babel configuration (for Jest)
├── jest.config.js        # Jest test configuration
├── jest.setup.js         # Jest setup file
├── tsconfig.json         # TypeScript configuration
└── vite.config.ts        # Vite configuration
```

## Usage

### Importing Components

After installation, import components in your React application:

```typescript
import { YourComponent } from 'nxtcm-components';

function App() {
  return <YourComponent />;
}
```

### Required CSS

This library requires PatternFly CSS. Import it in your application:

```typescript
// In your main application entry file (e.g., index.ts or App.tsx)
import '@patternfly/react-core/dist/styles/base.css';
import '@patternfly/patternfly/patternfly.css';
```

Or include it in your HTML:

```html
<link rel="stylesheet" href="node_modules/@patternfly/patternfly/patternfly.css">
```

### Using with ACM or OCM

The components are designed to work seamlessly with both ACM and OCM projects. They use PatternFly's flexible design system to accommodate different requirements while maintaining consistency.

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow coding standards**: Pre-commit hooks will automatically check your code
3. **Write tests**: Add unit tests for new components or features
4. **Update documentation**: Add or update Storybook stories
5. **Fill out the PR template**: Provide clear description and testing steps
6. **Request reviews**: Tag appropriate team members

See our [Pull Request Template](.github/pull_request_template.md) for detailed submission guidelines.

### Pre-Commit Hooks

This repository uses **Husky** and **lint-staged** to automatically check code quality before every commit:

**What happens when you commit:**
- ✅ **ESLint** runs on staged TypeScript files and auto-fixes issues
- ✅ **Prettier** formats staged files automatically
- ✅ Only checks files you're committing (fast!)
- ❌ Commit is blocked if unfixable errors are found

**Setup (Automatic):**
```bash
npm install  # Installs Git hooks automatically
```

**Example workflow:**
```bash
# Make changes
vim src/components/MyComponent.tsx

# Stage changes
git add src/components/MyComponent.tsx

# Commit (hooks run automatically!)
git commit -m "feat: add MyComponent"
# → ESLint checks MyComponent.tsx
# → Prettier formats MyComponent.tsx
# → If all pass, commit succeeds ✅
```

**Bypass hooks (emergency only):**
```bash
git commit --no-verify -m "emergency fix"
```

⚠️ **Note**: Use `--no-verify` sparingly, as it bypasses all quality checks.

## Testing in ACM/OCM

To test components in ACM or OCM applications:

1. Build the component library: `npm run build`
2. Link the package locally:
   ```bash
   npm link
   ```
3. In your ACM/OCM project:
   ```bash
   npm link nxtcm-components
   ```

Alternatively, wait for the package to be published to npm and install it normally.

## Component Philosophy

Components in this library follow these principles:

1. **Shared Foundation**: Built on PatternFly components to ensure consistency
2. **Flexible but Opinionated**: Generic enough for both ACM and OCM, but specific enough to provide value beyond raw PatternFly components
3. **Well-Tested**: Every component includes unit tests
4. **Well-Documented**: Storybook stories demonstrate usage and variants
5. **Accessible**: Follow WCAG accessibility standards
6. **TypeScript First**: Full type safety and IntelliSense support

## Technology Stack

- **React 18**: Modern React with hooks
- **TypeScript**: Type-safe component development
- **PatternFly**: Red Hat's open source design system
- **Storybook**: Component documentation and development
- **Jest**: Unit testing framework
- **React Testing Library**: Testing utilities
- **Playwright**: End-to-end and component testing
- **Vite**: Lightning-fast build tool and dev server
- **ESLint**: Code linting with React, TypeScript, and a11y rules
- **Prettier**: Code formatting
- **Husky**: Git hooks for pre-commit quality checks
- **lint-staged**: Run linters only on staged files
- **SASS**: CSS preprocessing

## Configuration Files

The repository includes the following configuration files:

| File | Purpose |
|------|---------|
| `.eslintrc.json` | ESLint configuration with React, TypeScript, and accessibility rules |
| `.prettierrc` | Prettier code formatting rules |
| `.prettierignore` | Files to exclude from Prettier formatting |
| `.npmignore` | Files to exclude from npm package |
| `.husky/pre-commit` | Pre-commit Git hook (runs lint-staged) |
| `package.json` → `lint-staged` | Configuration for running linters on staged files |
| `tsconfig.json` | TypeScript compiler configuration |
| `vite.config.ts` | Vite build tool configuration |
| `jest.config.js` | Jest testing framework configuration |
| `playwright.config.ts` | Playwright E2E testing configuration |
| `.github/workflows/ci.yml` | GitHub Actions CI/CD pipeline |

## Continuous Integration

This project uses GitHub Actions for CI/CD. On every pull request and push to main, the following checks run automatically:

- ✅ **Lint**: ESLint and Prettier checks
- ✅ **Type Check**: TypeScript compilation
- ✅ **Unit Tests**: Jest tests with coverage
- ✅ **Build**: Library build verification
- ✅ **E2E Tests**: Playwright end-to-end tests
- ✅ **Storybook Build**: Documentation build verification

See [`.github/workflows/ci.yml`](.github/workflows/ci.yml) for the complete workflow configuration.

## Publishing packages

`@redhat-cloud-services/nxtcm-dashboard` and `@redhat-cloud-services/nxtcm-rosa-hcp-wizard` are published to npm via [`.github/workflows/publish-package.yml`](.github/workflows/publish-package.yml) when a **GitHub Release is published** targeting `main`.

### Release tag format

The release tag must match the package version in that workspace's `package.json`:

| Package | Tag pattern | Example (`6.0.0`) |
|---------|-------------|---------------------|
| Dashboard | `nxtcm-dashboard-v{version}` | `nxtcm-dashboard-v6.0.0` |
| ROSA HCP Wizard | `nxtcm-rosa-hcp-wizard-v{version}` | `nxtcm-rosa-hcp-wizard-v6.0.0` |

Tags that do not match either pattern will fail the workflow.

### What happens on publish

1. Workflow resolves the package from the release tag
2. Verifies the tag is reachable from `main` and matches `package.json` version
3. Runs lint, type-check, unit tests, component tests, and build for that package
4. Publishes to npm with provenance (requires `npm-publish` environment approval)

### Maintainer checklist

1. Bump `version` in the target package's `package.json`
2. Merge the version bump to `main`
3. Create a GitHub Release on `main` with the exact tag above
4. Approve the `npm-publish` environment when prompted

## Scripts Reference

### Development

| Command | Description |
|---------|-------------|
| `npm start` | Start Vite dev server on port 4004 |
| `npm run storybook` | Start Storybook dev server on port 6006 |
| `npm run preview` | Preview production build locally |

### Building

| Command | Description |
|---------|-------------|
| `npm run build` | Build library for production (outputs to `dist/`) |
| `npm run build-storybook` | Build static Storybook site |

### Code Quality

| Command | Description |
|---------|-------------|
| `npm run type-check` | Run TypeScript type checking without emitting files |
| `npm run lint` | Check code for linting errors (ESLint) |
| `npm run lint:fix` | Auto-fix linting errors where possible |
| `npm run prettier:check` | Check if files are formatted correctly |
| `npm run prettier:fix` | Auto-format code with Prettier |

### Testing

| Command | Description |
|---------|-------------|
| `npm test` | Run all unit tests with Jest |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright end-to-end tests |
| `npm run test:ct` | Run Playwright component tests |
| `npm run test:stryker  -- <component.tsx>` | Run Stryker mutation testing on one or more component `.tsx` files |
| `npm run test:stryker:report  -- <component.tsx>` | Same as `test:stryker` with an HTML mutation report |

## License

This project is licensed under the Apache License 2.0 - see the [LICENSE](LICENSE) file for details.

## Support

For questions, issues, or contributions:

- **Issues**: [GitHub Issues](https://github.com/RedHatInsights/nxtcm-components/issues)
- **Pull Requests**: [GitHub PRs](https://github.com/RedHatInsights/nxtcm-components/pulls)
- **Review Process**: See [REVIEW_PROCESS.md](.github/REVIEW_PROCESS.md)

## Related Projects

- [Advanced Cluster Management (ACM)](https://www.redhat.com/en/technologies/management/advanced-cluster-management)
- [OpenShift Cluster Manager (OCM)](https://console.redhat.com/openshift)
- [PatternFly](https://www.patternfly.org/)
