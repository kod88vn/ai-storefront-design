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
    `theme: primary=${context.currentConfig.theme.primaryColor}, secondary=${context.currentConfig.theme.secondaryColor}, radius=${context.currentConfig.theme.borderRadius}`,
    `grid: ${context.currentConfig.productGrid.columns} columns`,
  ].join(" | ");

  // The planner skill defines the full workflow — embed it so the AI follows it.
  // All other skills are listed by purpose only (their schemas live in MCP tool descriptions).
  const plannerSkill = skills.find((s) => s.name === "planner");
  const mcpToolDescriptions = mcpTools
    .map(
      (t) =>
        `**${t.name}**: ${t.description}\n  Input schema: ${JSON.stringify(t.inputSchema)}`,
    )
    .join("\n\n");

  const systemPrompt = `You are an AI storefront design agent. Redesign the storefront based on the goal.

## Skills

${formatSkillsForPrompt(skills)}

## Workflow

${plannerSkill ? plannerSkill.content : "1. Call plan_feedback first. 2. After approval, call MCP tools then apply_config_update."}

## MCP Tools

${mcpToolDescriptions}

## Current Config

${configSummary}${resumeInstruction}`;

  // ── 4. Compose tools for the AI ─────────────────────────────────────────────
  //
  // Internal tools (plan_feedback, apply_config_update) are handled by the
  // orchestrator directly — NOT forwarded to MCP.
  // External tools wrap MCP calls.

  // MCP tools are registered dynamically — no orchestrator edits needed when tools are added.
  // The full input schema is embedded in each tool's description so the AI knows what to pass.
  const dynamicMcpTools = Object.fromEntries(
    mcpTools.map((t) => [
      t.name,
      tool({
        description: `${t.description}\n\nSchema: ${JSON.stringify(t.inputSchema)}`,
        inputSchema: z.record(z.string(), z.unknown()),
      }),
    ]),
  );

  const tools = {
    plan_feedback: tool({
      description:
        "Present a proposed design plan to the user for HITL approval. Always call this first (Phase 2 of the Planner Skill). Do NOT call MCP tools or apply_config_update before this is approved.",
      inputSchema: z.object({
        action: z.literal("request_feedback"),
        description: z
          .string()
          .describe(
            "2–4 sentence summary of all proposed changes and rationale",
          ),
        layoutProposal: z
          .string()
          .describe(
            "Hero layout variant + notable section additions (e.g. 'Editorial hero + benefits bar + featured testimonials')",
          ),
        colorProposal: z
          .string()
          .describe(
            "Primary + accent colors with hex and aesthetic label (e.g. 'Near-black (#0a0a0a) + Gold (#c9a84c) — dark luxury')",
          ),
        navStyleProposal: z
          .enum(["bordered", "transparent", "filled"])
          .optional()
          .describe("Proposed navbar style"),
        colorSchemeProposal: z
          .enum(["light", "dark"])
          .optional()
          .describe("Proposed color scheme: light or dark base"),
        plannedChanges: z
          .array(
            z.object({
              id: z.string(),
              category: z.enum([
                "theme",
                "hero",
                "layout",
                "sections",
                "content",
              ]),
              label: z.string(),
              description: z.string(),
            }),
          )
          .optional()
          .describe(
            "Granular atomic change items — one entry per config field being modified. The user sees this list and can check/uncheck each item individually. Always include at minimum: hero layout, primary color, accent color, plus one item per additional field changed (nav style, color scheme, font style, grid columns, each section being enabled).",
          ),
      }),
    }),

    apply_config_update: tool({
      description:
        "Apply approved design changes to the StorefrontConfig. Call this after all MCP tools have returned with concrete values (Phase 3 of the Planner Skill).",
      inputSchema: z.object({
        themeChanges: z
          .object({
            primaryColor: z.string().optional(),
            secondaryColor: z.string().optional(),
            borderRadius: z.enum(["none", "md", "full"]).optional(),
            navStyle: z.enum(["bordered", "transparent", "filled"]).optional(),
            colorScheme: z.enum(["light", "dark"]).optional(),
            fontStyle: z
              .enum(["modern-sans", "editorial-serif", "mono-tech"])
              .optional(),
          })
          .optional(),
        heroChanges: z
          .object({
            layout: z
              .enum(["split", "centered", "minimal", "fullbleed", "editorial"])
              .optional(),
            title: z.string().optional(),
            subtitle: z.string().optional(),
            badge: z.string().optional(),
            textAlign: z.enum(["left", "center"]).optional(),
            ctaVariant: z.enum(["solid", "outline", "ghost"]).optional(),
            overlayOpacity: z.number().min(0).max(1).optional(),
            ctaText: z.string().optional(),
            ctaSecondaryText: z.string().optional(),
          })
          .optional(),
        productGridColumns: z
          .union([z.literal(2), z.literal(3), z.literal(4)])
          .optional(),
        sectionOrder: z.array(z.string()).optional(),
        enableSections: z.array(z.string()).optional(),
        disableSections: z.array(z.string()).optional(),
        sectionData: z.record(z.string(), z.unknown()).optional(),
      }),
    }),

    ...dynamicMcpTools,
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
          navStyleProposal?: string;
          colorSchemeProposal?: string;
          plannedChanges?: Array<{
            id: string;
            category: string;
            label: string;
            description: string;
          }>;
        };

        yield {
          type: "plan_description",
          agentStep: "awaiting-approval",
          plan: {
            id: crypto.randomUUID(),
            description: input.description,
            layoutProposal: input.layoutProposal,
            colorProposal: input.colorProposal,
            navStyleProposal: input.navStyleProposal,
            colorSchemeProposal: input.colorSchemeProposal,
            plannedChanges: input.plannedChanges as never,
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
