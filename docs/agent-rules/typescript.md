# typescript conventions

repo-wide typescript rules for writing and refactoring code.

## no `any` and no unsafe type-aware operations

`@typescript-eslint/no-explicit-any`, `@typescript-eslint/no-unsafe-return`, and
`@typescript-eslint/no-unsafe-call` are errors. Use proper types and keep values typed
through function boundaries:

```tsx
// don't
const handleData = (data: any) => { ... }

// do
const handleData = (data: ClusterPayload) => { ... }
// or if truly unknown:
const handleData = (data: unknown) => { ... }
```

The related `no-unsafe-assignment`, `no-unsafe-argument`, and `no-unsafe-member-access`
rules remain off for now. Do not add `any` or `as any` to work around a violation.

If a third-party boundary cannot be typed, use a line-level suppression only, with an
adjacent comment explaining the boundary (for example, an untyped library declaration).

## explicit return types

all functions and hooks get explicit return types:

```tsx
// do
export const useClusterName = (): { value: string; error: string | null } => { ... }

// don't
export const useClusterName = () => { ... }
```

## type exports

always export types alongside components:

```tsx
export interface TotalClustersProps { ... }
export const TotalClusters = ({ ... }: TotalClustersProps) => { ... };
```

and from the package index:

```tsx
export { TotalClusters } from './TotalClusters';
export type { TotalClustersProps } from './TotalClusters';
```

## callback typing

type callbacks explicitly, don't use generic `Function`:

```tsx
// do
onPageChange?: (page: number) => void;
onFilterChange?: (filters: FilterState) => void;

// don't
onPageChange?: Function;
onChange?: (...args: any[]) => void;
```

## generics

use generics when a component works with multiple data shapes:

```tsx
interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}
```

## type assertions

avoid `as` type assertions by default. prefer narrowing, guards, or better function signatures first.

use assertions only as an escape hatch when a boundary is untyped and you cannot improve the source type. keep assertions local and specific (`as SpecificType`), never broad (`as any`).
