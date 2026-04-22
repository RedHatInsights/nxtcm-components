# Evaluation criteria for delivery items (usually stories and tasks)

Covers the **ticket description / context** (not only the numbered acceptance criteria list).

## Description and context (outside the AC list)

**Problem, motivation, and “why now”:** The description states **what** is changing at a high level and **why** it is requested—user pain, business need, bug impact, compliance trigger, or dependency. Reviewers and implementers should not have to infer the problem from AC alone.

**UI complexity and design references:** For **large or complex** user interface changes (new flows, new screens, major layout or interaction shifts), the ticket links to **mockups, prototypes, or design specs** (Figma, screenshots, design-system references, or similar). Trivial UI tweaks may not need them; ambiguous or broad UI work without a visual or spec anchor should be flagged.

## Acceptance criteria

**Testability:** Each criterion must be verifiably clear, allowing QA to create specific, objective pass/fail test cases.

**User-Centricity:** Focus on what the user experiences or achieves, not how the code is written.

**What vs how (outcomes vs implementation):** AC should specify **what** must be true when the work is accepted—observable outcomes, user-visible behavior, and constraints on experience. Avoid prescribing **how** to implement (specific layers, refactors, internal APIs, file moves) except where the ticket defines an explicit integration **contract**; then state that contract as the **what** at the boundary (e.g. what data the host provides), not arbitrary engineering steps.

**Clarity, conciseness & length:** One **verifiable outcome** per bullet, as a **tight line** (not a paragraph). Prefer precise pass/fail wording over narrative; keep background, rationale, and long edge-case notes in the story body or linked docs. Plain language so the list stays **scannable** for QA, product, and engineering.

**Grouping & nesting:** **Related** criteria can sit under one **parent** bullet so readers see structure (e.g. one flow: loading state → error/retry → success branches; or one integration contract with sub-bullets for each observable rule). Each nested line stays a **separate** testable outcome; nesting shows **relationship**, not one long run-on sentence.

**Completeness:** Cover functional requirements, edge cases, error handling (e.g., empty states, invalid input), and performance thresholds where relevant.

**Happy path vs error coverage:** AC should not stop at “it works when everything goes right.” For anything that can fail (validation, permissions, network/API errors, empty lists, timeouts), the AC should state the **expected user-visible outcome**—not only on success.

**Boundary Definition:** Clearly outline what is included in the scope to prevent scope creep.

**Functional Precision:** Does the AC specify UI interactions (e.g., "On click," "On hover," "Upon form submission")?

**Visual/Responsive Requirements:** Does it mention specific states (Active, Disabled, Loading) if applicable?

**Validation & Error Handling:** Does it define what happens when a user enters invalid data into a web form or if an API call fails? Are error messages, inline field feedback, and disabled/submit states specified where relevant?

**Navigation:** Is the "Success Path" clear (e.g., "User is redirected to the Dashboard")? If a step can fail, is it clear whether the user stays on the page, sees an error region, or gets a retry path?