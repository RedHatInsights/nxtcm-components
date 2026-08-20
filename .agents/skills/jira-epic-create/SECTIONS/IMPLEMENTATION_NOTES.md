# Implementation notes section

Apply when drafting the **Implementation notes** registry section ([TEMPLATE.md](../TEMPLATE.md) § Section registry).

## Section metadata

| Field | Value |
|-------|-------|
| **Heading** | `## Implementation notes` |
| **Required** | no — omit entire section when nothing beyond Description and AC |
| **Discovery** | optional — partial technical context; user deferrals recorded as open bullets when known |
| **Breakdown trace** | `IN` (API/repo boundaries, release coordination) |
| **Owns** | Hiccups, boundaries, repos/packages for implementers |
| **Does not own** | User story, AC restatement, full design spec |
| **Length target** | **0–8** bullets; omit section if empty |
| **Research feeds** | npm package name, types/props paths, CRD kinds, integration patterns, doc URLs |

Some good things to know about the **hiccups** someone may experience while implementing the epic — boundaries, coordination, and technical context.

**Style:** [WRITING.md](../WRITING.md) — brief bullets for implementers.

---

## Include when known

| Topic | Example content |
|-------|-----------------|
| Separation of concerns | Library owns UI; host owns routing, API clients, CRD creation |
| Auth / data boundary | Service account credentials scope all platform API calls |
| Integration pattern | Injected `Resource<T>` with `fetch` callbacks; no HTTP in library |
| Submit translation | Host implements `onSubmit` → hub CRDs |
| Existing backend | Provisioning after CRD creation — see **Out of scope** |
| Parity | Prerequisites in shell UI; wizard starts after gate |
| Release coordination | Pin npm package version between library publish and consumer |
| Epic dependencies | Related epic KEY owns X; this epic owns Y |
| **Repos / packages** | `@scope/package` in `repo` → `path/`; props in `types.ts` |
| **Parent / related Jira** | [<PROJECT>-100](https://<JIRA-SITE>/browse/<PROJECT>-100) — parent; coordinate with <PROJECT>-200 for npm publish |

Use bullet list. Technical names (npm, CRD kinds, paths) belong here — not in Description or AC.

---

## Do not

- Repeat Description or AC in technical terms
- Expand into full design spec or file-by-file plan
- Duplicate **Out of scope** exclusions
- Use as a second References table — weave links inline in bullets when helpful

---

## Section template

```markdown
## Implementation notes

- …
- …
```
