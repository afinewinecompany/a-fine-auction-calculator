---
description: Run full story lifecycle - create, dev, review using subagents
---

Use the story-lifecycle agent to orchestrate the complete lifecycle of a user story.

If a story identifier is provided: $ARGUMENTS
Otherwise, find the next story ready for development from docs/sprint-artifacts/sprint-status.yaml.

Execute all three phases (create-story, dev-story, code-review) using subagents with fresh context per phase.
