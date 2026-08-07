# typescript conventions

repo-wide typescript rules for writing and refactoring code.

## no `any` in new code

`@typescript-eslint/no-explicit-any` is OFF (tech debt), but new code should use proper types:

```tsx
// don't
const handleData = (data: any) => { ... }

// do
const handleData = (data: ClusterPayload) => { ... }
// or if truly unknown:
const handleData = (data: unknown) => { ... }
```

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
