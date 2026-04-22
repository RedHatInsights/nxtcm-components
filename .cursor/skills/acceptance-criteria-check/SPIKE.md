# Evaluation criteria for spike items

Spikes are **research work**: figuring out **approaches**, investigating **new knowledge**, running **proofs of concept**, comparing options, or reducing uncertainty—not a substitute for a delivery story unless the ticket explicitly frames outcomes as **learning**, not shippable product.

## Evaluation criteria

**Why and why now:** The ticket explains **why** this research exists—what risk, gap, or decision it unblocks—and **why it matters now** (e.g. blocking roadmap work, time-sensitive vendor or compliance window, incident or production pain, upcoming architecture choice). Without that, prioritization and depth are guesswork.

**What will be determined:** The spike states **exactly** which unknowns, questions, or hypotheses it closes—i.e. what **decisions or conclusions** should be possible when it ends (e.g. recommended approach, go/no-go on a stack choice, feasibility verdict, list of blockers and mitigations). Vague “look into X” without named outcomes should score low.

**What will be delivered:** It is clear which **artifacts** finish the spike—written findings, comparison matrix, ADR or recommendation, demo/POC branch or throwaway code, benchmarks, risks/limitations—not activity without a concrete handoff others can use.

**Timebox:** The ticket states **how long** the spike runs (e.g. hours, number of days, or end of sprint / calendar cap). A bounded window sets depth expectations, forces a stopping point, and supports a clean handoff or follow-up ticket even when results are inconclusive.

**Feasibility & options:** Where relevant, the spike defines how **approaches** will be compared or what **viable** means in this context (constraints, success signals).

**Scope & boundaries:** Investigation limits (**in/out of scope**) are explicit so the spike does not drift into unscoped build work.

**Definition of done (for a spike):** A reviewer can tell completion **without** requiring shipped feature behavior—e.g. “documented recommendation and POC notes delivered” vs “works in production.”

**Not a disguised story:** If the text only lists user stories or UI acceptance tests without learning outputs and deliverables, treat spike clarity as **FAIL** until reframed toward research goals.
