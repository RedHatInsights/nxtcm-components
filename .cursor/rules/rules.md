# Rules for NXTCM-components library

## General coding standards rules

- Use pascal case for naming files and react components
- Use camel case for naming functions
- Use snake case for truly constant variables
- Use ternary operators where possible instead of if-else statements, but never nest ternary operator
- Use descriptive names that indicate component purpose
- Use injected callbacks for data fetching — components must never make HTTP calls directly
- Export component props types alongside the component
- Use explicit prop interfaces (not inline types) for all public components
- Document required vs optional props with JSDoc comments on the interface

## React rules

- Always use functional react components over class based ones
- Implement proper dependency arrays in useEffect/useCallback
- Use custom hooks for business logic separation
- If it is possible use React form wizard onValueChange instead of react useEffect
- Leverage useMemo for expensive computations
- Use useCallback for event handlers passed as props
- Use useCallback for functions passed to child components
- Avoid using inline functions in JSX or TSX blocks
- Use proper key props for list items


## Organazing imports rules

- React imports (useState, useEffect, etc.)
- Third-party libraries (PatternFly, lodash, etc.)
- Internal utilities and shared components
- Relative imports from local directories
- CSS/SCSS imports and assets last

## Typescript rules

- Always use Typescript for new React components or utility/helper functions
- Avoid using any type, prefer to use unknown if the type is unknown
- Add types to function return values
- Use proper TypeScript error types instead of generic Error objects
- Type custom hooks with proper return types
- Type callback functions explicitly

## Patternfly rules

- Always use Patternfly components or React form wizard components over custom ones
- Follow PatternFly design patterns and accessibility guidelines
- Use established PatternFly layout components
- Do NOT modify PatternFly component styles with custom CSS
- Use PatternFly variants and modifiers instead
- Follow established CSS class naming conventions
- Import icons from @patternfly/react-icons
- Follow PatternFly icon usage guidelines
- Prefer PatternFly utility classes and spacing tokens over custom CSS


## Testing rules

- Use Playwright Component Testing (*.spec.tsx) for all component tests, not Jest
- Co-locate test files next to the component they test (e.g., MyComponent.spec.tsx)
- Use co-located *.spec-helpers.tsx files for test setup/context wrappers (following the existing pattern in RosaWizard.spec-helpers.tsx)
- Mock data and provider wrappers go in spec-helpers, not inline in tests
- Always add unit tests for any code changes
- Follow the Arrange-Act-Assert pattern when writing unit tests
- Write descriptive test names that clearly describe what is being tested
- Test behavior, not implementation details

## Storybook rules 

- Write stories using CSF3 format (Meta, StoryObj from @storybook/react)
- Use *.stories.tsx naming convention
- Co-locate stories next to their component
- Include tags: ['autodocs'] for components that should have auto-generated documentation
- Follow the Components/<Category>/<ComponentName> title convention