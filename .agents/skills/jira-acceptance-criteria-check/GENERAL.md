# General — good description

Cross-type quality bar for the **ticket description** (context outside the acceptance criteria list). Apply before type-specific rules in the rubric file for `classified_type` under [JIRA_TYPE/](JIRA_TYPE/README.md).

A strong description lets reviewers and implementers understand the work **without inferring intent from AC alone**.

---

## WHAT

The description states **what** is changing or being done at a high level:

- The outcome, feature, fix, or deliverable in plain language
- Enough scope context that the team knows **what is in** the ticket (not a detailed spec — that can live in AC or linked docs)

**Weak:** title-only ticket, vague “improve X,” or AC with no surrounding context.

**Strong:** a short narrative or bullets that name the work area and the intended change so someone new to the ticket grasps the ask in one read.

---

## WHY

The description states **why** this work is requested:

- User pain, business need, bug impact, dependency, compliance, or other driver
- Enough motivation that prioritization and tradeoffs make sense

**Weak:** no problem statement; only a task list or implementation notes with no reason.

**Strong:** the reader can answer “why are we doing this?” without opening Slack or the epic.

---

## How to use in scoring

When judging description quality (see [SCORING.md](SCORING.md)):

| Dimension | Question |
|-----------|----------|
| **WHAT** | Is it clear what work this ticket covers? |
| **WHY** | Is it clear why this work matters? |

Score **Partial** when one dimension is thin or implied; **Missing** when absent; **Met** when both are clearly stated in the description.


