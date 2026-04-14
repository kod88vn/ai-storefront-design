import { NextRequest, NextResponse } from "next/server";
import {
  DOMINANT_STYLES,
  HERO_LAYOUTS,
  NAV_STYLES,
  COLOR_SCHEMES,
  SOURCE_LAYOUT_TYPES,
  type DominantStyle,
  type HeroLayout,
} from "@ai-storefront/types";
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
      "Analyze a URL or plain-text description of a storefront design and extract visual signals: dominant colors, layout type, aesthetic style, border-radius, navStyle, colorScheme, fontStyle, and section ordering.",
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
      "Generate a full ThemeConfig (primaryColor, secondaryColor, borderRadius, navStyle, colorScheme, fontStyle) from extracted design signals and a target aesthetic keyword.",
    inputSchema: {
      type: "object",
      properties: {
        dominantStyle: {
          type: "string",
          enum: DOMINANT_STYLES,
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
            "Desired mood. Supported: organic, luxury, tech, artisan, minimal, earthy, playful, editorial, health, mission",
        },
        colorScheme: {
          type: "string",
          enum: ["light", "dark"],
          description: "Detected or desired color scheme",
        },
        navStyle: {
          type: "string",
          enum: ["bordered", "transparent", "filled"],
          description: "Detected or desired navbar style",
        },
      },
      required: ["dominantStyle"],
    },
  },
  {
    name: "plan_layout",
    description:
      "Determine the optimal hero variant, section order, product grid columns, and hero micro-parameters (badge, textAlign, ctaVariant, overlayOpacity) given product category and style signals.",
    inputSchema: {
      type: "object",
      properties: {
        productCategory: {
          type: "string",
          description:
            "Primary product category (e.g. furniture, fashion, lighting, accessories, health, personal-care)",
        },
        dominantStyle: {
          type: "string",
          enum: DOMINANT_STYLES,
        },
        sourceLayoutType: {
          type: "string",
          enum: SOURCE_LAYOUT_TYPES,
          description: "Layout type observed in the vision source, if any",
        },
        colorScheme: {
          type: "string",
          enum: COLOR_SCHEMES,
        },
        navStyle: {
          type: "string",
          enum: NAV_STYLES,
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
      const isLuxury = /lux|premium|gold|jewel|haute|master.dynamic/i.test(
        source,
      );
      const isDark = /dark|black|noir|obsidian/i.test(source);
      const isTech = /tech|saas|app|software|digital|hardware|spec/i.test(
        source,
      );
      const isArtisan = /craft|artisan|hand|studio|maker|journal/i.test(source);
      const isOrganic = /organic|natural|plant|soap|herb|earth|eco/i.test(
        source,
      );
      const isEarthy = /rustic|earthy|wood|squatch|terra|grain/i.test(source);
      const isPlayful =
        /playful|colorful|bold|sport|active|wellness|hiya|kids/i.test(source);
      const isHealth = /health|supplement|vitamin|clinical|medical|figs/i.test(
        source,
      );
      const isMission = /mission|cause|sustainable|united|planet/i.test(source);

      const dominantStyle: DominantStyle =
        isLuxury || isDark
          ? "dark-luxury"
          : isTech
            ? "tech-precision"
            : isArtisan
              ? "editorial"
              : isOrganic
                ? "organic"
                : isEarthy
                  ? "earthy"
                  : isPlayful
                    ? "bold-playful"
                    : isHealth
                      ? "clean"
                      : isMission
                        ? "mission-driven"
                        : "minimalist";

      const targetAesthetic = isLuxury
        ? "luxury"
        : isTech
          ? "tech"
          : isArtisan
            ? "artisan"
            : isOrganic
              ? "organic"
              : isEarthy
                ? "earthy"
                : isPlayful
                  ? "playful"
                  : isHealth
                    ? "health"
                    : isMission
                      ? "mission"
                      : "minimal";

      const colorScheme = isLuxury || isDark || isTech ? "dark" : "light";
      const navStyle =
        isLuxury || isDark || isTech
          ? "transparent"
          : isMission
            ? "filled"
            : "bordered";
      const fontStyle = isTech
        ? "mono-tech"
        : isArtisan
          ? "editorial-serif"
          : "modern-sans";

      const signals = {
        primaryColors: isLuxury
          ? ["#0a0a0a", "#c9a84c"]
          : ["#1a1a1a", "#f5f5f5"],
        fontStack:
          fontStyle === "editorial-serif"
            ? "Georgia, serif"
            : "Inter, sans-serif",
        fontStyle,
        layoutType: isLuxury
          ? "fullbleed"
          : isArtisan
            ? "editorial"
            : "centered",
        borderRadius:
          isLuxury || isTech || isArtisan ? "none" : isPlayful ? "full" : "md",
        dominantStyle,
        colorScheme,
        navStyle,
        targetAesthetic,
        sectionOrder: ["hero", "product-grid", "categories", "footer"],
        sourceType: isUrl ? "url" : "description",
      };

      return { content: [{ type: "text", text: JSON.stringify(signals) }] };
    }

    case "generate_theme": {
      const style = String(args.dominantStyle ?? "minimalist") as DominantStyle;
      const aesthetic = String(args.targetAesthetic ?? "organic");
      const colorScheme = String(args.colorScheme ?? "light") as
        | "light"
        | "dark";
      const navStyleInput = String(args.navStyle ?? "");

      // Full preset table keyed by dominantStyle
      const presets: Record<
        DominantStyle,
        {
          primary: string;
          secondary: string;
          radius: "none" | "md" | "full";
          nav: "bordered" | "transparent" | "filled";
          scheme: "light" | "dark";
          font: "modern-sans" | "editorial-serif" | "mono-tech";
        }
      > = {
        "dark-luxury": {
          primary: "#0a0a0a",
          secondary: "#c9a84c",
          radius: "none",
          nav: "transparent",
          scheme: "dark",
          font: "modern-sans",
        },
        organic: {
          primary: "#2d4a22",
          secondary: "#7cb87a",
          radius: "md",
          nav: "bordered",
          scheme: "light",
          font: "modern-sans",
        },
        editorial: {
          primary: "#1a1a1a",
          secondary: "#e8b84b",
          radius: "none",
          nav: "bordered",
          scheme: "light",
          font: "editorial-serif",
        },
        "bold-playful": {
          primary: "#1a1a1a",
          secondary: "#f97316",
          radius: "full",
          nav: "bordered",
          scheme: "light",
          font: "modern-sans",
        },
        clean: {
          primary: "#0f4c35",
          secondary: "#22c55e",
          radius: "md",
          nav: "bordered",
          scheme: "light",
          font: "modern-sans",
        },
        earthy: {
          primary: "#3d2b1f",
          secondary: "#a16207",
          radius: "md",
          nav: "bordered",
          scheme: "light",
          font: "modern-sans",
        },
        maximalist: {
          primary: "#111827",
          secondary: "#a855f7",
          radius: "full",
          nav: "bordered",
          scheme: "light",
          font: "modern-sans",
        },
        minimalist: {
          primary: "#111827",
          secondary: "#6366f1",
          radius: "none",
          nav: "bordered",
          scheme: "light",
          font: "modern-sans",
        },
        "mission-driven": {
          primary: "#1e3a5f",
          secondary: "#0ea5e9",
          radius: "md",
          nav: "filled",
          scheme: "light",
          font: "editorial-serif",
        },
        "tech-precision": {
          primary: "#0f172a",
          secondary: "#3b82f6",
          radius: "none",
          nav: "transparent",
          scheme: "dark",
          font: "mono-tech",
        },
      };

      // Override with explicit aesthetic accent if provided
      const aestheticAccent: Record<string, string> = {
        organic: "#22c55e",
        luxury: "#c9a84c",
        tech: "#3b82f6",
        artisan: "#e8b84b",
        minimal: "#64748b",
        earthy: "#a16207",
        playful: "#f97316",
        health: "#22c55e",
        mission: "#0ea5e9",
      };

      const preset = presets[style] ?? presets["minimalist"];
      const theme = {
        primaryColor: preset.primary,
        secondaryColor: aestheticAccent[aesthetic] ?? preset.secondary,
        borderRadius: preset.radius,
        navStyle: (navStyleInput || preset.nav) as
          | "bordered"
          | "transparent"
          | "filled",
        colorScheme: colorScheme || preset.scheme,
        fontStyle: preset.font,
        rationale: `${style} preset — ${aesthetic} accent`,
      };

      return { content: [{ type: "text", text: JSON.stringify(theme) }] };
    }

    case "plan_layout": {
      const category = String(args.productCategory ?? "general");
      const style = String(args.dominantStyle ?? "minimalist") as DominantStyle;
      const colorScheme = String(args.colorScheme ?? "light");

      type HeroVariant = HeroLayout;

      const heroMap: Record<DominantStyle, HeroVariant> = {
        "dark-luxury": "editorial",
        organic: "split",
        editorial: "editorial",
        "bold-playful": "centered",
        clean: "centered",
        earthy: "split",
        maximalist: "centered",
        minimalist: "split",
        "mission-driven": "centered",
        "tech-precision": "editorial",
      };

      const overlayMap: Record<DominantStyle, number> = {
        "dark-luxury": 0.5,
        "mission-driven": 0.35,
        "tech-precision": 0.65,
        organic: 0,
        editorial: 0,
        "bold-playful": 0,
        clean: 0,
        earthy: 0,
        maximalist: 0,
        minimalist: 0,
      };

      const ctaVariantMap: Record<
        DominantStyle,
        "solid" | "outline" | "ghost"
      > = {
        "dark-luxury": "ghost",
        "tech-precision": "ghost",
        "mission-driven": "outline",
        organic: "solid",
        editorial: "outline",
        "bold-playful": "solid",
        clean: "solid",
        earthy: "solid",
        maximalist: "solid",
        minimalist: "outline",
      };

      const textAlignMap: Record<DominantStyle, "left" | "center"> = {
        "dark-luxury": "left",
        "tech-precision": "left",
        organic: "left",
        editorial: "left",
        earthy: "left",
        "bold-playful": "center",
        clean: "center",
        maximalist: "center",
        minimalist: "left",
        "mission-driven": "center",
      };

      const colsMap: Record<string, 2 | 3 | 4> = {
        furniture: 2,
        fashion: 3,
        accessories: 4,
        lighting: 3,
        textiles: 3,
        health: 3,
        "personal-care": 3,
        kids: 4,
        general: 3,
      };

      const badgeMap: Record<DominantStyle, string | null> = {
        "dark-luxury": null,
        organic: "100% Natural Ingredients",
        editorial: null,
        "bold-playful": "Free Shipping Over $50",
        clean: "Clinically Tested",
        earthy: "Handcrafted with Care",
        maximalist: "New Collection",
        minimalist: null,
        "mission-driven": "B Corp Certified",
        "tech-precision": null,
      };

      const heroVariant = heroMap[style] ?? "split";
      const overlayOpacity = overlayMap[style] ?? 0;
      const isDark =
        colorScheme === "dark" ||
        style === "dark-luxury" ||
        style === "tech-precision";

      const layout = {
        heroVariant,
        heroBadge: badgeMap[style] ?? null,
        heroTextAlign: textAlignMap[style] ?? "left",
        heroCtaVariant: ctaVariantMap[style] ?? "solid",
        heroOverlayOpacity: overlayOpacity,
        sectionOrder: isDark
          ? ["hero", "benefits-bar", "product-grid", "categories", "footer"]
          : [
              "hero",
              "benefits-bar",
              "product-grid",
              "featured-collection",
              "testimonials",
              "newsletter",
              "categories",
              "footer",
            ],
        productGridColumns: colsMap[category] ?? 3,
        rationale: `${style} style for ${category} — ${heroVariant} hero`,
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
