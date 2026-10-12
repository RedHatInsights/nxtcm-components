# Claude Code skills

These directories are copies of `.agents/skills/` so Claude Code can load them. Claude Code discovers `.claude/skills/<name>/SKILL.md` and does not read `.agents/skills/`.

`.agents/skills/<name>/SKILL.md` is the canonical copy. The skills here are:

- `verify-tests`
- `pr-release-agent`
- `stryker-mutation-test`

Any edit to a skill has to be applied in both places:

- `.agents/skills/<name>/SKILL.md`
- `.claude/skills/<name>/SKILL.md`

When Claude Code loads `.agents/skills/` itself, delete `.claude/skills/` so the same skill is not registered twice.
