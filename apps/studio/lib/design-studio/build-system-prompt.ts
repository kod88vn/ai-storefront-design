import type { OrchestratorContext } from "@/lib/types";

import type { McpToolDefinition } from "./mcp-client";
import type { LoadedSkill } from "./skill-loader";

interface BuildPromptParams {
  context: OrchestratorContext;
  skills: LoadedSkill[];
  mcpTools: McpToolDefinition[];
  preComputedTokens: string;
  visionFailed: boolean;
}

export function buildSystemPrompt({
  context,
  skills,
  mcpTools,
  preComputedTokens,
  visionFailed,
}: BuildPromptParams): string {
  const { planFeedback } = context;

  let resumeInstruction = "";
  if (planFeedback?.approved === true) {
    const prev = planFeedback.previousPlan;
    const prevDetail = prev
      ? [
          `"${prev.description}"`,
          `Layout: ${prev.layoutProposal}`,
          `Color: ${prev.colorProposal}`,
          prev.navStyleProposal ? `NavStyle: ${prev.navStyleProposal}` : "",
          prev.colorSchemeProposal
            ? `ColorScheme: ${prev.colorSchemeProposal}`
            : "",
        ]
          .filter(Boolean)
          .join(", ")
      : "";

    resumeInstruction = [
      "\n\n---",
      "**The user has APPROVED your plan.** Proceed with Phase 3 of the Planner Skill.",
      prevDetail ? `Previously proposed: ${prevDetail}.` : "",
      "Call apply_config_update now with all computed values. Do NOT call plan_feedback again.",
    ]
      .filter(Boolean)
      .join("\n");
  } else if (planFeedback?.approved === false) {
    resumeInstruction = [
      "\n\n---",
      `**The user rejected the plan.** Feedback: "${planFeedback.modifications ?? "no details given"}".`,
      "Revise your proposal and call plan_feedback again. Do NOT call apply_config_update yet.",
    ].join("\n");
  }

  const configSummary = [
    `hero: ${context.currentConfig.hero.layout} layout, title="${context.currentConfig.hero.title}"`,
    `theme: primary=${context.currentConfig.theme.primaryColor}, secondary=${context.currentConfig.theme.secondaryColor}, radius=${context.currentConfig.theme.borderRadius}, font=${context.currentConfig.theme.fontStyle ?? "modern-sans"}, nav=${context.currentConfig.theme.navStyle ?? "bordered"}, scheme=${context.currentConfig.theme.colorScheme ?? "light"}`,
    `grid: ${context.currentConfig.productGrid.columns} columns`,
  ].join(" | ");

  const plannerSkill = skills.find((skill) => skill.name === "planner");
  const supportingSkills = skills.filter((skill) => skill.name !== "planner");

  const supportingSkillsSection =
    supportingSkills.length > 0
      ? `## Skill References\n\n${supportingSkills.map((skill) => `---\n\n${skill.content}`).join("\n\n")}`
      : "";

  const mcpToolDescriptions = mcpTools
    .map(
      (tool) =>
        `**${tool.name}**: ${tool.description}\n  Input schema: ${JSON.stringify(tool.inputSchema)}`,
    )
    .join("\n\n");

  const preComputedSection = preComputedTokens
    ? `## Pre-Computed Design Tokens (from uploaded image)\n\n**Image already analyzed — do NOT call \`analyze_vision_input\` or \`generate_theme\` MCP tools for Phase 1.**\nUse these extracted values directly when calling \`plan_feedback\` and \`apply_config_update\`. These are exact pixel samples from the uploaded screenshot — use them verbatim.\n\n${preComputedTokens}\n\nSkip Phase 1 entirely and proceed to Phase 2 (plan_feedback) using the tokens above.\n\n`
    : visionFailed
      ? `## Vision Analysis Failed\n\nThe uploaded image could not be analyzed (model error or invalid response). Treat this as a **text-only request** — infer design direction from the user's goal text alone. DO NOT reference any pre-computed color tokens.\n\n`
      : "";

  return `You are an AI storefront design agent. Redesign the storefront based on the user's goal.

When writing plan_feedback descriptions, explain the *why* — e.g. "dark palette matches the luxury feel in the uploaded image" or "editorial serif suits the fashion category". Users need reasoning, not just a list of changes.

  If the user goal includes a "Hard directives" block, treat those directives as strict constraints and make the output visibly different based on those choices.

${preComputedSection}## Workflow

${plannerSkill ? plannerSkill.content : "1. Call plan_feedback first. 2. After approval, call apply_config_update."}

${supportingSkillsSection}

## MCP Tools

${mcpToolDescriptions}

## Current Config

${configSummary}${resumeInstruction}`;
}
