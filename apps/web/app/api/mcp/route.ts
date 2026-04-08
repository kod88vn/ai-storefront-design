import { NextRequest, NextResponse } from "next/server";
import type { StorefrontConfig } from "../../../../../packages/types/src";
import {
  buildStoreMetadata,
  readStoreConfig,
  writeStoreConfig,
} from "../../../lib/store-config";

interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

const TOOLS: MCPTool[] = [
  {
    name: "get_store_config",
    description: "Return current storefront configuration JSON",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "get_store_metadata",
    description: "Return summarized storefront metadata",
    inputSchema: { type: "object", properties: {} },
  },
  {
    name: "update_store_config",
    description: "Persist an updated StorefrontConfig JSON",
    inputSchema: {
      type: "object",
      properties: {
        config: { type: "object" },
      },
      required: ["config"],
    },
  },
];

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    jsonrpc: "2.0",
    result: {
      protocolVersion: "2024-11-05",
      capabilities: { tools: {} },
      serverInfo: { name: "storefront-web-mcp", version: "1.0.0" },
    },
  });
}

async function executeTool(name: string, args: Record<string, unknown>) {
  switch (name) {
    case "get_store_config": {
      const config = await readStoreConfig();
      return { content: [{ type: "text", text: JSON.stringify(config) }] };
    }
    case "get_store_metadata": {
      const config = await readStoreConfig();
      const metadata = buildStoreMetadata(config);
      return { content: [{ type: "text", text: JSON.stringify(metadata) }] };
    }
    case "update_store_config": {
      const config = args.config as StorefrontConfig;
      await writeStoreConfig(config);
      return {
        content: [{ type: "text", text: JSON.stringify({ ok: true }) }],
      };
    }
    default:
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ error: `Unknown tool: ${name}` }),
          },
        ],
      };
  }
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
            serverInfo: { name: "storefront-web-mcp", version: "1.0.0" },
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
  } catch (error) {
    return NextResponse.json({
      jsonrpc: "2.0",
      id,
      error: { code: -32603, message: (error as Error).message },
    });
  }
}
