# Step 1: UX Design Workflow Initialization

## MANDATORY EXECUTION RULES (READ FIRST):

- 🛑 NEVER generate content without user input
- 🎨 FIGMA REQUIRED: You MUST verify Figma designs exist before generating frontend code

- 📖 CRITICAL: ALWAYS read the complete step file before taking any action - partial understanding leads to incomplete decisions
- 🔄 CRITICAL: When loading next step with 'C', ensure the entire file is read and understood before proceeding
- ✅ ALWAYS treat this as collaborative discovery between UX facilitator and stakeholder
- 📋 YOU ARE A UX FACILITATOR, not a content generator
- 💬 FOCUS on initialization and setup only - don't look ahead to future steps
- 🚪 DETECT existing workflow state and handle continuation properly

## EXECUTION PROTOCOLS:

- 🎯 Show your analysis before taking any action
- 💾 Initialize document and update frontmatter
- 📖 Set up frontmatter `stepsCompleted: [1]` before loading next step
- 🚫 FORBIDDEN to load next step until setup is complete

## CONTEXT BOUNDARIES:

- Variables from workflow.md are available in memory
- Previous context = what's in output document + frontmatter
- Don't assume knowledge from other steps
- Input document discovery happens in this step

## YOUR TASK:

Initialize the UX design workflow by detecting continuation state and setting up the design specification document.

## INITIALIZATION SEQUENCE:

### 1. Check for Existing Workflow

First, check if the output document already exists:

- Look for file at `{output_folder}/ux-design-specification.md`
- If exists, read the complete file including frontmatter
- If not exists, this is a fresh workflow

### 2. Handle Continuation (If Document Exists)

If the document exists and has frontmatter with `stepsCompleted`:

- **STOP here** and load `./step-01b-continue.md` immediately
- Do not proceed with any initialization tasks
- Let step-01b handle the continuation logic

### 3. Fresh Workflow Setup (If No Document)

If no document exists or no `stepsCompleted` in frontmatter:

#### A. Input Document Discovery

Discover and load context documents using smart discovery:

**PRD (Priority: Analysis → Main → Sharded → Whole):**

1. Check analysis folder: `{output_folder}/analysis/*prd*.md`
2. If no analysis files: Try main folder: `{output_folder}/*prd*.md`
3. If no main files: Check for sharded PRD folder: `{output_folder}/*prd*/**/*.md`
4. If sharded folder exists: Load EVERY file in that folder completely for UX context
5. Add discovered files to `inputDocuments` frontmatter

**Product Brief (Priority: Analysis → Main → Sharded → Whole):**

1. Check analysis folder: `{output_folder}/analysis/*brief*.md`
2. If no analysis files: Try main folder: `{output_folder}/*brief*.md`
3. If no main files: Check for sharded brief folder: `{output_folder}/*brief*/**/*.md`
4. If sharded folder exists: Load EVERY file in that folder completely
5. Add discovered files to `inputDocuments` frontmatter

**Research Documents (Priority: Analysis → Main → Sharded → Whole):**

1. Check analysis folder: `{output_folder}/analysis/research/*research*.md`
2. If no analysis files: Try main folder: `{output_folder}/*research*.md`
3. If no main files: Check for sharded research folder: `{output_folder}/*research*/**/*.md`
4. Load useful research files completely
5. Add discovered files to `inputDocuments` frontmatter

**Other Context (Priority: Analysis → Main → Sharded):**

- Epics: `{output_folder}/analysis/*epic*.md` or `{output_folder}/*epic*.md` or `{output_folder}/*epic*/**/*.md`
- Brainstorming: `{output_folder}/analysis/brainstorming/*brainstorming*.md` or `{output_folder}/*brainstorming*.md`

**Figma Design Files:**

- Check for existing Figma analysis: `{output_folder}/figma-design-*.md`
- If found, load to understand existing design decisions

**Loading Rules:**

- Load ALL discovered files completely (no offset/limit)
- For sharded folders, load ALL files to get complete picture
- Track all successfully loaded files in frontmatter `inputDocuments` array

#### A.5 Figma Design Verification (CRITICAL)

**MANDATORY**: Before proceeding to code generation steps, verify Figma designs:

1. **Check for Figma MCP tools**: Verify `get_figma_data` and `download_figma_images` are available
2. **Ask user for Figma file**: "Do you have a Figma file for this project? Please provide the Figma URL or file key."
3. **If Figma exists**:
   - Use `get_figma_data` to fetch the design
   - Extract: component hierarchy, color tokens, typography, spacing, interaction states
   - Save analysis to `{output_folder}/figma-design-analysis.md`
   - Save design tokens to `{output_folder}/figma-design-tokens.md`
4. **If NO Figma exists**:
   - Inform user: "Figma design is REQUIRED before frontend implementation"
   - Offer to help define design requirements for handoff to designer
   - Mark `figmaStatus: 'missing'` in frontmatter
   - Can continue with UX specification, but BLOCK code generation until Figma is provided

#### B. Create Initial Document

Copy the template from `{installed_path}/ux-design-template.md` to `{output_folder}/ux-design-specification.md`
Initialize frontmatter with:

```yaml
---
stepsCompleted: []
inputDocuments: []
workflowType: 'ux-design'
lastStep: 0
project_name: '{{project_name}}'
user_name: '{{user_name}}'
date: '{{date}}'
figmaStatus: 'pending'  # pending | verified | missing
figmaFileKey: ''        # Figma file key if provided
figmaUrl: ''            # Full Figma URL if provided
---
```

#### C. Complete Initialization and Report

Complete setup and report to user:

**Document Setup:**

- Created: `{output_folder}/ux-design-specification.md` from template
- Initialized frontmatter with workflow state

**Input Documents Discovered:**
Report what was found:
"Welcome {{user_name}}! I've set up your UX design workspace for {{project_name}}.

**Documents Found:**

- PRD: {number of PRD files loaded or "None found"}
- Product brief: {number of brief files loaded or "None found"}
- Other context: {number of other files loaded or "None found"}

**Files loaded:** {list of specific file names or "No additional documents found"}

**Figma Design Status:**

- Status: {figmaStatus - pending/verified/missing}
- Figma URL: {figmaUrl or "Not provided"}

⚠️ **IMPORTANT**: Before we can generate any frontend code, you MUST provide a Figma design file.
Do you have a Figma file for this project? Please provide the Figma URL or file key.

If no Figma design exists yet, I can help you define design requirements to hand off to a designer.

Do you have any other documents you'd like me to include, or shall we continue to the next step?

[F] Provide Figma file URL/key
[C] Continue to UX discovery (Note: code generation will be blocked without Figma)"

## SUCCESS METRICS:

✅ Existing workflow detected and handed off to step-01b correctly
✅ Fresh workflow initialized with template and frontmatter
✅ Input documents discovered and loaded using sharded-first logic
✅ All discovered files tracked in frontmatter `inputDocuments`
✅ User confirmed document setup and can proceed
✅ Figma status checked and user prompted for Figma file
✅ If Figma provided: design data fetched and analyzed using MCP tools

## FAILURE MODES:

❌ Proceeding with fresh initialization when existing workflow exists
❌ Not updating frontmatter with discovered input documents
❌ Creating document without proper template
❌ Not checking sharded folders first before whole files
❌ Not reporting what documents were found to user
❌ **FIGMA CRITICAL**: Generating frontend code without verifying Figma designs exist
❌ **FIGMA CRITICAL**: Not prompting user for Figma file URL/key
❌ **FIGMA CRITICAL**: Not using get_figma_data MCP tool when Figma URL is provided

❌ **CRITICAL**: Reading only partial step file - leads to incomplete understanding and poor decisions
❌ **CRITICAL**: Proceeding with 'C' without fully reading and understanding the next step file
❌ **CRITICAL**: Making decisions without complete understanding of step requirements and protocols

## NEXT STEP:

**[F] Figma File Provided:**
When user provides Figma URL/key:

1. Use `get_figma_data` MCP tool to fetch the design
2. Parse and extract: component hierarchy, color tokens, typography, spacing, interaction states
3. Save to `{output_folder}/figma-design-analysis.md` and `{output_folder}/figma-design-tokens.md`
4. Update frontmatter: `figmaStatus: 'verified'`, `figmaUrl`, `figmaFileKey`
5. Report what was extracted and show [C] option

**[C] Continue:**
After user selects [C] to continue, load `./step-02-discovery.md` to begin the UX discovery phase.

Remember: Do NOT proceed to step-02 until user explicitly selects [C] to continue!

⚠️ **FIGMA ENFORCEMENT**: If `figmaStatus` is still 'pending' or 'missing' when reaching code generation steps later in the workflow, you MUST stop and request Figma designs before generating any frontend component code.
