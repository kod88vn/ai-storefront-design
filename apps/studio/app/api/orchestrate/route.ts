import { NextRequest } from "next/server";
import { runOrchestrator } from "@/lib/design-studio/orchestrator";
import { checkAiHandshake } from "@/lib/design-studio/ai-handshake";
import type { OrchestratorContext } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Per-page context injected into the goal so the AI knows what it's editing
const PAGE_CONTEXT: Record<string, string> = {
  home: "You are editing the HOME page of the storefront (hero, product grid, sections, containers).",
  products:
    "You are editing the PRODUCTS listing page. Focus on layout heading, filter visibility, grid or list merchandising mode, grid columns, and color scheme for the products page.",
  "product-detail":
    "You are editing the PRODUCT DETAIL page. Focus on image gallery style, add-to-cart section, related products, and overall theme.",
  cart: "You are editing the CART page. Focus on cart layout, empty state message, checkout button text, and color scheme.",
  custom:
    "You are editing a CUSTOM page. Focus on overall theme changes that will apply globally.",
};

export async function POST(request: NextRequest) {
  const { goal, context = {} as OrchestratorContext } =
    (await request.json()) as {
      goal: string;
      context?: OrchestratorContext;
    };

  if (!goal || typeof goal !== "string") {
    return new Response(JSON.stringify({ error: "goal is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const aiStatus = await checkAiHandshake();
  if (!aiStatus.available) {
    return new Response(
      JSON.stringify({
        error: "AI unavailable. Use the analytic wizard instead.",
        mode: "analytic-only",
        reason: aiStatus.reason,
      }),
      {
        status: 503,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  // Augment goal with page-scoped instructions
  // Custom page IDs (e.g. "custom-abc123") fall back to the generic custom context
  const pageKey = context.page
    ? PAGE_CONTEXT[context.page]
      ? context.page
      : "custom"
    : null;
  const pageHint = pageKey ? PAGE_CONTEXT[pageKey] : "";
  const enrichedGoal = pageHint ? `${pageHint}\n\n${goal}` : goal;

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runOrchestrator(enrichedGoal, context)) {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(event)}\n\n`),
          );
        }
      } catch (err) {
        const errorEvent = {
          type: "error",
          error: (err as Error).message,
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(errorEvent)}\n\n`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
