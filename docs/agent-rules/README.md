# agent rules

task-specific rulebooks for AI coding agents. each file covers one type of work and provides the constraints, patterns, and examples an agent needs to do that work correctly in this repo.

## how agents use these

the [task routing table](../../AGENTS.md#task-routing) in the root AGENTS.md maps task types to specific rule files. agents load the relevant rulebook before starting work.

## files

| file | covers |
|------|--------|
| [new-component.md](new-component.md) | creating a new component (file structure, props, story, spec, exports) |
| [playwright-ct.md](playwright-ct.md) | writing Playwright component tests (selectors, spec-helpers, what to test) |
| [storybook.md](storybook.md) | writing Storybook stories (CSF3, title conventions, states) |
| [ci-workflows.md](ci-workflows.md) | modifying GitHub Actions workflows (pinning, CT triage pipeline, permissions) |
| [typescript.md](typescript.md) | TypeScript conventions (Resource<T>, wizard types, generics, path aliases) |

## adding a new rulebook

1. create a markdown file in this directory
2. add it to the task routing table in root AGENTS.md
3. keep it focused on one task type — don't mix concerns
4. include concrete examples from this repo, not generic advice
5. prefer constraints ("never do X") over suggestions ("consider doing X")
