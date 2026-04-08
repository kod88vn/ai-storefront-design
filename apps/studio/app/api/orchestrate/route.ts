import { NextRequest } from "next/server";
import { runOrchestrator } from "@/lib/design-studio/orchestrator";
import type { OrchestratorContext } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const { goal, context } = (await request.json()) as {
    goal: string;
    context: OrchestratorContext;
  };

  if (!goal || typeof goal !== "string") {
    return new Response(JSON.stringify({ error: "goal is required" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for await (const event of runOrchestrator(goal, context)) {
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
