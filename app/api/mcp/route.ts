import { NextRequest, NextResponse } from "next/server";

// ─── MCP types ───────────────────────────────────────────────────────────────

interface MCPTool {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
}

interface MCPToolResult {
  content: Array<{ type: "text"; text: string }>;
}

// ─── Tool registry ────────────────────────────────────────────────────────────

const TOOLS: MCPTool[] = [
  {
    name: "analyze_vision_input",
    description:
      "Analyze a URL or plain-text description of a storefront design and extract visual signals: dominant colors, layout type, aesthetic style, border-radius convention, and top-level section ordering.",
    inputSchema: {
      type: "object",
      properties: {
        source: {
          type: "string",
          description: "URL or plain-text description of the design to analyze",
        },
        extractionTargets: {
          type: "array",
          items: { type: "string" },
          description:
            "Aspects to extract. Supported: colors, typography, layout, spacing, components",
        },
      },
      required: ["source"],
    },
  },
  {
    name: "generate_theme",
    description:
      "Generate a ThemeConfig (primaryColor, secondaryColor, borderRadius) from extracted design signals and a target aesthetic keyword.",
    inputSchema: {
      type: "object",
      properties: {
        dominantStyle: {
          type: "string",
          enum: ["minimalist", "maximalist", "editorial", "clean"],
          description: "Overall visual style extracted from the source",
        },
        primaryColors: {
          type: "array",
          items: { type: "string" },
          description:
            'Hex color strings found in the source (e.g. ["#1a1a1a"])',
        },
        targetAesthetic: {
          type: "string",
          description:
            "Desired mood. Supported values: organic, luxury, tech, artisan, minimal",
        },
      },
      required: ["dominantStyle"],
    },
  },
  {
    name: "plan_layout",
    description:
      "Determine the optimal hero variant, section order, and product grid column count for a storefront given product category and style signals.",
    inputSchema: {
      type: "object",
      properties: {
        productCategory: {
          type: "string",
          description:
            "Primary product category (e.g. furniture, fashion, lighting, textiles, accessories)",
        },
        dominantStyle: {
          type: "string",
          enum: ["minimalist", "maximalist", "editorial", "clean"],
        },
        sourceLayoutType: {
          type: "string",
          enum: ["split", "centered", "minimal", "grid"],
          description: "Layout type observed in the vision source, if any",
        },
      },
      required: ["dominantStyle"],
    },
  },
];

// ─── Tool execution ───────────────────────────────────────────────────────────

async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<MCPToolResult> {
  switch (name) {
    case "analyze_vision_input": {
      const source = String(args.source ?? "");
      const isUrl = source.startsWith("http");

      // In production this calls a vision model. For the POC we derive signals
      // from URL keywords and return a structured design summary.
      const isLuxury = /lux|premium|gold|jewel|haute/i.test(source);
      const isTech = /tech|saas|app|software|digital/i.test(source);
      const isArtisan = /craft|artisan|hand|studio|maker/i.test(source);

      const dominantStyle = isLuxury
        ? "editorial"
        : isTech
          ? "clean"
          : "minimalist";
      const targetAesthetic = isLuxury
        ? "luxury"
        : isTech
          ? "tech"
          : isArtisan
            ? "artisan"
            : "organic";

      const signals = {
        primaryColors: ["#1a1a1a", "#f5f5f5"],
        fontStack: "Inter, sans-serif",
        layoutType: isLuxury ? "split" : "centered",
        borderRadius: isLuxury ? "none" : "md",
        dominantStyle,
        targetAesthetic,
        sectionOrder: ["hero", "product-grid", "categories", "footer"],
        sourceType: isUrl ? "url" : "description",
      };

      return { content: [{ type: "text", text: JSON.stringify(signals) }] };
    }

    case "generate_theme": {
      const style = String(args.dominantStyle ?? "minimalist");
      const aesthetic = String(args.targetAesthetic ?? "organic");

      const accentMap: Record<string, string> = {
        organic: "#22c55e",
        luxury: "#f59e0b",
        tech: "#3b82f6",
        artisan: "#ef4444",
        minimal: "#64748b",
      };

      const borderRadiusMap: Record<string, "none" | "md" | "full"> = {
        minimalist: "md",
        editorial: "none",
        clean: "md",
        maximalist: "full",
      };

      const theme = {
        primaryColor: "#1a1a1a",
        secondaryColor: accentMap[aesthetic] ?? "#22c55e",
        borderRadius: borderRadiusMap[style] ?? "md",
        rationale: `${style} style with ${aesthetic} accent`,
      };

      return { content: [{ type: "text", text: JSON.stringify(theme) }] };
    }

    case "plan_layout": {
      const category = String(args.productCategory ?? "general");
      const style = String(args.dominantStyle ?? "minimalist");

      const heroMap: Record<string, "split" | "centered" | "minimal"> = {
        minimalist: "minimal",
        editorial: "split",
        clean: "centered",
        maximalist: "centered",
      };

      const colsMap: Record<string, 2 | 3 | 4> = {
        furniture: 2,
        fashion: 3,
        accessories: 4,
        lighting: 3,
        textiles: 3,
        general: 3,
      };

      const layout = {
        heroVariant: heroMap[style] ?? "split",
        sectionOrder: ["hero", "product-grid", "categories", "footer"],
        productGridColumns: colsMap[category] ?? 3,
        rationale: `${style} style for ${category} category`,
      };

      return { content: [{ type: "text", text: JSON.stringify(layout) }] };
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

// ─── Route handlers ───────────────────────────────────────────────────────────

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
