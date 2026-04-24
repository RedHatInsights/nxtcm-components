---
name: accessibility-check
description: Use Cursor's browser aria snapshots to audit a page for accessibility issues — prefer native HTML over ARIA, correct roles and nesting, missing labels, keyboard, contrast, and WCAG 2.2 Level A/AA spot-checks where tools allow.
user-invocable: true
---

# Accessibility Auditing

Audit a web page for accessibility issues using Cursor's built-in browser without external tools.

## Workflow

### 1. Open the Page

Use `browser_navigate` to open the target URL.

### 2. Capture the Accessibility Tree

Use `browser_snapshot` — this returns the aria/accessibility tree of the page. This is the same tree that screen readers use.

### 3. Audit the Tree

Check for these issues:

**Missing Labels**
- `button` elements with no accessible name (no text, no `aria-label`)
- `img` elements with no `alt` text
- `input` elements with no associated `label` or `aria-label`
- `a` (link) elements with no text content
- Icon-only buttons missing `aria-label`

**Semantic HTML**
- Clickable `div` or `span` elements → should be `button` or `a`
- Missing `nav`, `main`, `header`, `footer` landmarks
- Headings that skip levels (h1 → h3)
- Lists that aren't using `ul`/`ol`/`li`

**Keyboard Navigation**
- Interactive elements missing from tab order
- Custom widgets without `role` and keyboard handlers
- Focus traps in modals (should trap focus, but also allow Escape to close)
- Skip-to-content link missing

**ARIA — prefer native HTML first**  
Reference patterns: [ARIA Authoring Practices Guide — example index](https://www.w3.org/WAI/ARIA/apg/example-index/) (illustrative; always match behavior to the spec and tests).

- **Default to native elements** — Use real `<button>`, `<a href>`, `<input>`, `<select>`, `<textarea>`, `<label>`, `<table>`, landmarks (`<main>`, `<nav>`, etc.), and built-in visibility/disabled state before reaching for `role` / `aria-*`. **Less ARIA is better than bad ARIA**; redundant or contradictory ARIA often makes the tree *worse* than leaving attributes off.
- **Use ARIA only when you must** — Typical cases: composite widgets (tabs, listbox, grid), live regions, labelling when no visible label element exists, or bridging custom controls. If HTML can express it, **do not** duplicate with ARIA.
- **Correct element, correct nesting** — `role` and widget ARIA belong on the element that actually receives focus and events. **Owned** nodes (`aria-owns`, listbox options, tree children) must follow the parent/child patterns from the spec; **required owned elements** must exist (e.g. combobox + listbox). **States match reality**: `aria-expanded`, `aria-selected`, `aria-checked`, `aria-disabled`, etc. must reflect what is on screen and what keyboard/pointer does.
- **Common mistakes to flag** — `aria-hidden="true"` on focusable content; **invalid** `role` or **abstract** roles on interactive nodes; `aria-labelledby` / `aria-describedby` pointing at missing `id`s; `aria-controls` / `aria-activedescendant` pointing at wrong or missing nodes; **focusable descendants** inside elements marked `aria-hidden`; **interactive** roles on non-keyboard-operable widgets; heading/landmark roles used when real `<h*>` / landmarks would work.

**Contrast** (use screenshot for visual check)
- Light gray text on white backgrounds
- Placeholder text that's too faint
- Disabled states that are indistinguishable

### 4. Test Keyboard Navigation

Use `browser_press` to simulate Tab key presses and verify:
- Every interactive element receives focus
- Focus order is logical (top-to-bottom, left-to-right)
- Focus is visible (focus ring or outline)
- Escape closes modals/dropdowns

### 5. Report

```
Accessibility Audit:
  Critical:
    - 3 buttons with no accessible name (header icons)
    - Login form inputs missing labels
  Warnings:
    - Heading levels skip from h1 to h3
    - No skip-to-content link
    - 2 clickable divs should be buttons
  Passed:
    - All images have alt text
    - Landmarks present (nav, main, footer)
    - Focus order is logical
```

### 6. Fix

For each issue, apply the fix in the source code. Common fixes:
- Prefer **native HTML** over `role` / `aria-*` when it can carry the same semantics; **remove** redundant or conflicting ARIA.
- Add `aria-label="Close"` to icon buttons only when there is no visible text label
- Wrap inputs in `<label>` or add `htmlFor`
- Change `<div onClick>` to `<button>` (or `<a>` for navigation) instead of `role="button"` on a non-button
- Add `alt` text to images if visible to the end user
- Fix heading hierarchy
- Align **states** (`aria-expanded`, `aria-selected`, …) and **IDs** (`aria-controls`, `aria-activedescendant`, …) with the real DOM and focus behavior

### 7. Clean Up Browser Artifacts

When the audit is **complete** (after you have reported findings and applied any fixes), remove files the browser / Playwright MCP wrote under the **workspace** so they do not pile up in the tree.

- Typical location: **`.playwright-mcp/`** at the repo root (or the path shown in tool output).
- Typical patterns: `page-*.yml` (accessibility snapshots), `console-*.log`, and any screenshots saved next to them (e.g. `*.png` from `browser_take_screenshot`).
- Delete those generated files (or the whole `.playwright-mcp/` directory if it only holds this session’s artifacts). Do **not** delete unrelated project files or user assets outside this folder.

If cleanup fails (e.g. path differs), note that in your response so the user can remove leftovers manually.