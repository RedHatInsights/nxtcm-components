# Accessibility check — wizards-rosawizard--default (iframe)

**Date:** 2026-04-22  
**URL:** [nxtcm-components — ROSA wizard story (iframe)](https://redhatinsights.github.io/nxtcm-components/iframe.html?globals=&args=&id=wizards-rosawizard--default&viewMode=story)  
**Method:** Browser accessibility tree snapshot, interactive node review, one Tab key press, and visual spot-check (screenshot).

## Session notes

- The story did not render on the first paint; after a few seconds the wizard loaded and the page title became `wizards-rosawizard--default`. Expect a **loading/flash** before the main UI.
- Focus rings are not available from the accessibility tree alone; only a **single** Tab was exercised. **Interactive** nodes in the story iframe had **accessible names** in the tree.
- **Contrast:** Dark text on light background; placeholders looked typical. A measured WCAG pass/fail was not performed.

---

## Accessibility audit

### Critical

- The accessibility tree included a **“No Preview”** block (with an `h1` and multiple troubleshooting `listitem` entries) **at the same time** as the live “Create ROSA Cluster” experience. A viewport screenshot at that time showed the real wizard, not the error copy—so the error content may be **visually hidden** but still **exposed to the accessibility API**, which can cause **confusing or duplicate announcements**, **two `h1` elements** in one view, and misleading “no story” language for screen reader users. Whatever keeps that content in the DOM (e.g. Storybook shell or a leftover error panel) should be **`aria-hidden="true"`** when it is not meant to be perceivable, or **not rendered** once the story is healthy.

### Warnings

- **Heading order:** The tree included **`h1` “No Preview”** and **`h1` “Create ROSA Cluster”**, and later an **`h4` “Info alert: …”** in the form flow. Even if the “No Preview” path is removed, an **`h1` → `h4` jump** (without intermediate `h2`/`h3`) can be awkward for **heading-based navigation**; use a **logical subheading** sequence under the main page title.
- **Stepper / sub-step list:** Some **`listitem` nodes** contained **mushed** text (e.g. a single list item that bundled multiple step names), which is weak for **“where am I in the list?”** semantics. Prefer a **valid list** with **one clear, short** name per step.
- **Reused control names:** Many controls shared generic names (**“More info”**, **“Menu toggle”**, **“Refresh”**), which is valid but not **distinguishing**; consider field-specific names (e.g. *More info for associated AWS infrastructure account*) for **voice control** and **out-of-context** screen reader use.

### Passed (spot-check)

- **Form fields** (textbox, combobox) had **associated names** in the tree (e.g. cluster name, OpenShift version, region).
- **Icon-style actions** generally had **string names** in the tree: “More info”, “Menu toggle”, “Refresh”, “Wizard toggle”.
- The **external billing** link’s name included **“(new window or tab)”**.
- **“Back”** was exposed with **disabled** state on the first step; **“Next”** and **“Cancel”** were present and named.
- **Regions** with names appeared (e.g. “Details”, “Roles and policies”, “Networking and subnets”).

---

## Confidence

- **High** confidence in the **accessibility tree contents** and **interactive naming** for the story iframe at the time of the snapshot.  
- **Medium** confidence on the **root cause** of the coexisting “No Preview” content (e.g. Storybook vs. transient/ghost node); **DOM inspection** would be needed to fix the right layer.

## Follow-up (recommended)

1. Identify why “No Preview” / troubleshooting list items stay in the **accessibility tree** when the story renders, and **hide** or **remove** that branch from the AT when it is not visible.  
2. Normalize **heading levels** and **list structure** for the wizard stepper.  
3. Tighten **repeated** button/link names with **context** where the same control pattern repeats per field.
