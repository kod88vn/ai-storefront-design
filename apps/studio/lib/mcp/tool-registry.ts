import {
  BORDER_RADII,
  COLOR_SCHEMES,
  DOMINANT_STYLES,
  FONT_STYLES,
  HERO_LAYOUTS,
  NAV_STYLES,
  PRODUCT_GRID_LAYOUTS,
  SOURCE_LAYOUT_TYPES,
} from "@ai-storefront/types";

import type { MCPTool } from "./types";

export const TOOLS: MCPTool[] = [
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
          enum: COLOR_SCHEMES,
          description: "Detected or desired color scheme",
        },
        navStyle: {
          type: "string",
          enum: NAV_STYLES,
          description: "Detected or desired navbar style",
        },
      },
      required: ["dominantStyle"],
    },
  },
  {
    name: "plan_layout",
    description:
      "Determine the optimal hero variant, section order, product grid columns, product grid layout mode, hero micro-parameters, and action-oriented CTA suggestions given product category and style signals.",
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
        visualDensity: {
          type: "string",
          enum: ["sparse", "balanced", "dense"],
        },
        ctaStyle: {
          type: "string",
          enum: [
            "utility-first",
            "promotion-first",
            "brand-first",
            "editorial-soft",
          ],
        },
      },
      required: ["dominantStyle"],
    },
  },
  {
    name: "get_storefront_config",
    description:
      "Read the current StorefrontConfig (theme, hero, sections, nav, productGrid, categories, footer, pages). Use this to inspect the live configuration before proposing changes.",
    inputSchema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "apply_config_update",
    description:
      "Apply a design patch to the StorefrontConfig. Validates the patch and returns it so the orchestrator can stream a config_update event to the UI. Call this after plan_feedback is approved. Always include componentStyleChanges.navbar.backgroundColor.",
    inputSchema: {
      type: "object",
      properties: {
        themeChanges: {
          type: "object",
          properties: {
            primaryColor: { type: "string" },
            secondaryColor: { type: "string" },
            borderRadius: {
              type: "string",
              enum: BORDER_RADII,
            },
            navStyle: {
              type: "string",
              enum: NAV_STYLES,
            },
            colorScheme: { type: "string", enum: COLOR_SCHEMES },
            fontStyle: {
              type: "string",
              enum: FONT_STYLES,
            },
          },
        },
        heroChanges: {
          type: "object",
          properties: {
            layout: {
              type: "string",
              enum: HERO_LAYOUTS,
            },
            title: { type: "string" },
            subtitle: { type: "string" },
            badge: { type: "string" },
            textAlign: { type: "string", enum: ["left", "center"] },
            ctaVariant: { type: "string", enum: ["solid", "outline", "ghost"] },
            overlayOpacity: { type: "number" },
            ctaText: { type: "string" },
            ctaHref: { type: "string" },
            ctaSecondaryText: { type: "string" },
            ctaSecondaryHref: { type: "string" },
          },
        },
        productGridColumns: { type: "number", enum: [2, 3, 4] },
        productGridLayout: { type: "string", enum: PRODUCT_GRID_LAYOUTS },
        sectionOrder: { type: "array", items: { type: "string" } },
        enableSections: { type: "array", items: { type: "string" } },
        disableSections: { type: "array", items: { type: "string" } },
        sectionData: { type: "object" },
        componentStyleChanges: {
          type: "object",
          properties: {
            navbar: {
              type: "object",
              properties: {
                backgroundColor: {
                  type: "string",
                  description:
                    "Navbar background hex. For bordered navs: page background color. For filled: primaryColor.",
                },
                textColor: { type: "string" },
                fontSize: { type: "string", enum: ["sm", "base", "lg", "xl"] },
              },
            },
            hero: {
              type: "object",
              properties: {
                backgroundColor: { type: "string" },
                textColor: { type: "string" },
                fontSize: { type: "string" },
              },
            },
            productGrid: {
              type: "object",
              properties: {
                layout: { type: "string", enum: PRODUCT_GRID_LAYOUTS },
                backgroundColor: { type: "string" },
                textColor: { type: "string" },
                fontSize: { type: "string" },
              },
            },
            categories: {
              type: "object",
              properties: {
                backgroundColor: { type: "string" },
                textColor: { type: "string" },
                fontSize: { type: "string" },
              },
            },
            footer: {
              type: "object",
              properties: {
                backgroundColor: { type: "string" },
                textColor: { type: "string" },
                fontSize: { type: "string" },
              },
            },
          },
        },
      },
      required: [],
    },
  },
];
