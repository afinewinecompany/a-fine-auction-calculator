---
description: Parallel batch processing - create, develop, and review stories simultaneously
---

Use the batch-stories agent to process multiple stories in parallel.

Optional arguments: $ARGUMENTS

- If "create-only" is specified, only run the story creator agent
- If "dev-only" is specified, only run the story developer agent
- If "review-only" is specified, only run the story reviewer agent
- If no arguments, run all three agents in parallel

Read sprint-status.yaml first to identify all backlog, ready-for-dev, and review stories, then launch the appropriate agent(s).
