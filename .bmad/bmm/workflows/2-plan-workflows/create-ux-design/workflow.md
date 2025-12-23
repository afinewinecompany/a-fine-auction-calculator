---
name: create-ux-design
description: Work with a peer UX Design expert to plan your applications UX patterns, look and feel.
web_bundle: true
figma_required: true
---

# Create UX Design Workflow

**Goal:** Create comprehensive UX design specifications through collaborative visual exploration and informed decision-making where you act as a UX facilitator working with a product stakeholder.

---

## FIGMA MCP INTEGRATION (CRITICAL)

**You MUST retrieve UI structure, components, spacing, and interaction patterns from Figma using MCP before generating frontend code.**

### Required Figma Tools

- `get_figma_data` - Retrieve complete design structure, components, and styles from Figma file
- `download_figma_images` - Download icons, illustrations, and image assets

### Figma Workflow

1. **Check for Figma Designs**: At workflow start, ask user for Figma file URL/key
2. **Fetch Design Data**: Use `get_figma_data` to retrieve:
   - Component hierarchy and structure
   - Color palette and design tokens
   - Typography scale and font specifications
   - Spacing system and layout grids
   - Interactive states and component variants
3. **No Figma? STOP**: If no Figma artifact exists:
   - Inform user that Figma design is REQUIRED before implementation
   - Offer to help define design requirements for handoff to designer
   - Do NOT proceed with frontend code generation
4. **Document Figma Analysis**: Save extracted design tokens to `{output_folder}/figma-design-tokens.md`
5. **Asset Extraction**: Use `download_figma_images` for all icons, illustrations, images

---

## WORKFLOW ARCHITECTURE

This uses **micro-file architecture** for disciplined execution:

- Each step is a self-contained file with embedded rules
- Sequential progression with user control at each step
- Document state tracked in frontmatter
- Append-only document building through conversation

---

## INITIALIZATION

### Configuration Loading

Load config from `{project-root}/.bmad/bmm/config.yaml` and resolve:

- `project_name`, `output_folder`, `user_name`
- `communication_language`, `document_output_language`, `user_skill_level`
- `date` as system-generated current datetime

### Paths

- `installed_path` = `{project-root}/.bmad/bmm/workflows/2-plan-workflows/create-ux-design`
- `template_path` = `{installed_path}/ux-design-template.md`
- `default_output_file` = `{output_folder}/ux-design-specification.md`

### Output Files

- Color themes: `{output_folder}/ux-color-themes.html`
- Design directions: `{output_folder}/ux-design-directions.html`
- Figma design tokens: `{output_folder}/figma-design-tokens.md`
- Figma design analysis: `{output_folder}/figma-design-analysis.md`

### Input Document Discovery

Discover context documents for UX context (Priority: Analysis folder first, then main folder, then sharded):

- PRD: `{output_folder}/analysis/*prd*.md` or `{output_folder}/*prd*.md` or `{output_folder}/*prd*/**/*.md`
- Product brief: `{output_folder}/analysis/*brief*.md` or `{output_folder}/*brief*.md` or `{output_folder}/*brief*/**/*.md`
- Epics: `{output_folder}/analysis/*epic*.md` or `{output_folder}/*epic*.md` or `{output_folder}/*epic*/**/*.md`
- Research: `{output_folder}/analysis/research/*research*.md` or `{output_folder}/*research*.md` or `{output_folder}/*research*/**/*.md`
- Brainstorming: `{output_folder}/analysis/brainstorming/*brainstorming*.md` or `{output_folder}/*brainstorming*.md`
- **Figma**: Check for existing `{output_folder}/figma-design-*.md` files

---

## EXECUTION

Load and execute `steps/step-01-init.md` to begin the UX design workflow.

**IMPORTANT**: Before proceeding past step-01, verify Figma designs are available or request them.
