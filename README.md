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
- **Modern Tooling**: Webpack, Babel, and modern JavaScript features

## Prerequisites

- Node.js (version 18 or higher recommended)
- npm (comes with Node.js)

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

Start the webpack development server:

```bash
npm start
```

## Project Structure

```
nxtcm-components/
├── .github/              # GitHub configuration files
│   ├── CODEOWNERS        # Code ownership definitions
│   └── pull_request_template.md
├── .storybook/           # Storybook configuration
├── public/               # Public assets
├── src/                  # Source code
│   ├── index.ts          # Main entry point
│   └── index.scss        # Global styles
├── babel.config.js       # Babel configuration
├── jest.config.js        # Jest test configuration
├── jest.setup.js         # Jest setup file
├── tsconfig.json         # TypeScript configuration
└── webpack.config.js     # Webpack configuration
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

### Using with ACM or OCM

The components are designed to work seamlessly with both ACM and OCM projects. They use PatternFly's flexible design system to accommodate different requirements while maintaining consistency.

## Contributing

We welcome contributions! Please follow these guidelines:

1. **Fork the repository** and create a feature branch
2. **Follow coding standards**: Run `npm run prettier:fix` before committing
3. **Write tests**: Add unit tests for new components or features
4. **Update documentation**: Add or update Storybook stories
5. **Fill out the PR template**: Provide clear description and testing steps
6. **Request reviews**: Tag appropriate team members

See our [Pull Request Template](.github/pull_request_template.md) for detailed submission guidelines.

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
- **Webpack**: Module bundler
- **Babel**: JavaScript compiler
- **SASS**: CSS preprocessing

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm start` | Start webpack dev server |
| `npm run build` | Build library for production |
| `npm run type-check` | Run TypeScript type checking |
| `npm run prettier:fix` | Format code with Prettier |
| `npm test` | Run all tests |
| `npm test:watch` | Run tests in watch mode |
| `npm run storybook` | Start Storybook dev server |
| `npm run build-storybook` | Build static Storybook |

## License

[License information to be added]

## Support

For questions, issues, or contributions:

- **Issues**: [GitHub Issues](https://github.com/RedHatInsights/nxtcm-components/issues)
- **Pull Requests**: [GitHub PRs](https://github.com/RedHatInsights/nxtcm-components/pulls)
- **Maintainers**: See [CODEOWNERS](.github/CODEOWNERS)

## Related Projects

- [Advanced Cluster Management (ACM)](https://www.redhat.com/en/technologies/management/advanced-cluster-management)
- [OpenShift Cluster Manager (OCM)](https://console.redhat.com/openshift)
- [PatternFly](https://www.patternfly.org/)
