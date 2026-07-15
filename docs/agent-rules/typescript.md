# typescript conventions

rules for TypeScript in this repo, especially around types that affect multiple packages.

## the Resource<T> pattern

this is the core integration contract with consuming apps. components receive async data via:

```tsx
interface Resource<TData, TArgs extends unknown[] = []> {
  data: TData;
  error: string | null;
  isFetching: boolean;
  fetch?: (...args: TArgs) => Promise<void>;
}
```

components must handle all three states: loading, error, and data-ready. consuming apps (ACM console, OCM portal) own the fetch logic and pass the resource down.

## wizard form types

the ROSA HCP wizard's main shapes are in `packages/nxtcm-rosa-hcp-wizard/src/types.ts`:

- `ROSAHCPWizardData` — async resources and validation resources passed into the wizard
- `ROSAHCPCluster` — submit payload shape collected from the wizard form
- `Resource<TData, TArgs>` — generic async resource contract used across wizard fields

when modifying wizard types:
1. check all substeps that use the field
2. verify yup schema wiring in `packages/nxtcm-rosa-hcp-wizard/src/yupSchemas/` still validates
3. check that the review step displays the field correctly

## no `any` in new code

`@typescript-eslint/no-explicit-any` is OFF (tech debt), but new code should use proper types:

```tsx
// don't
const handleData = (data: any) => { ... }

// do
const handleData = (data: ROSAHCPCluster) => { ... }
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
  data: Resource<T[]>;
  columns: Column<T>[];
  onRowClick?: (row: T) => void;
}
```

## path aliases

these resolve at build time (vite) and type-check time (tsc):

- `@/` → `src/`
- `@redhat-cloud-services/nxtcm-dashboard` → `packages/nxtcm-dashboard/src`
- `@redhat-cloud-services/nxtcm-rosa-hcp-wizard` → `packages/nxtcm-rosa-hcp-wizard/src`
- `@patternfly-labs/react-form-wizard` → `packages/react-form-wizard/src`

use the alias in imports, not relative paths across package boundaries.

## tsconfig structure

- root `tsconfig.json` — includes `src/` and workspace packages
- `packages/nxtcm-dashboard/tsconfig.json` — extends root, sets `rootDir` and `outDir`
- `packages/nxtcm-rosa-hcp-wizard/tsconfig.json` — same pattern

when adding a new package, extend root tsconfig and add to root's `references` array.
