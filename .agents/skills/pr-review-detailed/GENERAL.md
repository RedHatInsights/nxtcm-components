# General code review checklist

Also apply PR judgment for **correctness** and **breaking API changes**. Architecture & public API signals → [ARCHITECTURE.md](ARCHITECTURE.md). Language-agnostic security → [SECURITY.md](SECURITY.md); stack-specific rules → companion files in [LANGUAGE/](LANGUAGE/). Test coverage and quality → [TESTING.md](TESTING.md); repo/project conventions → companion files in [REPO_SPECIFIC/](REPO_SPECIFIC/).

| # | Question |
|---|----------|
| 1 | Follows team standards (SKILL.md §2)? |
| 2 | Any **repeated** code? |
| 3 | Uses **existing types** instead of new ones? |
| 4 | Reuses **existing helpers** instead of new code? |
| 5 | **Flow** easy to read? |
| 6 | Can **complexity** be reduced? |
| 7 | **Concise** without hurting readability? |
| 8 | **Variable names** reflect contents? |
| 9 | **Single responsibility**; **minimum code** for the feature? |
| 10 | **Edge cases:** only if they prevent a **real-world failure** — else simplest implementation. No over-defensive code |
| 11 | **Breaking changes intentional?** — public exports, function/method signatures, API request/response shapes, route/query params, shared types |
| 12 | **Error paths handled?** — failures surfaced to user or caller; no silent catches, swallowed errors, or happy-path-only logic |
| 13 | **Async / empty / error handling** — user-visible flows have loading, empty, and error states when the repo has UI; backend/services return or propagate errors instead of failing silently |
| 14 | **Debug leftovers removed?** — no stray logging, breakpoints, commented-out code, or scratch TODOs without a ticket |
| 15 | **Magic values extracted?** — repeated literals, status codes, route keys, feature names |
| 16 | **User-facing copy** — when the change includes UI or external messages, strings follow repo i18n/localization convention |
| 17 | **Efficiency at boundaries** — no obvious duplicate remote calls, unbounded queries/loops, or N+1 patterns without pagination or batching |
| 18 | **Docs updated** for non-obvious behavior — README, API docs, architecture notes ([ARCHITECTURE.md](ARCHITECTURE.md)), or inline comment only where the *why* is not obvious? |
