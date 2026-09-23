# React code review checklist

For changed `.tsx` / hooks / components (§5).

Measured advice — no blanket `useMemo`/`useCallback`; cite the rerender or correctness issue.

| # | Check |
|---|--------|
| R1 | **Rerenders** — inline object/array/function props to memoized/pure children; memo/callback only when referential stability avoids child work |
| R2 | **Misused memoization** — primitives/trivial expr; empty/wrong deps hiding bugs |
| R3 | **Nested components in render** — remount/lost state; move to module scope |
| R4 | **State placement** — colocate in leaf, not broad parent |
| R5 | **Hook deps** — complete; no stale closures, extra runs, or infinite loops; derive in render vs `useEffect`+`setState` |
| R6 | **Effects** — cleanup, abort async, no redundant fetch; no props→state sync when render/key reset suffices |
| R7 | **Keys** — stable ids, not index when list mutates |
| R8 | **Hooks rules** — top level only; custom hooks `use*` |
| R9 | **State updates** — no mutation; functional `setState` when needed |
| R10 | **Refs vs state** — ref for non-render values; not display data that belongs in state |
| R11 | **Event handlers** — `useCallback` for optimized children/effect deps only; no new debounce/throttle per render |
| R12 | **Conditional rendering** — not `{count && <X />}` when `count` can be `0` |
| R13 | **Context** — unstable object/function values rerender all consumers; split/memoize/selectors |
| R14 | **Async in render** — no side effects/`await` in render |
| R15 | **Accessibility** → [ACCESSIBILITY.md](ACCESSIBILITY.md); live audit → separate browser audit when user asks |

**React severity:** **major** — wrong deps, loops, nested remounts, broken async/cleanup · **medium** — rerender hot paths, derived-state effects, bad keys · **minor** — redundant memo, small a11y nits
