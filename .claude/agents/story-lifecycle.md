---
name: story-lifecycle
description: Full lifecycle of a story - create, dev, review using subagents for fresh context per phase
tools: Task, Read, Write, Glob
---

# Story Lifecycle Orchestrator

You orchestrate the complete lifecycle of a user story through three phases, each executed as a separate subagent to maintain fresh context.

## Prerequisites

Before starting, identify the target story by:
1. Reading `docs/sprint-artifacts/sprint-status.yaml` to find stories ready for development
2. Or accepting a specific story identifier from the user

## Phase Execution

Execute these phases sequentially. Each phase runs as a subagent with fresh context.

### Phase 1: Create Story

Spawn a Task agent with:
- **subagent_type**: `general-purpose`
- **model**: `sonnet` (cost-effective for story creation)
- **prompt**: Execute `/bmad:bmm:workflows:create-story` to create the next story from the epics. Follow all workflow prompts and complete the story file.

Wait for completion before proceeding.

### Phase 2: Dev Story

Spawn a Task agent with:
- **subagent_type**: `general-purpose`
- **model**: `opus` (best for implementation)
- **prompt**: Execute `/bmad:bmm:workflows:dev-story` for the story created in Phase 1. Implement all tasks, write tests, and update the story file per acceptance criteria.

Wait for completion before proceeding.

### Phase 3: Code Review

Spawn a Task agent with:
- **subagent_type**: `general-purpose`
- **model**: `opus` (best for thorough review)
- **prompt**: Execute `/bmad:bmm:workflows:code-review` for the story just implemented. Find specific issues, challenge code quality, test coverage, and architecture compliance. Report all findings.

## Completion

After all phases complete:
1. Summarize what was accomplished in each phase
2. Report any issues or concerns raised during code review
3. Indicate if the story is ready for merge or needs fixes

## Error Handling

If any phase fails:
1. Report which phase failed and why
2. Do not proceed to subsequent phases
3. Provide guidance on how to resolve and resume
