# Accessibility review checklist

For changed `.tsx` / `.jsx` / markup in §5 scope.

**Static review only** — inspect source and tests. Do **not** use `browser_navigate`, `browser_snapshot`, `browser_press`, or screenshots here; this checklist is meant to run in PR review and CI without a live app.

For a full live-page audit when the user explicitly wants browser tooling, handle that as a separate request — not part of this static checklist.

**Docs:** [ARIA APG example index](https://www.w3.org/WAI/ARIA/apg/example-index/) · PatternFly component a11y notes (PATTERNFLY.md / PatternFly MCP)

---

## 1. Checklist

Prefer **native HTML** over ARIA. Less ARIA is better than wrong ARIA.

| # | Check |
|---|--------|
| A1 | **Nested interactives** — no `<button>` inside `<button>`, `<a>` inside `<a>`, or `<button>` inside `<a>` / vice versa; no focusable control inside another focusable control (see §2) |
| A2 | **Click target not shrunk** — visible hit area matches affordance; no regressions from removed padding, overlays, or `pointer-events: none` that leave only a tiny sub-region clickable (see §3) |
| A3 | **Accessible names present** — every `button`, link, and icon-only control has visible text, `aria-label`, or `aria-labelledby`; inputs tied to `<label>` / `htmlFor` / `aria-label`; names must also be **descriptive in context**, not generic (see §5) |
| A4 | **Native semantics** — use `<button>`, `<a href>`, `<input>`, landmarks (`main`, `nav`, …) before `role` / `aria-*`; no `<div onClick>` / `<span onClick>` when a native element works |
| A5 | **PF default labels overridden** — PatternFly components that ship generic built-in `aria-label` text must be customized for this UI (see §5) |
| A6 | **Images & icons** — meaningful `alt` on content images; decorative images `alt=""` or `aria-hidden`; icon-only buttons labeled |
| A7 | **Headings & landmarks** — logical heading order (no skipped levels without reason); page regions use landmarks, not `role="main"` when `<main>` works |
| A8 | **Keyboard & focus (code review)** — custom widgets have key handlers matching role; modals/drawers use focus trap + Escape close per repo pattern; no `tabIndex={-1}` or `tabIndex={0}` on non-widgets without reason |
| A9 | **ARIA correctness** — states match UI (`aria-expanded`, `aria-selected`, `aria-checked`, `aria-disabled`); `aria-controls` / `aria-labelledby` / `aria-describedby` reference existing `id`s; no `aria-hidden="true"` on focusable descendants |
| A10 | **Forms** — errors associated with fields (`aria-invalid`, `aria-describedby`, PF `FormHelperText`); required fields marked accessibly; submit buttons have `type="submit"` where appropriate |
| A11 | **Live regions & status** — async success/error/loading announced (`aria-live`, PF `Alert`, `Spinner` + sr-only text) when content updates without focus move |
| A12 | **PF danger alerts** — `<Alert variant="danger">` (or `AlertVariant.danger`) must have `role="alert"` so screen readers assertively announce blocking/critical errors (see §4) |
| A13 | **Tables & lists** — data tables use `<th scope>` / headers; selectable rows don't steal activation from nested controls (see §2) |
| A14 | **Motion & visibility** — respect `prefers-reduced-motion` when repo supports it; no information conveyed by color alone without text/icon backup |
| A15 | **Automated a11y tooling** — run repo hooks when present (`eslint-plugin-jsx-a11y`, CT `checkAccessibility`, axe) — see §6; test file patterns → [UNIT_TESTS.md](../REPO_SPECIFIC/UNIT_TESTS.md) |

**Accessibility severity (map to SKILL.md §11):** **major** — nested interactives, missing names on controls, keyboard trap with no escape, form inputs unreachable/unlabeled, **danger `Alert` without `role="alert"`** · **medium** — **generic `aria-label` on icon-only or sole control**, **PF default label not overridden**, shrunk click targets on primary actions, wrong ARIA state/ids, heading/landmark drift, color-only status · **minor** — redundant ARIA, decorative alt nits, missing reduced-motion polish

---

## 2. Nested interactives (high priority)

Screen readers and keyboard users get **duplicate or conflicting actions** when one interactive wraps another. PatternFly layouts make this easy — review composition carefully.

### 2a. Patterns to flag

| Pattern | Problem | Prefer |
|---------|---------|--------|
| Row/card/list item with `onClick` / `onRowClick` / `isClickable` / `isSelectable` **and** inner `<Button>`, `<a>`, `<Checkbox>`, `<MenuToggle>`, `<Dropdown>`, `<Switch>` | Two activations on one visual row; inner control may not receive click | One primary action on the row **or** stop propagation on inner controls **and** document pattern; better: row navigates, actions in separate column with no row handler |
| `<Button>` wrapping `<Link>` or another `<Button>` | Invalid nesting | Single control; use `Button variant="link"` + `router Link` composition per repo pattern |
| `<a href>` wrapping `<Button>` | Invalid nesting | Button styled as link, or link styled as button — not both |
| PF `Card` `isSelectable` / `isClickable` + footer/header actions | Nested click targets | Select via checkbox/radio only, or card click only — not both without clear hit regions |
| PF `DataList` / `DataListItem` row click + row actions | Same as table row click | `onSelect` vs action buttons in distinct zones |
| PF `Table` `onRowClick` + selection column + row actions | Click area ambiguity | `stopPropagation` on checkbox/actions **and** verify keyboard; prefer explicit action column |
| PF `ExpandableSection` toggle + buttons in header | Header click toggles while buttons need separate clicks | Separate toggle control from action buttons (PF examples) |
| PF `Breadcrumb` / `Tabs` / `Nav` item containing a `<button>` | Nav item + control nested | Use component's intended item/link API |
| `role="button"` on container with focusable children | Same as nested buttons | Move role/handlers to one element |

### 2b. How to scan changed files

**Goal:** Find places where a row, card, or container is clickable *and* might also contain buttons, links, or checkboxes.

**Step 1 — limit to the PR diff**

Only review `.tsx` / `.jsx` files that changed vs the base branch. Write the list to `.a11y-diff-tsx.txt`.

**Step 2 — search for these patterns**

| Search for | Why | Log file |
|------------|-----|----------|
| `onRowClick`, `isClickable`, `isSelectable`, `isSelected`, `onClick={` | Row/card/list might be clickable | `.a11y-row-click-hits.txt` |
| `<div`, `<span`, `<tr`, `<td`, or `<li` on the **same line** as `onClick` | Click handler on a non-button element (A4) | `.a11y-div-click-hits.txt` |
| A `<Button>`, `<button>`, `<a>`, or `<Link>` **inside** another one | Invalid nested interactives (A1) | manual review of Step 2 hits |

For each file in `.a11y-row-click-hits.txt`, open the component and ask: *does this row/card also render a Button, Link, Checkbox, MenuToggle, or Dropdown inside it?* That manual pass catches what regex cannot reliably prove.

**Step 3 — review hits**

False positives happen. Only flag **ancestor wraps descendant** — not siblings side by side.

**Agent commands** (run from repo root; `BASE` defaults to `main`):

```bash
BASE="${BASE:-main}"

git diff "$BASE"...HEAD --name-only --diff-filter=ACMRT -- '*.tsx' '*.jsx' > .a11y-diff-tsx.txt

rg -n 'onRowClick|isClickable|isSelectable|isSelected|onClick=\{' \
  $(cat .a11y-diff-tsx.txt) > .a11y-row-click-hits.txt 2>/dev/null || true

rg -n 'onClick' $(cat .a11y-diff-tsx.txt) \
  | rg '<(div|span|li|tr|td)' > .a11y-div-click-hits.txt 2>/dev/null || true
```

`.a11y-nested-interactive-hits.txt` is optional — prefer manual review of row-click files over brittle nested-tag regex.

---

## 3. Click target reduction (high priority)

Users should not need pixel-perfect aim for primary actions. Flag **regressions** in the diff.

### 3a. What to look for

| Signal | Likely regression |
|--------|-------------------|
| Switch to `variant="plain"` / `variant="link"` / icon-only for the **main** row action | Smaller hit area vs previous button |
| Removed `padding`, `min-height`, or PF size prop (`size="sm"`) on primary control | WCAG 2.2 **2.5.8** target size (24×24 CSS px minimum; 44×44 for touch-heavy UI) |
| Large visual row/card but only text label is `<a>` / `onClick` | Row looks clickable; checkbox/icon zone is not |
| `pointer-events: none` on parent, only child receives clicks | Child may be tiny (icon, kebab) |
| Absolute overlay covering list/table | Clicks hit overlay instead of intended control |
| `stopPropagation` on inner control without alternative keyboard path | Mouse works on inner only; row handler still fires on keyboard |

### 3b. How to scan the diff

**Goal:** Spot when this PR **shrinks** the clickable area for a primary action.

| Search the diff for | Why |
|---------------------|-----|
| `variant="plain"` or `variant="link"` on a main action | Smaller hit target |
| `size="sm"` on a primary control | Smaller hit target |
| `padding: 0`, `min-height: 0`, `pointer-events: none` | Clicks may only land on a tiny child |

Compare before vs after in the PR — flag when the control got smaller but the UI still *looks* like the whole row/card is clickable.

**Agent command:**

```bash
git diff "$BASE"...HEAD -U0 -- '*.tsx' '*.scss' '*.css' \
  | rg -n 'variant="plain"|variant="link"|size="sm"|padding: 0|min-height: 0|pointer-events: none' \
  > .a11y-target-shrink-hits.txt 2>/dev/null || true
```

---

## 4. PatternFly danger alerts (`role="alert"`)

PatternFly `Alert` renders a `<div>` and does **not** assign `role="alert"` based on `variant`. Critical/blocking **danger** alerts must set it explicitly so assistive tech announces them assertively (implicit `aria-live="assertive"`).

### 4a. What to flag

| Pattern | Problem | Fix |
|---------|---------|-----|
| `<Alert variant="danger" …>` without `role="alert"` | Error may not be announced when it appears or updates | Add `role="alert"` on the `Alert` |
| `<Alert variant={AlertVariant.danger} …>` without `role="alert"` | Same | Same |
| `role="status"` or other role on danger `Alert` | Under-announces critical errors | Use `role="alert"` |
| Custom error `<div className="pf-v*-c-alert pf-m-danger">` without `role="alert"` | Bypasses PF component without a11y semantics | Use `Alert` + `role="alert"`, or add role on the custom root |

**Also verify (same review pass):**

- Dynamic/toast danger alerts live in an `AlertGroup` with `isLiveRegion` (or equivalent `aria-live`) — see PatternFly alert a11y docs.
- Danger alerts that appear asynchronously still need `role="alert"` on each `Alert`; the group live region alone is not a substitute.

**Not required** on non-danger variants (`success`, `info`, `warning`) unless the repo pattern says otherwise — `role="status"` or polite live regions are typical there.

### 4b. How to scan changed files

**Goal:** Every PatternFly **danger** alert must include `role="alert"`.

**Step 1 — find danger alerts**

Search changed `.tsx` / `.jsx` files for:

| Search for | Example |
|------------|---------|
| `<Alert` + `variant="danger"` | `<Alert variant="danger" title="…" />` |
| `<Alert` + `variant={AlertVariant.danger}` | `<Alert variant={AlertVariant.danger} … />` |
| Custom markup | `className="… pf-m-danger …"` on a plain `<div>` |

Write matches to `.a11y-danger-alert-hits.txt`.

**Step 2 — confirm `role="alert"`**

For each hit, check the `<Alert …>` opening tag (props may span multiple lines). It must include:

```tsx
role="alert"
```

If props are spread (`{...alertProps}`), trace the spread source — do not assume.

**Step 3 — likely misses**

`.a11y-danger-alert-missing-role.txt` lists **same-line** danger alerts with no `role="alert"`. Multi-line JSX needs a manual read of Step 1 hits.

**Agent commands:**

```bash
rg -n 'variant="danger"|AlertVariant\.danger' $(cat .a11y-diff-tsx.txt) \
  | rg '<Alert' > .a11y-danger-alert-hits.txt 2>/dev/null || true

rg -n '<Alert[^>]*variant="danger"' $(cat .a11y-diff-tsx.txt) \
  | rg -v 'role="alert"' > .a11y-danger-alert-missing-role.txt 2>/dev/null || true

rg -n '<Alert[^>]*variant=\{[^}]*AlertVariant\.danger' $(cat .a11y-diff-tsx.txt) \
  | rg -v 'role="alert"' >> .a11y-danger-alert-missing-role.txt 2>/dev/null || true
```

---

## 5. Descriptive labels & PatternFly defaults

An accessible name must say **what** the control does and **what it applies to**. Screen reader users hear the label out of context — "Close" or "Actions" alone is not enough.

### 5a. Too generic — flag these

| Label (examples) | Problem | Better |
|------------------|---------|--------|
| `Close` | Does not say *what* closes | `Close delete cluster modal` |
| `Menu`, `Actions`, `Options`, `More` | Does not say *whose* menu | `Actions for cluster prod-east-1` |
| `Edit`, `Delete`, `Remove` | Does not say *what* is affected | `Delete namespace openshift-logging` |
| `Expand`, `Collapse`, `Toggle`, `Open` | Does not say *what* expands | `Expand networking details for node worker-3` |
| `Next`, `Previous`, `Page` | Does not identify the set | `Next page, installed operators table` |
| `Search`, `Filter`, `Sort`, `Select` | Does not identify the scope | `Filter clusters by name` |
| Component name only (`Icon`, `Button`, `Kebab`) | Not a purpose | Describe the action + target |

**Pass** when visible text or `aria-labelledby` already gives full context and the control does not rely on a generic `aria-label` alone.

**Also check:** dynamic strings (`aria-label={\`Delete ${name}\`}`) — confirm `name` is user-meaningful, not an internal id, unless ids are what users know.

### 5b. PatternFly components with built-in generic labels

PatternFly sets default accessible names on many sub-components. When the diff uses these, confirm the default was **replaced or made specific** via the prop in the table — do not ship PF boilerplate when the UI needs context.

| Component | Prop to override | PF default | Override when |
|-----------|------------------|------------|---------------|
| `Modal` close button | `aria-label` (close) | `"Close"` | **Always** — include modal purpose |
| `Modal` (no visible title) | `aria-label` | none | **Required** — name the dialog |
| `AlertActionCloseButton` | `aria-label` | `Close [variant] alert: [title]` | Title is vague (`Error`, `Warning`) or identical across multiple alerts |
| `Alert` (expandable) | `toggleAriaLabel` | `[Variant] alert details` | **Usually override** — say what details contain |
| `Pagination` | `titles.paginationAriaLabel` | `"Pagination"` | **Always** when more than one pager on the page; include table/section name and position (top/bottom) |
| `MenuToggle` / icon-only `Dropdown` | `aria-label` | often none | **Required** — name the menu |
| `OptionsMenu` / kebab toggle | `aria-label` | varies | Name whose options and what they affect |
| `ExpandableSection` | toggle `aria-label` / PF toggle props | generic expand/collapse | Name the section content |
| `Chip` / removable `Label` close | close `aria-label` | `"Close"` or chip text only | Include what's being removed if ambiguous |
| `Wizard` close | close `aria-label` | `"Close"` | Name the wizard task |
| `Toolbar` filter/chip toggles | `aria-label` | often generic | Name filter scope |

Verify exact prop names against [PatternFly a11y docs](https://www.patternfly.org/) or PatternFly MCP when unsure — PF renames props between versions.

### 5c. How to scan changed files

**Goal:** Find `aria-label` values that are generic, and PF components still using boilerplate defaults.

**Step 1 — list every explicit label in the diff**

| Search for | Log file |
|------------|----------|
| `aria-label=` | `.a11y-aria-label-hits.txt` |
| `toggleAriaLabel=`, `paginationAriaLabel`, `bodyAriaLabel` | `.a11y-pf-label-props-hits.txt` |

**Step 2 — review each hit**

Ask: *If I heard only this string, would I know what this control does and what it affects?* If no → finding.

**Step 3 — find PF components that need override props**

| Search for | Then check |
|------------|------------|
| `<Modal` | Close `aria-label` is not bare `"Close"`; untitled modals have `aria-label` |
| `<Pagination` | `titles` includes `paginationAriaLabel` with context when multiple pagers exist |
| `<AlertActionCloseButton` | Custom `aria-label` when alert `title` is not specific enough |
| `<Alert` + `isExpandable` | Custom `toggleAriaLabel` |
| `<MenuToggle`, `<Dropdown`, `<OptionsMenu` | Icon-only toggles have descriptive `aria-label` |
| `<ExpandableSection`, `<Wizard` | Close/toggle labels name the task or section |

Write PF component lines to `.a11y-pf-labeled-components.txt` for manual review.

**Step 4 — likely generic labels (heuristic)**

Same-line labels matching common boilerplate → `.a11y-generic-label-hits.txt`. **Confirm in context** — `"Close"` on a unique modal with a specific `aria-labelledby` title may be OK if the title is announced first.

**Agent commands:**

```bash
rg -n 'aria-label=' $(cat .a11y-diff-tsx.txt) > .a11y-aria-label-hits.txt 2>/dev/null || true

rg -n 'toggleAriaLabel=|paginationAriaLabel|bodyAriaLabel=' $(cat .a11y-diff-tsx.txt) \
  > .a11y-pf-label-props-hits.txt 2>/dev/null || true

rg -n '<Modal|<Pagination|<AlertActionCloseButton|<MenuToggle|<Dropdown|<OptionsMenu|<ExpandableSection|<Wizard' \
  $(cat .a11y-diff-tsx.txt) > .a11y-pf-labeled-components.txt 2>/dev/null || true

rg -n 'aria-label="(Close|Menu|Actions|Options|More|Edit|Delete|Remove|Expand|Collapse|Toggle|Open|Next|Previous|Search|Filter|Sort|Select|Button|Icon)"' \
  $(cat .a11y-diff-tsx.txt) > .a11y-generic-label-hits.txt 2>/dev/null || true
```

---

## 6. Automated checks (CI-friendly)

Run what the repo already provides; do not add new tooling in review unless fixing the diff.

| Tool | When |
|------|------|
| `eslint-plugin-jsx-a11y` | Part of `npm run lint` ([REPO_SPECIFIC/VERIFICATION.md](../REPO_SPECIFIC/VERIFICATION.md)) — parse lint output for a11y rules |
| Playwright CT `checkAccessibility` / `@axe-core/playwright` / `jest-axe` | When repo already uses them on changed UI — mirror PF a11y examples where applicable (CT9 in [UNIT_TESTS.md](../REPO_SPECIFIC/UNIT_TESTS.md)) |

If lint includes jsx-a11y failures on diff files → **major** or **medium** per rule (anchor-is-valid, click-events-have-key-events, no-static-element-interactions, label-has-associated-control, etc.).

---

## 7. Report

Group findings under **Accessibility** in SKILL.md **§12**:

```
Accessibility:
  major:
    - Danger Alert missing role="alert" (ErrorBanner.tsx:24)
    - TableRow onRowClick + Checkbox in same row without stopPropagation (File.tsx:42)
  medium:
    - Modal close uses default aria-label "Close" — should name the dialog (SettingsModal.tsx:31)
    - Pagination missing paginationAriaLabel; duplicate "Pagination" landmark (Table.tsx:88)
  minor:
    - Redundant role="button" on <button> (File.tsx:15)
```

Note **skipped** live checks (contrast, focus ring visibility, tab order) — recommend a live browser audit or manual QA when UI-heavy.

---

## 8. Common fixes

- **One interactive per gesture** — row OR button, not both; use explicit columns for actions.
- **`e.stopPropagation()`** on inner controls only when row handler must remain — verify keyboard still works.
- **Expand hit area** — keep PF `Button` default/min sizes; use `display: inline-flex` + padding on link-styled actions.
- **Labels** — `aria-label` must describe action + target; visible `<label htmlFor>` for inputs.
- **PF defaults** — override boilerplate labels, e.g. `aria-label="Close discard changes modal"`, `titles={{ paginationAriaLabel: 'Pagination for clusters table, bottom' }}`, `toggleAriaLabel="Networking details for worker-3"`.
- **Prefer native** — `<button type="button">` over `<div role="button" tabIndex={0} onClick>`; add `onKeyDown` only when unavoidable.
- **Danger alerts** — `<Alert variant="danger" role="alert" title="…" />` (or `AlertVariant.danger`).
- **Remove bad ARIA** — delete redundant `role`, fix wrong `aria-expanded`, unhide focusable content.

---

## 9. Cleanup

Delete §2–§5 artifacts in SKILL.md **§13**:

`.a11y-diff-tsx.txt`, `.a11y-row-click-hits.txt`, `.a11y-div-click-hits.txt`, `.a11y-target-shrink-hits.txt`, `.a11y-danger-alert-hits.txt`, `.a11y-danger-alert-missing-role.txt`, `.a11y-aria-label-hits.txt`, `.a11y-pf-label-props-hits.txt`, `.a11y-pf-labeled-components.txt`, `.a11y-generic-label-hits.txt`
