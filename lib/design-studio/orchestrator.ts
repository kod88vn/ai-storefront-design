/**
 * Design Studio Orchestrator
 *
 * A generic, goal-driven async generator that:
 * 1. Loads SKILL.md definitions from disk
 * 2. Discovers MCP tools via JSON-RPC tools/list
 * 3. Builds a dynamic system prompt from skills + tools + current config
 * 4. Runs a manual multi-turn generateText loop (AI SDK v6)
 * 5. Intercepts plan_feedback calls for HITL (emits plan_description → stops stream)
 * 6. Intercepts apply_config_update calls to emit config_update events
 * 7. Streams OrchestratorEvents to the SSE endpoint
 *
 * No hardcoded algorithm — the AI decides which tools to call, in what order.
 */

import { generateText, tool } from "ai";
import { xai } from "@ai-sdk/xai";
import { z } from "zod";
import fs from "fs/promises";
import path from "path";

import type {
  OrchestratorContext,
  OrchestratorEvent,
  AgentStep,
} from "@/lib/types";

// ─── Config ───────────────────────────────────────────────────────────────────

const MAX_STEPS = 15;
const AI_MODEL = process.env.AI_MODEL ?? "grok-3";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return `http://localhost:${process.env.PORT ?? 3000}`;
}

function progress(message: string, agentStep?: AgentStep): OrchestratorEvent {
  return { type: "progress", message, agentStep };
}

function audit(
  method: string,
  params: Record<string, unknown>,
  result?: unknown,
): OrchestratorEvent {
  return { type: "audit", entry: { method, params, result } };
}

// ─── Skill loader (reads from lib/skills/**/SKILL.md) ─────────────────────────

interface LoadedSkill {
  name: string;
  content: string;
}

async function loadSkills(): Promise<LoadedSkill[]> {
  const skillsDir = path.join(process.cwd(), "lib/skills");
  const skills: LoadedSkill[] = [];
  try {
    const folders = await fs.readdir(skillsDir);
    for (const folder of folders) {
      try {
        const content = await fs.readFile(
          path.join(skillsDir, folder, "SKILL.md"),
          "utf-8",
        );
        skills.push({ name: folder, content });
      } catch {
        // SKILL.md missing for this folder — skip
      }
    }
  } catch {
    // lib/skills directory doesn't exist — safe to continue with empty skills
  }
  return skills;
}

function extractPurpose(content: string): string {
  const m = content.match(/##\s+Purpose\s*\n+([\s\S]*?)(?:\n\n|##)/m);
  return m ? m[1].trim().split("\n")[0] : "";
}

function formatSkillsForPrompt(skills: LoadedSkill[]): string {
  if (skills.length === 0) return "(no skills loaded)";
  return skills
    .map((s) => `- **${s.name}**: ${extractPurpose(s.content) || s.name}`)
    .join("\n");
}

// ─── MCP client ───────────────────────────────────────────────────────────────

let _mcpId = 0;

async function mcpCall(
  method: string,
  params: Record<string, unknown>,
): Promise<unknown> {
  const res = await fetch(`${getBaseUrl()}/api/mcp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ jsonrpc: "2.0", id: ++_mcpId, method, params }),
  });
  const json = await res.json();
  if (json.error) throw new Error(json.error.message);
  return json.result;
}

async function mcpListTools(): Promise<
  Array<{ name: string; description: string; inputSchema: unknown }>
> {
  const result = (await mcpCall("tools/list", {})) as {
    tools: Array<{ name: string; description: string; inputSchema: unknown }>;
  };
  return result.tools ?? [];
}

async function mcpToolCall(
  toolName: string,
  args: Record<string, unknown>,
): Promise<unknown> {
  const result = (await mcpCall("tools/call", {
    name: toolName,
    arguments: args,
  })) as { content: Array<{ type: string; text: string }> };
  const text = result.content?.[0]?.text;
  try {
    return text ? JSON.parse(text) : result;
  } catch {
    return text ?? result;
  }
}

// ─── Orchestrator generator ───────────────────────────────────────────────────

export async function* runOrchestrator(
  goal: string,
  context: OrchestratorContext,
): AsyncGenerator<OrchestratorEvent> {
  // ── 1. Load skills ──────────────────────────────────────────────────────────
  yield progress("Loading AI skills...", "thinking");

  const skills = await loadSkills();
  yield audit("skills/load", { loaded: skills.map((s) => s.name) });

  // ── 2. Discover MCP tools ───────────────────────────────────────────────────
  yield progress("Discovering tools via MCP...", "decomposing");

  const mcpTools = await mcpListTools();
  yield audit("tools/list", { tools: mcpTools.map((t) => t.name) });

  // ── 3. Build system prompt ──────────────────────────────────────────────────

  const toolDescriptions = mcpTools
    .map((t) => `**${t.name}**: ${t.description}`)
    .join("\n\n");

  const { planFeedback } = context;

  let resumeInstruction = "";
  if (planFeedback?.approved === true) {
    const prev = planFeedback.previousPlan;
    resumeInstruction = [
      "\n\n---",
      "The user has **APPROVED** your plan.",
      prev
        ? `You previously proposed: "${prev.description}" (Layout: ${prev.layoutProposal}, Color: ${prev.colorProposal}).`
        : "",
      "Proceed directly with execution NOW:",
      "1. Call the MCP tools (analyze_vision_input → generate_theme → plan_layout) to compute concrete values.",
      "2. Call apply_config_update with the final result.",
      "Do NOT call plan_feedback again.",
    ]
      .filter(Boolean)
      .join("\n");
  } else if (planFeedback?.approved === false) {
    resumeInstruction = [
      "\n\n---",
      `The user provided feedback: "${planFeedback.modifications ?? "no details given"}".`,
      "Revise your proposed plan to incorporate this feedback, then call plan_feedback again with the updated proposal.",
      "Do NOT execute MCP tools until the user approves.",
    ].join("\n");
  }

  const configSummary = [
    `hero: ${context.currentConfig.hero.layout} layout, title="${context.currentConfig.hero.title}"`,
    `theme: primary=${context.currentConfig.theme.primaryColor}, secondary=${context.currentConfig.theme.secondaryColor}, radius=${context.currentConfig.theme.borderRadius}`,
    `grid: ${context.currentConfig.productGrid.columns} columns`,
  ].join(" | ");

  const systemPrompt = `You are an AI storefront design agent. Redesign the storefront based on the goal.

Skills available: ${formatSkillsForPrompt(skills)}

MCP Tools: ${toolDescriptions}

Current config: ${configSummary}

Workflow:
1. Call \`plan_feedback\` first with a specific layout and color proposal (include hex). Do NOT call MCP tools yet.
2. After approval, call MCP tools then \`apply_config_update\` with concrete values.${resumeInstruction}`;

  // ── 4. Compose tools for the AI ─────────────────────────────────────────────
  //
  // Internal tools (plan_feedback, apply_config_update) are handled by the
  // orchestrator directly — NOT forwarded to MCP.
  // External tools wrap MCP calls.

  const tools = {
    plan_feedback: tool({
      description:
        "Present a proposed design plan to the user for HITL approval before executing any changes. Always call this first.",
      inputSchema: z.object({
        action: z.literal("request_feedback"),
        description: z
          .string()
          .describe("Human-readable summary of all proposed changes"),
        layoutProposal: z
          .string()
          .describe("Proposed hero layout variant (split/centered/minimal)"),
        colorProposal: z
          .string()
          .describe(
            'Proposed accent color with hex value, e.g. "Forest Green (#22c55e)"',
          ),
      }),
    }),

    apply_config_update: tool({
      description:
        "Apply the approved design changes to the StorefrontConfig. Call this after all MCP tools have returned with concrete values.",
      inputSchema: z.object({
        themeChanges: z
          .object({
            primaryColor: z.string().optional(),
            secondaryColor: z.string().optional(),
            borderRadius: z.enum(["none", "md", "full"]).optional(),
          })
          .optional(),
        heroChanges: z
          .object({
            layout: z.enum(["split", "centered", "minimal"]).optional(),
            title: z.string().optional(),
            subtitle: z.string().optional(),
          })
          .optional(),
        productGridColumns: z
          .union([z.literal(2), z.literal(3), z.literal(4)])
          .optional(),
        sectionOrder: z.array(z.string()).optional(),
      }),
    }),

    // MCP tool wrappers — descriptions sourced from MCP tools/list at runtime
    analyze_vision_input: tool({
      description:
        mcpTools.find((t) => t.name === "analyze_vision_input")?.description ??
        "Analyze a URL or description to extract design signals.",
      inputSchema: z.object({
        source: z
          .string()
          .describe("URL or plain-text description of the design to analyze"),
        extractionTargets: z.array(z.string()).optional(),
      }),
    }),

    generate_theme: tool({
      description:
        mcpTools.find((t) => t.name === "generate_theme")?.description ??
        "Generate a ThemeConfig from design signals.",
      inputSchema: z.object({
        dominantStyle: z.enum([
          "minimalist",
          "maximalist",
          "editorial",
          "clean",
        ]),
        primaryColors: z.array(z.string()).optional(),
        targetAesthetic: z.string().optional(),
      }),
    }),

    plan_layout: tool({
      description:
        mcpTools.find((t) => t.name === "plan_layout")?.description ??
        "Plan optimal layout for a storefront.",
      inputSchema: z.object({
        productCategory: z.string().optional(),
        dominantStyle: z.enum([
          "minimalist",
          "maximalist",
          "editorial",
          "clean",
        ]),
        sourceLayoutType: z
          .enum(["split", "centered", "minimal", "grid"])
          .optional(),
      }),
    }),
  };

  // ── 5. Manual agentic loop ──────────────────────────────────────────────────

  const visionSource =
    context.visionUrl ||
    (context.imageData ? "[base64 image provided]" : "[no external source]");

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any[] = [
    {
      role: "user",
      content: `Goal: ${goal}\nVision Input: ${visionSource}`,
    },
  ];

  yield progress("Running agentic design loop...", "executing");

  for (let step = 0; step < MAX_STEPS; step++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let result: any;
    try {
      result = await generateText({
        model: xai(AI_MODEL),
        system: systemPrompt,
        messages,
        tools,
      });
    } catch (err) {
      yield { type: "error", error: (err as Error).message };
      return;
    }

    // No more tool calls → model is done
    if (!result.toolCalls?.length) break;

    // Append assistant turn to message history
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assistantContent: any[] = [];
    if (result.text) {
      assistantContent.push({ type: "text", text: result.text });
    }
    for (const tc of result.toolCalls) {
      assistantContent.push({
        type: "tool-call",
        toolCallId: tc.toolCallId,
        toolName: tc.toolName,
        input: tc.input, // AI SDK v6: input not args
      });
    }
    messages.push({ role: "assistant", content: assistantContent });

    // Execute each tool call
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const toolResults: any[] = [];

    for (const tc of result.toolCalls) {
      yield audit("tools/call", { name: tc.toolName, input: tc.input });

      // Context fallback resolver — context values are defaults; model args override if defined
      const rawArgs = (tc.input ?? {}) as Record<string, unknown>;
      const resolvedArgs: Record<string, unknown> = {
        source: context.visionUrl ?? context.imageData ?? "",
      };
      for (const [k, v] of Object.entries(rawArgs)) {
        if (v !== undefined) resolvedArgs[k] = v;
      }

      let output: unknown;

      // ── Internal tool: plan_feedback (HITL gate) ──────────────────────────
      if (tc.toolName === "plan_feedback") {
        const input = tc.input as {
          action: string;
          description: string;
          layoutProposal: string;
          colorProposal: string;
        };

        yield {
          type: "plan_description",
          agentStep: "awaiting-approval",
          plan: {
            id: crypto.randomUUID(),
            description: input.description,
            layoutProposal: input.layoutProposal,
            colorProposal: input.colorProposal,
          },
        };

        // Stream ends here — client will POST again with planFeedback to resume
        return;
      }

      // ── Internal tool: apply_config_update ────────────────────────────────
      if (tc.toolName === "apply_config_update") {
        yield progress("Applying design changes...", "updating");
        yield { type: "config_update", configUpdate: tc.input };
        output = { success: true, applied: tc.input };
      } else {
        // ── External MCP tool ───────────────────────────────────────────────
        try {
          output = await mcpToolCall(tc.toolName, resolvedArgs);
          yield audit("tools/result", { name: tc.toolName }, output);
        } catch (err) {
          output = {
            error: (err as Error).message,
            hint: `Tool "${tc.toolName}" failed. Review the error and retry with corrected arguments.`,
            providedArgs: resolvedArgs,
          };
          yield audit("tools/error", { name: tc.toolName }, output);
        }
      }

      toolResults.push({
        type: "tool-result",
        toolCallId: tc.toolCallId,
        toolName: tc.toolName,
        output: { type: "json", value: output }, // AI SDK v6 format
      });
    }

    messages.push({ role: "tool", content: toolResults });
  }

  yield progress("Design complete!", "complete");
  yield { type: "complete", agentStep: "complete" };
}
