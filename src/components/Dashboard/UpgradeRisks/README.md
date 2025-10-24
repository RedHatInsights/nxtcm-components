# UpgradeRisks Component

A dashboard component that displays upgrade risks with categorized counts for Critical, Warning, and Info levels.

## Features

- Displays total count of upgrade risks
- Shows risk breakdown by severity (Critical, Warning, Info)
- Optional "View upgrade risks" link with callback
- Built with PatternFly's Flex component for responsive layout
- Built with SCSS modules for scoped styling
- Fully typed with TypeScript
- Accessible with PatternFly icons
- Responsive design

## Usage

```tsx
import { UpgradeRisks } from 'nxtcm-components';

function MyDashboard() {
  return (
    <UpgradeRisks
      totalRisks={45}
      criticalCount={15}
      warningCount={15}
      infoCount={15}
      onViewRisks={() => {
        // Handle navigation to risks detail page
        console.log('Navigate to risks');
      }}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `totalRisks` | `number` | Yes | Total number of upgrade risks |
| `criticalCount` | `number` | Yes | Number of critical severity risks |
| `warningCount` | `number` | Yes | Number of warning severity risks |
| `infoCount` | `number` | Yes | Number of informational risks |
| `onViewRisks` | `() => void` | No | Callback when "View upgrade risks" is clicked |
| `className` | `string` | No | Additional CSS class name |

## Examples

### Basic Usage (No Link)

```tsx
<UpgradeRisks
  totalRisks={45}
  criticalCount={15}
  warningCount={15}
  infoCount={15}
/>
```

### With View Link

```tsx
<UpgradeRisks
  totalRisks={45}
  criticalCount={15}
  warningCount={15}
  infoCount={15}
  onViewRisks={() => navigate('/upgrade-risks')}
/>
```

### High Critical Count

```tsx
<UpgradeRisks
  totalRisks={50}
  criticalCount={35}
  warningCount={10}
  infoCount={5}
  onViewRisks={() => navigate('/upgrade-risks')}
/>
```

### No Risks

```tsx
<UpgradeRisks
  totalRisks={0}
  criticalCount={0}
  warningCount={0}
  infoCount={0}
/>
```

## Styling

The component uses SCSS modules for styling. To customize:

1. The component accepts a `className` prop for additional styles
2. CSS custom properties from PatternFly are used for theming
3. Colors for icons use PatternFly status color tokens:
   - Critical: `--pf-t--global--icon--color--status--danger--default`
   - Warning: `--pf-t--global--icon--color--status--warning--default`
   - Info: `--pf-t--global--icon--color--status--info--default`

## Testing

The component includes comprehensive tests covering:
- Rendering with all props
- Correct display of counts
- View link visibility and interaction
- Custom className application
- Edge cases (zero counts, different values)

Run tests:
```bash
npm test -- UpgradeRisks
```

## Storybook

View the component in Storybook with various scenarios:

```bash
npm run storybook
```

Navigate to: **Components/Dashboard/UpgradeRisks**

Available stories:
- Default
- WithViewLink
- HighCritical
- LowRisks
- NoRisks

