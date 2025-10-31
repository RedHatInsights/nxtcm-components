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

## Prerequisites

- Node.js (version 20 recommended - see `.nvmrc`)
- npm (comes with Node.js)

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
| `.nvmrc` | Node.js version specification (v20) |
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
