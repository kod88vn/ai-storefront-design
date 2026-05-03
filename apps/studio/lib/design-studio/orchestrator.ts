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

import { generateText, streamText, tool } from "ai";
import { xai } from "@ai-sdk/xai";
import { createOpenAI } from "@ai-sdk/openai";
import { z } from "zod";

import type { OrchestratorContext, OrchestratorEvent } from "@/lib/types";
import { buildSystemPrompt } from "@/lib/design-studio/build-system-prompt";
import { audit, progress } from "@/lib/design-studio/events";
import { jsonSchemaToZod } from "@/lib/design-studio/json-schema-to-zod";
import { mcpListTools, mcpToolCall } from "@/lib/design-studio/mcp-client";
import { filterSkills, loadSkills } from "@/lib/design-studio/skill-loader";

// ─── Config ───────────────────────────────────────────────────────────────────

const MAX_STEPS = 15;
const USE_AI_GATEWAY = Boolean(process.env.AI_GATEWAY_API_KEY);
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL; // e.g. http://ai:11434
const DEFAULT_XAI_MODEL = "grok-3-fast";
const DEFAULT_GATEWAY_MODEL = "openai/gpt-4.1-mini";
const DEFAULT_OLLAMA_MODEL = "qwen3-coder:latest";

// With AI Gateway enabled, use provider/model IDs such as
// "openai/gpt-4.1-mini", "anthropic/claude-sonnet-4-5", or "xai/grok-4.1-mini".
// Otherwise use native xAI Responses API model IDs.
// With OLLAMA_BASE_URL, point at a local Ollama instance.
const AI_MODEL =
  process.env.AI_MODEL ??
  (OLLAMA_BASE_URL ? DEFAULT_OLLAMA_MODEL : USE_AI_GATEWAY ? DEFAULT_GATEWAY_MODEL : DEFAULT_XAI_MODEL);
const VISION_MODEL = process.env.VISION_MODEL ?? AI_MODEL;

const ollama = OLLAMA_BASE_URL
  ? createOpenAI({ baseURL: `${OLLAMA_BASE_URL}/v1`, apiKey: "ollama" })
  : null;

function resolveModel(modelId: string) {
  if (ollama) return ollama(modelId);
  return USE_AI_GATEWAY ? modelId : xai.responses(modelId);
}

// ─── Orchestrator generator ───────────────────────────────────────────────────

export async function* runOrchestrator(
  goal: string,
  context: OrchestratorContext,
): AsyncGenerator<OrchestratorEvent> {
  // ── 1. Load skills (tag-filtered for this request) ─────────────────────────
  yield progress("Loading AI skills...", "thinking");

  const allSkills = await loadSkills();
  const skills = filterSkills(allSkills, goal, context);
  yield audit("skills/load", {
    loaded: skills.map((s) => s.name),
    skipped: allSkills.filter((s) => !skills.includes(s)).map((s) => s.name),
  });

  // ── 2. Discover MCP tools ───────────────────────────────────────────────────
  yield progress("Discovering tools via MCP...", "decomposing");

  let mcpTools: Array<{
    name: string;
    description: string;
    inputSchema: unknown;
  }> = [];
  try {
    mcpTools = await mcpListTools();
  } catch (err) {
    const e = err as Error;
    yield audit("tools/list-error", {
      message: e.message,
      stack: e.stack?.slice(0, 500),
    });
    console.error("[orchestrator] mcpListTools failed:", e.message);
    yield { type: "error", error: `Failed to list MCP tools: ${e.message}` };
    return;
  }
  yield audit("tools/list", { tools: mcpTools.map((t) => t.name) });

  // ── 3. Image pre-analysis (vision model → structured tokens) ────────────────
  //
  // grok-3 is text-only. When an image is uploaded we first call
  // grok-2-vision-1212 to extract exact design tokens (hex colors, enums).
  // These tokens are injected into the system prompt so the AI can skip the
  // MCP analyze_vision_input call (which can't access the image data) and use
  // the pre-computed values directly in plan_feedback and apply_config_update.

  let preComputedTokens = "";
  let visionFailed = false;

  if (
    context.uploadedImageTokens &&
    Object.values(context.uploadedImageTokens).some((value) => Boolean(value))
  ) {
    const tokens = context.uploadedImageTokens;
    preComputedTokens = [
      `siteCategory: other`,
      `businessModel: single-brand-dtc`,
      `primaryColor: ${tokens.primaryColor ?? "#111111"}`,
      `secondaryColor: ${tokens.secondaryColor ?? "#6366f1"}`,
      `backgroundColor: ${tokens.backgroundColor ?? tokens.primaryColor ?? "#ffffff"}`,
      `sectionBackgroundColor: ${tokens.sectionBackgroundColor ?? tokens.backgroundColor ?? "#f5f5f5"}`,
      `colorScheme: ${tokens.colorScheme ?? "light"}`,
      `dominantStyle: ${tokens.dominantStyle ?? "clean"}`,
      `fontStyle: ${tokens.fontStyle ?? "modern-sans"}`,
      `navStyle: ${tokens.navStyle ?? "bordered"}`,
      `borderRadius: ${tokens.borderRadius ?? "md"}`,
      `heroLayout: ${tokens.heroLayout ?? "split"}`,
      `productGridColumns: ${tokens.productGridColumns ?? 3}`,
      `visualDensity: balanced`,
      `ctaStyle: brand-first`,
      `imageryStyle: mixed`,
      `headlineTone: editorial`,
      `navigationDensity: medium`,
      `sectionOrder: []`,
      `mood: ${tokens.mood ?? ""}`,
      `brandSignals: []`,
      `observations: ${tokens.observations ?? "Locally extracted from the uploaded screenshot."}`,
    ].join("\n");

    yield audit("vision/local-tokens", {
      source: "client-canvas",
      tokens,
    });
    yield progress(
      "Image analyzed from the uploaded screenshot...",
      "thinking",
    );
  } else if (context.imageData) {
    yield progress("Analyzing uploaded image...", "thinking");
    try {
      const visionResult = await generateText({
        model: resolveModel(VISION_MODEL),
        messages: [
          {
            role: "user",
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            content: [
              {
                type: "text",
                text: `You are a design analyst. Extract structured design tokens from this storefront screenshot and respond with ONLY a raw JSON object (no markdown fences):

{
  "siteCategory": "<food-delivery|fashion|footwear|beauty|electronics|home|marketplace|grocery|wellness|other>",
  "businessModel": "<marketplace|single-brand-dtc|multi-brand-retail|editorial-commerce|service-led-commerce>",
  "primaryColor": "<exact hex of the dominant structural brand color used across the experience — usually headings, wordmark, or repeated UI framing; ignore a small navbar strip if it is only a minor accent>",
  "secondaryColor": "<exact hex of the accent or CTA color used more sparingly>",
  "backgroundColor": "<exact hex of the main page/canvas background color>",
  "sectionBackgroundColor": "<exact hex of secondary surface color — announcement bars, benefit strips, newsletter panels>",
  "colorScheme": "<light|dark>",
  "dominantStyle": "<dark-luxury|organic|editorial|bold-playful|clean|earthy|maximalist|minimalist|mission-driven|tech-precision>",
  "fontStyle": "<modern-sans|geometric-sans|humanist-sans|editorial-serif|display-serif|slab-serif|mono-tech|handwritten|condensed|rounded>",
  "navStyle": "<bordered|transparent|filled>",
  "borderRadius": "<none|sm|md|lg|xl|full>",
  "heroLayout": "<split|centered|editorial>",
  "productGridColumns": <2|3|4>,
  "visualDensity": "<sparse|balanced|dense>",
  "ctaStyle": "<utility-first|promotion-first|brand-first|editorial-soft>",
  "imageryStyle": "<product-cutout|lifestyle|editorial-campaign|app-ui|restaurant-food|mixed>",
  "headlineTone": "<performance|premium|playful|functional|editorial|urgent>",
  "navigationDensity": "<minimal|medium|dense>",
  "sectionOrder": ["<hero>", "<category chips>", "<promo banners>", "<product grid>", "<collections>", "<social proof>", "<footer>"],
  "mood": "<2–3 word aesthetic>",
  "brandSignals": ["<3-6 short concrete signals that distinguish this brand experience>"],
  "observations": "<1–2 sentences on typography, sections, imagery>"
}

Rules:
- sample real hex values from visible pixels; never use placeholders.
- prefer concrete structural differences over generic adjectives.
- brandSignals must mention specific distinguishing cues such as sticky category chips, monochrome product cutouts, promo card density, restaurant cards, performance athlete imagery, etc.
- Uber Eats and Nike should not collapse to the same answer: food marketplace UI should differ clearly from performance retail brand UI.`,
              },
              { type: "image", image: context.imageData },
            ] as any,
          },
        ],
      });

      // ── Parse response ────────────────────────────────────────────────────
      let parsed: Record<string, unknown> = {};
      let parseError: string | null = null;
      try {
        const raw = visionResult.text
          .trim()
          .replace(/^```json\s*|```\s*$/g, "");
        parsed = JSON.parse(raw);
      } catch (e) {
        parseError = (e as Error).message;
      }

      // ── Validate that we got real hex color values ────────────────────────
      const hexRe = /^#[0-9a-fA-F]{6}$/;
      const primaryOk = hexRe.test(String(parsed.primaryColor ?? ""));
      const secondaryOk = hexRe.test(String(parsed.secondaryColor ?? ""));

      if (parseError || !primaryOk) {
        // Surface the failure visibly in the audit trail
        yield audit("vision/parse-error", {
          model: VISION_MODEL,
          parseError,
          rawResponse: visionResult.text.slice(0, 500),
          primaryColorValid: primaryOk,
          secondaryColorValid: secondaryOk,
        });
        visionFailed = true;
        yield progress(
          `Image analysis failed (${parseError ? "invalid JSON" : "no valid hex colors"}) — falling back to text-only mode.`,
          "thinking",
        );
      } else {
        // All good — build the token string the system prompt will inject
        preComputedTokens = [
          `siteCategory: ${parsed.siteCategory ?? "other"}`,
          `businessModel: ${parsed.businessModel ?? "single-brand-dtc"}`,
          `primaryColor: ${parsed.primaryColor}`,
          `secondaryColor: ${parsed.secondaryColor}`,
          `backgroundColor: ${parsed.backgroundColor ?? "#ffffff"}`,
          `sectionBackgroundColor: ${parsed.sectionBackgroundColor ?? parsed.backgroundColor ?? "#f5f5f5"}`,
          `colorScheme: ${parsed.colorScheme ?? "light"}`,
          `dominantStyle: ${parsed.dominantStyle ?? "clean"}`,
          `fontStyle: ${parsed.fontStyle ?? "modern-sans"}`,
          `navStyle: ${parsed.navStyle ?? "bordered"}`,
          `borderRadius: ${parsed.borderRadius ?? "md"}`,
          `heroLayout: ${parsed.heroLayout ?? "split"}`,
          `productGridColumns: ${parsed.productGridColumns ?? 3}`,
          `visualDensity: ${parsed.visualDensity ?? "balanced"}`,
          `ctaStyle: ${parsed.ctaStyle ?? "brand-first"}`,
          `imageryStyle: ${parsed.imageryStyle ?? "mixed"}`,
          `headlineTone: ${parsed.headlineTone ?? "functional"}`,
          `navigationDensity: ${parsed.navigationDensity ?? "medium"}`,
          `sectionOrder: ${JSON.stringify(parsed.sectionOrder ?? [])}`,
          `mood: ${parsed.mood ?? ""}`,
          `brandSignals: ${JSON.stringify(parsed.brandSignals ?? [])}`,
          `observations: ${parsed.observations ?? ""}`,
        ].join("\n");

        yield audit("vision/tokens", { model: VISION_MODEL, tokens: parsed });
        yield progress(
          "Image analyzed — proceeding with design...",
          "thinking",
        );
      }
    } catch (err) {
      const message = (err as Error).message;
      yield audit("vision/error", { model: VISION_MODEL, error: message });
      visionFailed = true;
      yield progress(
        `Image analysis error (${message}) — falling back to text-only mode.`,
        "thinking",
      );
      console.error("Vision model error:", message);
    }
  }

  // ── 4. Build system prompt ──────────────────────────────────────────────────

  const systemPrompt = buildSystemPrompt({
    context,
    skills,
    mcpTools,
    preComputedTokens,
    visionFailed,
  });

  // ── 5. Compose tools for the AI ─────────────────────────────────────────────
  //
  // Internal tools (plan_feedback, apply_config_update) are handled by the
  // orchestrator directly — NOT forwarded to MCP.
  // External tools wrap MCP calls.

  // MCP tools are registered dynamically — no orchestrator edits needed when tools are added.
  // jsonSchemaToZod converts each tool's inputSchema so the AI sees named fields.
  const dynamicMcpTools = Object.fromEntries(
    mcpTools.map((t) => [
      t.name,
      tool({
        description: `${t.description}\n\nSchema: ${JSON.stringify(t.inputSchema)}`,
        inputSchema: jsonSchemaToZod(t.inputSchema as Record<string, unknown>),
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

    // Dynamic MCP tools (apply_config_update, analyze_vision_input, etc.) —
    // registered with full Zod schemas derived from the MCP JSON Schema.
    ...dynamicMcpTools,
  };

  // ── 6. Build initial user message and start agentic loop ───────────────────
  //
  // Image analysis tokens (if any) are already in the system prompt (step 3).
  // The user message only needs the goal — clean and minimal.

  const visionSource = context.visionUrl || "[no external source]";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const messages: any[] = [
    {
      role: "user",
      content:
        context.imageData && !visionFailed
          ? `Goal: ${goal}\n\n(Image reference uploaded — design tokens are in the system prompt. Use the Pre-Computed Design Tokens from the system prompt for colors and layout.)`
          : context.imageData && visionFailed
            ? `Goal: ${goal}\n\n(An image was uploaded but could not be analyzed — proceed from text goal only.)`
            : `Goal: ${goal}\nVision Input: ${visionSource}`,
    },
  ];

  yield progress("Running agentic design loop...", "executing");

  for (let step = 0; step < MAX_STEPS; step++) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let collectedToolCalls: any[] = [];
    let collectedText = "";

    // On the plan-approved resume step, force a tool call so the model can't
    // just output prose and exit — it must call apply_config_update.
    const isResumeStep = step === 0 && context.planFeedback?.approved === true;
    const allTools = tools as Record<string, unknown>;
    const stepTools =
      isResumeStep && allTools.apply_config_update
        ? { apply_config_update: allTools.apply_config_update }
        : allTools;

    try {
      const streamResult = streamText({
        // Use AI Gateway when configured; otherwise fall back to direct xAI.
        model: resolveModel(AI_MODEL),
        system: systemPrompt,
        messages,
        tools: stepTools as never,
        ...(isResumeStep ? { toolChoice: "required" } : {}),
      });

      // Stream text, reasoning, and tool-call chunks to the client in real time.
      // Reasoning models often skip text entirely and go straight to tool calls —
      // emitting the tool name ensures there's always something visible.
      for await (const chunk of streamResult.fullStream) {
        const typedChunk = chunk as unknown as {
          type: string;
          toolName?: string;
          error?: unknown;
        };
        if (chunk.type === "text-delta") {
          // AI SDK v6: text-delta has `.text` not `.textDelta`
          const text = (chunk as unknown as { text: string }).text ?? "";
          collectedText += text;
          if (text) yield { type: "thinking", thinking: text };
        } else if (chunk.type === "reasoning-delta") {
          // AI SDK v6: reasoning-delta has `.textDelta`
          const delta =
            (chunk as unknown as { textDelta: string }).textDelta ?? "";
          if (delta) yield { type: "thinking", thinking: delta };
        } else if (
          typedChunk.type === "tool-call" ||
          typedChunk.type === "tool-input-start"
        ) {
          // Emit the tool name so the user sees which tool is being invoked
          const toolName = typedChunk.toolName ?? "tool";
          yield {
            type: "thinking",
            thinking: `→ ${toolName}\n`,
          };
          if (typedChunk.type === "tool-call") {
            // tool-call from fullStream uses `.input` in AI SDK v6 (same as generateText)
            collectedToolCalls.push(chunk);
          }
        } else if (typedChunk.type === "error") {
          throw typedChunk.error;
        }
      }
    } catch (err) {
      // AI SDK errors carry extra diagnostic fields — extract them all so the
      // audit trail shows exactly what went wrong (status code, response body, etc.)
      type SdkError = Error & {
        statusCode?: number;
        url?: string;
        responseBody?: string;
        requestBodyValues?: unknown;
        cause?: Error;
        errors?: Error[]; // RetryError wraps multiple attempt errors
      };
      const e = err as SdkError;

      // Surface the last individual attempt error for RetryError
      const lastCause = Array.isArray(e.errors)
        ? e.errors[e.errors.length - 1]
        : e.cause;
      const lastCauseFields = lastCause
        ? {
            causeName: lastCause.name,
            causeMessage: lastCause.message,
            causeStatusCode: (lastCause as SdkError).statusCode,
            causeResponseBody: (lastCause as SdkError).responseBody?.slice(
              0,
              2000,
            ),
            causeUrl: (lastCause as SdkError).url,
          }
        : {};

      yield audit("agent/generate-error", {
        step,
        model: AI_MODEL,
        errorName: e.name,
        message: e.message,
        statusCode: e.statusCode,
        url: e.url,
        responseBody: e.responseBody?.slice(0, 2000),
        ...lastCauseFields,
      });

      console.error("[orchestrator] streamText failed at step", step, {
        model: AI_MODEL,
        errorName: e.name,
        message: e.message,
        statusCode: e.statusCode,
        url: e.url,
        responseBody: e.responseBody,
        cause: lastCause?.message,
        stack: e.stack,
      });

      yield { type: "error", error: e.message };
      return;
    }

    // No more tool calls → model is done (log text for debugging)
    if (!collectedToolCalls.length) {
      if (collectedText) {
        yield audit("agent/text-only-exit", { step, text: collectedText.slice(0, 500) });
      }
      break;
    }

    // Append assistant turn to message history
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const assistantContent: any[] = [];
    if (collectedText) {
      assistantContent.push({ type: "text", text: collectedText });
    }
    for (const tc of collectedToolCalls) {
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

    for (const tc of collectedToolCalls) {
      yield audit("tools/call", { name: tc.toolName, input: tc.input });

      // Build args: spread model-provided values; inject `source` only for the
      // analyze_vision_input tool (the only MCP tool that needs it).
      const rawArgs = (tc.input ?? {}) as Record<string, unknown>;
      const resolvedArgs: Record<string, unknown> = { ...rawArgs };
      if (
        tc.toolName === "analyze_vision_input" &&
        resolvedArgs.source === undefined
      ) {
        resolvedArgs.source = context.visionUrl ?? context.imageData ?? "";
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
            // Ensure plannedChanges is always a proper array (Responses API may return object-keyed arrays)
            plannedChanges: Array.isArray(input.plannedChanges)
              ? (input.plannedChanges as never)
              : input.plannedChanges
                ? (Object.values(input.plannedChanges) as never)
                : undefined,
          },
        };

        // Stream ends here — client will POST again with planFeedback to resume
        return;
      }

      // ── apply_config_update: call MCP then emit config_update SSE event ──
      if (tc.toolName === "apply_config_update") {
        yield progress("Applying design changes...", "updating");
        try {
          output = await mcpToolCall(tc.toolName, resolvedArgs);
          yield audit("tools/result", { name: tc.toolName }, output);
        } catch (err) {
          output = { error: (err as Error).message };
          yield audit("tools/error", { name: tc.toolName }, output);
        }
        // Emit to the UI regardless — the patch is the AI's input, not the MCP echo
        yield { type: "config_update", configUpdate: tc.input };
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
