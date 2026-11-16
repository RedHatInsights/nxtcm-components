# Display settings accessibility coverage

How the dashboard and wizard are checked under dark theme, text resize, zoom/reflow, and forced colors (FCN-821). Light-theme axe scans stay in each component's own spec.

## How each condition is modelled

| Condition     | Automation                                                                                                                      | WCAG                 |
| ------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| Dark theme    | `pf-v6-theme-dark` on `<html>`, then axe                                                                                        | 1.4.3, 1.4.11        |
| Zoom / reflow | 320×256 CSS px viewport (1280px at 400% zoom); no horizontal page scroll, primary control reachable                             | 1.4.10               |
| Text resize   | Root font size 200% (PatternFly sizes text in `rem`); no horizontal scroll, text equivalents visible, primary control reachable | 1.4.4                |
| Forced colors | `page.emulateMedia({ forcedColors: 'active' })`; text equivalents visible, focus changes how the control is drawn               | 1.4.1, 1.4.11, 2.4.7 |

Helpers live in `playwright/display-a11y-helpers.ts`. The CT condition list lives in `playwright/display-a11y-matrix.ts`; each package spec registers one test per view × condition.

## Coverage matrix

All conditions run in CI through the existing `components` (CT) and `e2e` Playwright projects on React 18 and 19.

### Dashboard — `packages/nxtcm-dashboard/src/displayAccessibility.spec.tsx`

| View                                          | Dark axe | 320px | 200% text | Forced colors | Primary control |
| --------------------------------------------- | -------- | ----- | --------- | ------------- | --------------- |
| Composed `Dashboard`                          | ✓        | ✓     | ✓         | ✓             | Add widgets     |
| Composed `Dashboard`, Add widgets drawer open | ✓        | —     | —         | —             | —               |
| `ResourceUtilization` with data               | ✓        | ✓     | ✓         | ✓             | View more       |
| `ResourceUtilization` loading                 | ✓        | ✓     | ✓         | ✓             | —               |
| `StorageCard`                                 | ✓        | ✓     | ✓         | ✓             | View more       |
| `ClusterProviders`                            | ✓        | ✓     | ✓         | ✓             | —               |
| `UpdateStatus`                                | ✓        | ✓     | ✓         | ✓             | —               |
| `AdvisorSeverity`                             | ✓        | ✓     | ✓         | ✓             | View more       |
| `ClustersWithIssues`                          | ✓        | ✓     | ✓         | ✓             | Cluster link    |
| `ExpiredTrials`                               | ✓        | ✓     | ✓         | ✓             | Trial link      |

The composed dashboard is also checked at 900, 1200, 1450, and 1650px (one width per grid breakpoint): no tile's content may scroll at the default layout.

### Wizard components — `packages/nxtcm-rosa-hcp-wizard/src/displayAccessibility.spec.tsx`

Every view runs all four conditions.

| View               | State covered        |
| ------------------ | -------------------- |
| Text input         | Validation error     |
| Select             | Validation error     |
| Select             | Open menu (expanded) |
| Checkbox           | Validation error     |
| Radio group        | Selected option      |
| Details drawer     | Expanded drawer      |
| Review section     | Expanded section     |
| Submit error alert | Danger alert         |

### Full wizard — `playwright/e2e/accessibility-display.spec.ts`

| Condition     | States covered                                                                                                                                                       |
| ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Dark axe      | Initial page, step validation errors, open select, review page, YAML editor, discard dialog                                                                          |
| 320px         | Details step and step errors, collapsed nav toggle, review page (footer excepted, see below), YAML editor controls; footer Next/Cancel reachable on the details step |
| 200% text     | Details step and step errors, review page                                                                                                                            |
| Forced colors | Focus indicator on text field, select, nav step, Next, Cancel; step errors shown as text                                                                             |

## Color independence

- **Charts** (`ResourceUtilization`, `StorageCard`, `ClusterProviders`, cluster totals): every donut has a visible text value and label (for example `25%` / `of 128 Cores`, `ROSA: 42`). Legend color dots are decoration and disappear in forced colors; the text carries the value.
- **Status** (`UpdateStatus`, `AdvisorSeverity`, issues): each status icon is paired with a text label or count.
- **Validation**: errors show an icon plus text, and the text stays visible in forced colors.
- **Wizard current step**: exposed to assistive technology with `aria-current="step"`. Visually PatternFly marks it only with color (see exceptions).

## Documented exceptions

| Exception                                                     | Why it is accepted                                                                                                                                                                                                              |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| YAML editor code area scrolls horizontally at 320px           | Code lines must not wrap. The page around it does not scroll.                                                                                                                                                                   |
| YAML editor syntax colors excluded from `color-contrast`      | Owned by the Monaco editor theme. The discard dialog is still scanned for contrast.                                                                                                                                             |
| Dashboard tiles scroll at 200%+ text                          | Grid tiles have fixed row heights by design in `@patternfly/widgetized-dashboard`. Tiles without a focusable child cannot be scrolled with the keyboard there; this needs `tabIndex="0"` and a label on the tile body upstream. |
| Open select menu loses its border and shadow in forced colors | PatternFly-internal. Options, focus, and the selected value remain visible.                                                                                                                                                     |
| Review page "Edit step" links break mid-word at 320px         | Still readable and operable; cosmetic.                                                                                                                                                                                          |
| Wizard footer overflows at 320px on the Review step           | PatternFly's `WizardFooter` uses a non-wrapping `ActionList`, so Cancel is pushed off-screen next to "Create cluster". Needs an upstream PatternFly fix; we do not override PatternFly CSS.                                     |
| Current wizard step is indistinguishable in forced colors     | PatternFly shows the current step only with color and background, which forced colors removes. `aria-current="step"` is still announced. Needs an upstream PatternFly fix.                                                      |
| Felt light / felt dark themes are not automated               | They share the PatternFly token structure; covered by the manual checklist.                                                                                                                                                     |

## Manual checklist

Run before releases that change layout, theme, or styling:

- [ ] Real browser zoom at 200% and 400% in Chrome and Firefox: no horizontal page scroll, nothing overlaps, all controls reachable.
- [ ] Browser text-only zoom at 200% (Firefox "Zoom text only").
- [ ] Windows High Contrast (real, not emulated): focus rings, selected states, validation errors, current wizard step.
- [ ] macOS "Increase contrast".
- [ ] Storybook felt light and felt dark themes: dashboard and wizard read correctly.
- [ ] Charts are readable at each zoom level, and legends line up with their values.
- [ ] Screen reader (VoiceOver or NVDA) announces chart titles/descriptions and status labels.
