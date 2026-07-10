# Security review checklist (language & framework agnostic)

For changed files in §5 scope — especially application code, API handlers, config, docs, and lockfiles.

Trace external data from inputs to sinks (UI, storage, network, shell, database). Report with SKILL.md **§11** severity + change scope.

Stack- or package-manager-specific rules and automated scans → companion files in [LANGUAGE/](LANGUAGE/) (when present).

---

## 1. Checklist

| # | Check |
|---|--------|
| S1 | **Injection** — no unsanitized user or external input in shell commands, dynamic query builders, or code executed at runtime |
| S2 | **Secrets exposure** — no API keys, tokens, passwords, or PII in source, committed config, client-accessible storage, or responses sent to untrusted clients |
| S3 | **Trust boundaries** — validate and enforce types/contracts on external input at entry points (API payloads, URL params, form input, auth context) |
| S4 | **AuthZ on client only** — UI gating is not authorization; sensitive actions must be enforced server-side |
| S5 | **Output safety** — user-controlled content not rendered or executed unsafely (HTML, scripts, file paths, redirects) |
| S6 | **URL / link targets** — dynamic links and redirects validated; block executable or unexpected schemes |
| S7 | **Sensitive logging** — tokens, credentials, or PII not logged to console, files, or error reports |
| S8 | **Dependency surface** — new dependencies justified; flag unnecessary expansion of attack surface |

**Security severity (map to SKILL.md §11):** **major** — exploitable injection, exposed secrets, client-only auth for protected actions · **medium** — unsafe patterns with unclear sanitization, weak validation at boundaries, unjustified new deps · **minor** — defense-in-depth nits, logging hygiene

---

## 2. Foreign or out-of-place content

Scan **changed files from §3**, with extra attention to **documentation and config**.

Look for content that does not belong in the repo — pasted build output, minified bundles, unrelated generated code, or binary blobs.

| Signal | Likely problem |
|--------|----------------|
| Very long single-line blocks in docs | Minified or generated output pasted inline |
| Build-tool or bundler signatures in source/docs | Artifact committed instead of source |
| Imports/paths from other projects or stale package names | Unrelated or copied code |
| Entire modules pasted into docs | Should live in source files, not markdown |
| Base64 blobs or binary escapes | Encoded payload or binary leak |
| Binary file additions in a text-only area | Accidental commit of non-source artifact |

**Report:** **major** if executable or large artifact committed · **medium** if sloppy paste that should move to source · **minor** if small snippet with wrong path but harmless. List file, location, and recommended action (delete, move to source, replace with link).

When a [LANGUAGE/](LANGUAGE/) companion defines automated dependency or supply-chain scans, run those per that file.
