# nxtcm-dashboard package

package-level context for `@redhat-cloud-services/nxtcm-dashboard`. read the root [AGENTS.md](../../AGENTS.md) first — this file adds package-specific details.

## what this package is

PatternFly 6 dashboard widget components for the ACM and OCM console home page. each widget is a self-contained card that shows a specific metric, chart, or data view.

## package structure

dashboard widgets live in `packages/nxtcm-dashboard/src/`, one directory per widget/component.

top-level examples include `TotalClusters`, `CVECard`, `AdvisorRecommendations`, `ClustersWithIssues`, `CostManagement`, and `LoadingPanel`.

## data contract

widgets never make API calls. consuming apps own data fetching and pass view-model props into widgets.
many dashboard widgets use `data` + `isLoading` style props rather than a direct `Resource<T>` prop.
`LoadingPanel` is a shared loading-state utility and does not own any data contract.

```tsx
interface WidgetProps {
  data?: WidgetData;
  isLoading?: boolean;
  linkComponent?: React.ComponentType<LinkProps>;
  // ... widget-specific props
}
```

consuming apps (uhc-portal, console) call their own APIs and map responses into widget-friendly props.

## patterns to follow

### card structure

widgets render their inner content (Flex layouts, charts, metrics). the card chrome (`Card`, `CardHeader`, `CardTitle`) is provided by the widgetized dashboard host, not by each widget component.

### loading state

widgets use PatternFly `Skeleton` when `isLoading === true`:

```tsx
if (isLoading) {
  return <Skeleton screenreaderText="Loading widget data" />;
}
```

`LoadingPanel` is a separate utility for callback-based async loading (takes a Promise callback, shows Spinner). it's not used by data-bearing widgets for their loading prop.

### error state

widgets that receive error state should show an inline alert:

```tsx
if (error) return <Alert variant="danger" title="Failed to load" />;
```

### chart theming

use PatternFly chart color tokens, not hardcoded colors. charts must work in both light and dark mode.

## testing

- CT specs live next to each widget: `WidgetName.spec.tsx`
- spec-helpers provide mock props for each state (loading, error, empty, with-data)
- test all four states: loading (`isLoading: true`) → error → empty → populated

## storybook

stories use title prefix `Components/Dashboard/`:

```tsx
const meta: Meta<typeof TotalClusters> = {
  title: 'Components/Dashboard/TotalClusters',
  // ...
};
```
