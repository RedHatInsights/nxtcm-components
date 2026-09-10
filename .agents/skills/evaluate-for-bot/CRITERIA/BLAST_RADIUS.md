# Blast radius — bot suitability

Apply when evaluating criterion slug **blast_radius** (this file).

## Criterion metadata

| Field | Value |
|-------|-------|
| **Slug** | `blast_radius` |
| **Definition** | Whether the repo suggests a **straightforward solution** with **fairly small blast radius** — localized files, clear entry point, bounded change. |
| **Weight hint** | **Large** or **unknown** radius with repo searched → caps holistic score at **3**. |

Requires [REPO.md](../REPO.md) research unless **ticket-only mode** ([DISCOVERY.md](../DISCOVERY.md)) — then infer cautiously from ticket text and note reduced confidence.

---

## What to look for

Use repo findings (`likely_files`, `blast_radius`, `implementation_notes`) from [REPO.md](../REPO.md).

| Signal | Small radius | Large radius |
|--------|--------------|--------------|
| **File count** | 1–2 primary files | Many packages or shared layers |
| **Change type** | Bug fix, copy, validation, isolated component | Refactor, migration, new subsystem |
| **Coupling** | Local state/UI | Shared hooks, global config, auth pipeline |
| **Tests** | Existing tests to extend | No tests in risky area |
| **Discoverability** | Ticket terms map cleanly to code | Search misses or multiple ambiguous matches |
| **Infra** | App code only | CI, Terraform, cross-service contracts |

---

## Scoring

Rate **blast radius only** from 1–5 (higher = **smaller/simpler** change path — better for bot success).

Map [REPO.md](../REPO.md) labels to criterion rating:

| `blast_radius` (repo) | Typical criterion rating |
|-----------------------|--------------------------|
| `small` | **4–5** (5 when path is obvious and tested) |
| `medium` | **3–4** (4 when well bounded) |
| `large` | **1–2** |
| `unknown` | **1–3** (3 only if ticket strongly implies locality but repo was not searched — ticket-only mode) |

### Weak vs strong

| Rating | Signals |
|--------|---------|
| **5** | Single module; clear fix; tests present; bot path obvious (e.g. one component + test file). |
| **4** | Small feature in one feature folder; 2–4 files; existing patterns to copy. |
| **3** | Medium touch — shared utility + consumers, or new code following established pattern. |
| **2** | Cross-package change, missing anchors, or high-risk area without tests. |
| **1** | Repo-wide refactor, infra, or ticket does not map to codebase. |

### Calibration examples

| Rating | Example |
|--------|---------|
| **5** | Typo in i18n string file; off-by-one validation in one form component with CT nearby. |
| **4** | New prop on existing wizard step; update component + one test file. |
| **3** | New API hook used in two screens; shared types file updated. |
| **2** | Change auth middleware affecting all routes. |
| **1** | “Replace state management library” or greenfield with no repo match. |

---

## Ticket-only mode

When repo was **not** searched:

- Do not rate **5**.
- Rate from ticket cues (named files, “change X in component Y”) and set `repo_confidence: none`.
- Say **repo not searched** in report blast-radius line.

---

## Reporting

When this criterion rates **≤ 3** due to large/unknown blast radius, include in `blockers` ([REPORT.md](../REPORT.md)):
- ✓ "Large blast radius: touches auth middleware used by all routes"
- ✓ "Unknown: ticket does not map to repo after search"
- ✗ "blast radius concerns" (too vague)

---

## Related

Repo search steps: [REPO.md](../REPO.md).
