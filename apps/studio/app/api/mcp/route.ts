import { NextRequest, NextResponse } from "next/server";

import { executeTool } from "@/lib/mcp/execute-tool";
import { TOOLS } from "@/lib/mcp/tool-registry";

// ─── Route handlers ───────────────────────────────────────────────────────────

/* Tool registry and execution logic live in /lib/mcp so this route stays a thin JSON-RPC transport. */

// Tool registry and execution logic live in /lib/mcp so this route stays a thin JSON-RPC transport.



export async function GET() {
  return NextResponse.json({
    jsonrpc: "2.0",
    result: {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "design-studio-mcp", version: "1.0.0" },
    },
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { id, method, params } = body as {
    id: number;
    method: string;
    params?: Record<string, unknown>;
  };

  try {
    switch (method) {
      case "initialize":
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: {
            protocolVersion: "2024-11-05",
            capabilities: { tools: {} },
            serverInfo: { name: "design-studio-mcp", version: "1.0.0" },
          },
        });

      case "ping":
        return NextResponse.json({ jsonrpc: "2.0", id, result: {} });

      case "tools/list":
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          result: { tools: TOOLS },
        });

      case "tools/call": {
        const { name, arguments: toolArgs } = (params ?? {}) as {
          name: string;
          arguments: Record<string, unknown>;
        };
        const result = await executeTool(name, toolArgs ?? {});
        return NextResponse.json({ jsonrpc: "2.0", id, result });
      }

      default:
        return NextResponse.json({
          jsonrpc: "2.0",
          id,
          error: { code: -32601, message: "Method not found" },
        });
    }
  } catch (err) {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32603, message: (err as Error).message },
    });
  }
}
