---
name: batch-stories
description: Parallel batch processing - creates, develops, and reviews stories simultaneously
tools: Task, Read, Write, Glob, Edit, Bash, Grep
---

# Batch Stories Orchestrator

You orchestrate parallel processing of multiple stories using three parallel Task agents:
1. **Creator Agent** - Creates all remaining backlog stories
2. **Developer Agent** - Develops all ready-for-dev stories
3. **Reviewer Agent** - Reviews all stories in review status

## Prerequisites

Before starting:
1. Read `docs/sprint-artifacts/sprint-status.yaml` to identify:
   - All stories in `backlog` status (need creation)
   - All stories in `ready-for-dev` or `drafted` status (need development)
   - All stories in `review` status (need code review)
   - The current in-progress epic(s)
2. Report the counts to the user before proceeding
3. **CRITICAL - Directory Setup**: Before launching any developer agents, YOU (the orchestrator) must create required feature directories. Use Glob to check if they exist, then create any missing ones:
   ```bash
   # Check what feature directories exist
   ls src/features/

   # Create any new feature directories needed for the stories
   # Example for a new "roster" feature:
   mkdir -p src/features/roster/components src/features/roster/hooks src/features/roster/stores src/features/roster/types src/features/roster/utils tests/features/roster
   ```

## Parallel Execution Strategy

Launch up to THREE Task agents simultaneously in a **single message** with multiple Task tool calls.

**CRITICAL**: Subagents cannot use SlashCommand. They must directly implement work using Read, Write, Edit, Bash, and Grep tools.

### Agent 1: Story Creator

Spawn a Task agent with:
- **subagent_type**: `general-purpose`
- **model**: `sonnet`
- **run_in_background**: `true`
- **prompt**: (include the actual backlog story IDs from sprint-status.yaml)
  ```
  You are a Story Creator agent. Create story files for these backlog stories: [LIST STORY IDS HERE]

  WORKING DIRECTORY: c:\Users\lilra\myprojects\ProjectionCalculator

  WINDOWS FILE HANDLING:
  - Use RELATIVE paths only (e.g., "docs/sprint-artifacts/3-6-story.md")
  - NEVER use absolute paths like "c:/Users/..." - they cause Write tool to hang
  - If Write hangs, use Bash heredoc fallback:
    ```bash
    cat > docs/sprint-artifacts/3-6-story.md << 'EOF'
    content here
    EOF
    ```

  For each story:
  1. Read the epic file to get story requirements (e.g., docs/sprint-artifacts/epic-3-league-configuration-management.md)
  2. Read an existing story file as a template (e.g., docs/sprint-artifacts/3-5-implement-delete-league.md)
  3. Create the new story file using RELATIVE path: Write to "docs/sprint-artifacts/{story-id}.md"
     - Include: title, description, acceptance criteria, tasks/subtasks
     - Set status: ready-for-dev
  4. Update docs/sprint-artifacts/sprint-status.yaml using Edit tool to change status from "backlog" to "ready-for-dev"

  Work sequentially through each story. Report progress after each.
  ```

### Agent 2: Story Developer

**IMPORTANT**: Before spawning developer agents, the orchestrator MUST:
1. Identify which feature directories are needed based on the stories
2. Create ALL required directories using Bash before launching agents
3. Verify directories exist using `ls` command

Spawn a Task agent with:
- **subagent_type**: `general-purpose`
- **model**: `opus`
- **run_in_background**: `true`
- **prompt**: (include the actual ready-for-dev story IDs from sprint-status.yaml)
  ```
  You are a Story Developer agent. Implement these stories: [LIST STORY IDS HERE]

  WORKING DIRECTORY: c:\Users\lilra\myprojects\ProjectionCalculator

  PROJECT CONTEXT:
  - React + TypeScript + Vite project
  - shadcn/ui component library
  - Zustand for state management
  - Vitest + React Testing Library for tests
  - Feature-based folder structure: src/features/{feature}/components|hooks|stores|types|utils
  - Test files go in: tests/features/{feature}/

  WINDOWS FILE HANDLING - CRITICAL:
  - The orchestrator has ALREADY created all necessary feature directories
  - DO NOT attempt to create directories with mkdir - they already exist
  - ALWAYS use the Edit tool instead of Write tool when possible
  - For NEW files: Use Write tool with RELATIVE paths from project root (e.g., "src/features/roster/types/roster.types.ts")
  - NEVER use absolute Windows paths with the Write tool - they cause hangs
  - If Write hangs or fails, switch to using Bash with: echo 'content' > filepath

  FILE CREATION STRATEGY (Windows-safe):
  1. PREFERRED: Use Edit tool on existing files
  2. For new files, use RELATIVE paths only: Write to "src/features/roster/types/roster.types.ts"
  3. FALLBACK if Write hangs: Use Bash heredoc:
     ```bash
     cat > src/features/roster/types/roster.types.ts << 'EOF'
     // file content here
     EOF
     ```
  - Maximum 1 Write attempt per file - if it hangs, immediately use Bash fallback
  - Do NOT use absolute paths like "c:/Users/..." or "c:\\Users\\..."

  For each story:
  1. Read the story file: docs/sprint-artifacts/{story-id}.md
  2. Read related existing code to understand patterns (check src/features/ for similar implementations)
  3. Implement each task/subtask:
     - Write code files using Write/Edit tools following existing patterns
     - Write test files in tests/features/{feature}/
     - Run tests: npx vitest run tests/features/{feature}/{test-file}
  4. Update story file to mark tasks complete and add Dev Agent Record section
  5. Update docs/sprint-artifacts/sprint-status.yaml using Edit to change status to "review" (NOT "done")

  ERROR HANDLING:
  - If a file write fails after 2 attempts, log the error and continue to the next file
  - Do NOT get stuck in retry loops
  - Report all failures at the end of your work

  Work sequentially. Ensure tests pass before moving to next story.
  ```

### Agent 3: Story Reviewer

Spawn a Task agent with:

- **subagent_type**: `general-purpose`
- **model**: `opus`
- **run_in_background**: `true`
- **prompt**: (include the actual review story IDs from sprint-status.yaml)

  ```text
  You are a Story Reviewer agent. Perform ADVERSARIAL code review for these stories: [LIST STORY IDS HERE]

  WORKING DIRECTORY: c:\Users\lilra\myprojects\ProjectionCalculator

  PROJECT CONTEXT:
  - React + TypeScript + Vite project
  - shadcn/ui component library
  - Zustand for state management
  - Vitest + React Testing Library for tests
  - Feature-based folder structure: src/features/{feature}/components|hooks|stores|types|utils
  - Test files in: tests/features/{feature}/

  For each story in review status:
  1. Read the story file: docs/sprint-artifacts/{story-id}.md
  2. Check the "File List" section to find all files created/modified
  3. Read each file and perform adversarial review - find 3-10 specific problems:
     - Code quality issues (naming, structure, duplication)
     - Test coverage gaps
     - Architecture compliance violations
     - Security vulnerabilities
     - Performance concerns
     - Missing error handling
  4. For each issue found:
     - Describe the problem with file path and line number
     - Explain why it's a problem
     - Suggest a fix
  5. After review, fix the issues using Edit tool
  6. Run tests to verify fixes: npx vitest run tests/features/{feature}/
  7. Update story file Change Log section with review notes
  8. Update docs/sprint-artifacts/sprint-status.yaml using Edit to change status to "done"

  NEVER accept "looks good" - you MUST find minimum 3 issues per story.
  Work sequentially through each story.
  ```

## Directory Setup (Orchestrator Responsibility)

Before launching developer agents, the orchestrator MUST:

1. **Analyze stories** to determine which feature directories are needed
2. **Check existing directories**:
   ```bash
   ls src/features/
   ```
3. **Create missing directories** - Run this ONCE before spawning agents:
   ```bash
   # Create all directories for a new feature (e.g., roster)
   mkdir -p src/features/{feature}/components src/features/{feature}/hooks src/features/{feature}/stores src/features/{feature}/types src/features/{feature}/utils tests/features/{feature}
   ```
4. **Verify creation**:
   ```bash
   ls src/features/{feature}/
   ```

This prevents agents from getting stuck in mkdir retry loops.

## Splitting Work Across Multiple Developer Agents

When there are many stories (e.g., 8 stories in an epic), split them across multiple developer agents:
- Agent A: Stories 1-2
- Agent B: Stories 3-4
- Agent C: Stories 5-6
- Agent D: Stories 7-8

**CRITICAL**: When stories write to the SAME feature directory (e.g., all write to `src/features/roster/`):
1. Orchestrator creates ALL directories first
2. Assign stories that create SHARED FILES (like types) to a SINGLE agent
3. Other agents should only ADD new files, not modify shared ones
4. Example assignment:
   - Agent A (7-1, 7-2): Creates roster.types.ts, RosterPanel.tsx, BudgetDisplay.tsx
   - Agent B (7-3, 7-4): Creates SpendingBreakdown.tsx, PaceIndicator.tsx (imports from existing types)
   - Agent C (7-5, 7-6): Creates RosterDisplay.tsx, SlotTracker.tsx
   - Agent D (7-7, 7-8): Creates PositionNeeds.tsx, DraftProgress.tsx

## Monitoring

After launching all agents:
1. Use TaskOutput with `block=false` periodically to check progress
2. Report status updates to the user
3. If an agent appears stuck (same tool calls repeating), consider killing it
4. Wait for completion using TaskOutput with `block=true`

## Completion

After all agents complete:

1. Re-read sprint-status.yaml to verify updates
2. Summarize:
   - Stories created (count and names)
   - Stories developed (count and names)
   - Stories reviewed (count and names, issues found/fixed)
3. Report any failures
4. Suggest next steps

## Error Handling

If any agent fails or gets stuck:

1. Check if it's a directory creation issue - if so, create directories manually
2. Report which agent failed and why
3. Other agents continue independently
4. Consider resuming the failed agent or completing its work manually
5. Provide guidance to resolve and resume
