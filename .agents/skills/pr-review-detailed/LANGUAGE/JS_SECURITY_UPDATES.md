# JS_SECURITY.md Updates

## Changes made

Enhanced the JavaScript/TypeScript security checklist to make critical security rules more prominent and explicit.

## What was added

### 1. Prominent warning section at the top

Added **"⚠️ Absolute security rules (NEVER allow)"** section immediately after the introduction:

```markdown
## ⚠️ Absolute security rules (NEVER allow)

These patterns are **always major findings** — no exceptions:

1. **`dangerouslySetInnerHTML`** — flag any usage (JS1)
2. **`eval()` or `new Function()`** — flag any usage (JS6)

Even with sanitization, these APIs create unacceptable risk in this codebase. Recommend alternative approaches.
```

### 2. Strengthened checklist items

**JS1 (XSS / DOM injection):**
- Before: "flag raw `dangerouslySetInnerHTML`"
- After: "**NEVER use `dangerouslySetInnerHTML`** — flag any usage as **major** finding"

**JS6 (Code execution):**
- Before: "no unsanitized user input in... template strings executed as code (`eval`, `new Function`)"
- After: "**NEVER use `eval()` or `new Function()`** — flag any usage as **major** finding; no unsanitized user input in shell commands..."

### 3. Explicit severity mapping

Updated severity guidance to explicitly list the prohibited APIs:

```markdown
**JS security severity (map to SKILL.md §11):** 
- **major** — `dangerouslySetInnerHTML` usage (JS1), `eval()` or `new Function()` usage (JS6), 
             exploitable XSS/injection, exposed secrets, client-only auth for protected actions
- **medium** — unsafe patterns with unclear sanitization, type bypass at boundaries, 
               new dep with known advisory (§2)
- **minor** — defense-in-depth nits, logging hygiene
```

## Why these changes matter

### dangerouslySetInnerHTML
- **Risk:** Direct XSS vector if any user-controlled content reaches it
- **Why no exceptions:** Even with sanitization, this API is too risky in a component library that other apps consume
- **Alternative:** Use React's built-in XSS protection (children, text rendering)

### eval() and new Function()
- **Risk:** Arbitrary code execution
- **Why no exceptions:** No legitimate use case in a modern React component library
- **Alternative:** Use proper data structures, JSON parsing, or configuration objects

## Impact on reviews

When pr-review-detailed (or pr-scored-review via delegation) runs:

1. **Automatic major finding** for any usage of these APIs
2. **No context needed** — usage alone is sufficient for the finding
3. **Blocks LGTM verdict** in pr-scored-review (any major finding → NEEDS_CHANGES)
4. **Clear message** to developers that these patterns are not acceptable

## Example finding

```markdown
### Finding: Prohibited API usage - dangerouslySetInnerHTML

**Severity:** major (JS1)
**File:** src/components/Widget/Widget.tsx:42
**Checklist:** LANGUAGE/JS_SECURITY.md

**Issue:** 
Code uses `dangerouslySetInnerHTML`, which is prohibited in this codebase (see JS_SECURITY.md absolute rules).

**Current code:**
```tsx
<div dangerouslySetInnerHTML={{ __html: props.content }} />
```

**Recommended fix:**
Use React's built-in XSS protection by rendering content as children:
```tsx
<div>{props.content}</div>
```

If HTML rendering is truly required, this needs architectural review and an explicit exception approval.

**Why this matters:**
Even with sanitization, `dangerouslySetInnerHTML` creates an XSS attack surface that is unacceptable in a shared component library.
```

## Integration with other skills

- **pr-review-detailed:** Applies this checklist in §7 (Language checklists)
- **pr-scored-review:** Maps major findings from JS_SECURITY.md to the Security lens (2 points)
- **SECURITY.md:** JS_SECURITY.md is applied after the language-agnostic SECURITY.md (S1-S8)

## Related files

| File | Purpose |
|------|---------|
| `JS_SECURITY.md` | This file - JavaScript/TypeScript security checklist |
| `../SECURITY.md` | Language-agnostic security checklist (applied first) |
| `../SKILL.md` | pr-review-detailed orchestrator (runs this in §7) |
| `../../pr-scored-review/SKILL.md` | Scores findings from this checklist |
