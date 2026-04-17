import { sanitizeConfigUpdateForAccessibility } from "@/lib/design-studio/accessibility";
import { readStoreConfig } from "@/lib/store-config";
import {
  type DominantStyle,
  type HeroLayout,
  type ProductGridLayout,
} from "@ai-storefront/types";

import type { MCPToolResult } from "./types";

function textResult(payload: unknown): MCPToolResult {
  return { content: [{ type: "text", text: JSON.stringify(payload) }] };
}

function normalizeHex(value: string): string | null {
  const trimmed = value.trim();
  if (/^#[0-9a-fA-F]{3}$/.test(trimmed)) {
    return `#${trimmed
      .slice(1)
      .split("")
      .map((char) => char + char)
      .join("")}`.toLowerCase();
  }
  if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
    return trimmed.toLowerCase();
  }
  return null;
}

function isDarkColor(value: string): boolean {
  const hex = normalizeHex(value);
  if (!hex) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance < 0.45;
}

function isNeutralColor(value: string): boolean {
  const hex = normalizeHex(value);
  if (!hex) return true;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return Math.max(r, g, b) - Math.min(r, g, b) < 20;
}

function colorSaturation(value: string): number {
  const hex = normalizeHex(value);
  if (!hex) return 0;
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (max === min) return 0;
  const lightness = (max + min) / 2;
  const delta = max - min;
  return delta / (1 - Math.abs(2 * lightness - 1));
}

function isVeryLightColor(value: string): boolean {
  const hex = normalizeHex(value);
  if (!hex) return false;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.8;
}

function defaultPaletteForStyle(style: DominantStyle): [string, string] {
  switch (style) {
    case "dark-luxury":
      return ["#0a0a0a", "#c9a84c"];
    case "organic":
      return ["#2d4a22", "#7cb87a"];
    case "editorial":
      return ["#1a1a1a", "#e8b84b"];
    case "bold-playful":
      return ["#1a1a1a", "#f97316"];
    case "clean":
      return ["#0f4c35", "#22c55e"];
    case "earthy":
      return ["#3d2b1f", "#a16207"];
    case "maximalist":
      return ["#111827", "#a855f7"];
    case "mission-driven":
      return ["#1e3a5f", "#0ea5e9"];
    case "tech-precision":
      return ["#0f172a", "#3b82f6"];
    case "minimalist":
    default:
      return ["#111827", "#6366f1"];
  }
}

async function extractUrlSignals(source: string): Promise<{
  signalText: string;
  discoveredColors: string[];
}> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);
    const response = await fetch(source, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; AIStorefrontAnalyzer/1.0)",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return { signalText: source, discoveredColors: [] };
    }

    const html = await response.text();
    const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? "";
    const metaDescription =
      html.match(
        /<meta[^>]+(?:name|property)=["'](?:description|og:description|twitter:description)["'][^>]+content=["']([^"']+)["']/i,
      )?.[1] ?? "";
    const themeColor =
      html.match(
        /<meta[^>]+name=["']theme-color["'][^>]+content=["']([^"']+)["']/i,
      )?.[1] ?? "";
    const bodyText = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 6000);

    const discoveredColors = Array.from(
      new Set(
        [
          themeColor,
          ...Array.from(
            html.matchAll(/#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/g),
          ).map((match) => match[0]),
        ]
          .map((value) => normalizeHex(value ?? ""))
          .filter((value): value is string => Boolean(value)),
      ),
    ).slice(0, 8);

    return {
      signalText: [source, title, metaDescription, bodyText].join(" "),
      discoveredColors,
    };
  } catch {
    return { signalText: source, discoveredColors: [] };
  }
}

async function analyzeVisionInput(
  args: Record<string, unknown>,
): Promise<MCPToolResult> {
  const source = String(args.source ?? "");
  const isUrl = source.startsWith("http");

  const { signalText, discoveredColors } = isUrl
    ? await extractUrlSignals(source)
    : { signalText: source, discoveredColors: [] };

  const isLuxury =
    /lux|premium|jewel|haute|bespoke|craftsmanship|finest sound|unrivalled design|master\s*&\s*dynamic|tumi|designer|immersive sound/i.test(
      signalText,
    ) || /sale price\$\s*([4-9]\d{2}|\d{4,})/i.test(signalText);
  const isDark = /dark|black|noir|obsidian|gunmetal|midnight|graphite/i.test(
    signalText,
  );
  const isTech =
    /tech|saas|app|software|digital|hardware|spec|firmware|gaming/i.test(
      signalText,
    );
  const isArtisan = /craft|artisan|hand|maker|journal|studio/i.test(signalText);
  const isOrganic = /organic|natural|plant|soap|herb|earth|eco/i.test(
    signalText,
  );
  const isEarthy = /rustic|earthy|wood|terra|grain|leather/i.test(signalText);
  const isPlayful = /playful|colorful|bold|sport|active|wellness|kids/i.test(
    signalText,
  );
  const isHealth = /health|supplement|vitamin|clinical|medical/i.test(
    signalText,
  );
  const isMission = /mission|cause|sustainable|united|planet/i.test(signalText);

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
  const fontStyle =
    dominantStyle === "tech-precision"
      ? "mono-tech"
      : dominantStyle === "editorial" || dominantStyle === "mission-driven"
        ? "editorial-serif"
        : "modern-sans";

  const fallbackPalette = defaultPaletteForStyle(dominantStyle);
  const primaryColors = discoveredColors.length
    ? discoveredColors
    : [...fallbackPalette, colorScheme === "dark" ? "#f5f5f5" : "#111827"];

  return textResult({
    primaryColors,
    fontStack:
      fontStyle === "editorial-serif" ? "Georgia, serif" : "Inter, sans-serif",
    fontStyle,
    layoutType: isLuxury ? "fullbleed" : isArtisan ? "editorial" : "centered",
    borderRadius:
      isLuxury || isTech || isArtisan ? "none" : isPlayful ? "full" : "md",
    dominantStyle,
    colorScheme,
    navStyle,
    targetAesthetic,
    sectionOrder: ["hero", "product-grid", "categories", "footer"],
    sourceType: isUrl ? "url" : "description",
  });
}

function generateTheme(args: Record<string, unknown>): MCPToolResult {
  const style = String(args.dominantStyle ?? "minimalist") as DominantStyle;
  const aesthetic = String(args.targetAesthetic ?? "organic");
  const colorScheme = String(args.colorScheme ?? "light") as "light" | "dark";
  const navStyleInput = String(args.navStyle ?? "");
  const extractedColors = Array.isArray(args.primaryColors)
    ? args.primaryColors
        .map((value) => normalizeHex(String(value ?? "")))
        .filter((value): value is string => Boolean(value))
    : [];

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

  const preset = presets[style] ?? presets.minimalist;
  const darkCandidate = extractedColors.find((value) => isDarkColor(value));
  const mutedCandidate = extractedColors.find(
    (value) =>
      !isVeryLightColor(value) &&
      colorSaturation(value) >= 0.08 &&
      colorSaturation(value) <= 0.45,
  );
  const headingCandidate = extractedColors.find(
    (value) =>
      !isVeryLightColor(value) &&
      (isDarkColor(value) || colorSaturation(value) <= 0.35),
  );
  const accentCandidate = extractedColors.find(
    (value) =>
      value !== darkCandidate &&
      !isVeryLightColor(value) &&
      colorSaturation(value) >= 0.2,
  );
  const vividCandidate = extractedColors.find(
    (value) => !isVeryLightColor(value) && colorSaturation(value) >= 0.35,
  );

  const primaryColor =
    colorScheme === "dark" ||
    style === "dark-luxury" ||
    style === "tech-precision"
      ? (darkCandidate ??
        mutedCandidate ??
        vividCandidate ??
        extractedColors[0] ??
        preset.primary)
      : (headingCandidate ?? mutedCandidate ?? darkCandidate ?? preset.primary);
  const secondaryColor =
    extractedColors.find(
      (value) =>
        value !== primaryColor &&
        !isVeryLightColor(value) &&
        colorSaturation(value) >= 0.2,
    ) ??
    accentCandidate ??
    aestheticAccent[aesthetic] ??
    preset.secondary;

  return textResult({
    primaryColor,
    secondaryColor,
    borderRadius: preset.radius,
    navStyle: (navStyleInput || preset.nav) as
      | "bordered"
      | "transparent"
      | "filled",
    colorScheme: colorScheme || preset.scheme,
    fontStyle: preset.font,
    rationale:
      extractedColors.length > 0
        ? `${style} theme grounded in extracted reference palette with accent colors kept proportional`
        : `${style} preset — ${aesthetic} accent`,
  });
}

function planLayout(args: Record<string, unknown>): MCPToolResult {
  const category = String(args.productCategory ?? "general");
  const style = String(args.dominantStyle ?? "minimalist") as DominantStyle;
  const colorScheme = String(args.colorScheme ?? "light");
  const visualDensity = String(args.visualDensity ?? "balanced");
  const ctaStyle = String(args.ctaStyle ?? "brand-first");

  const heroCta =
    ctaStyle === "utility-first"
      ? {
          heroCtaText: "Compare Top Picks",
          heroCtaHref: "/products",
          heroSecondaryCtaText: "View Cart",
          heroSecondaryCtaHref: "/cart",
        }
      : ctaStyle === "promotion-first"
        ? {
            heroCtaText: "Shop the Offer",
            heroCtaHref: "/products",
            heroSecondaryCtaText: "View Cart",
            heroSecondaryCtaHref: "/cart",
          }
        : ctaStyle === "editorial-soft"
          ? {
              heroCtaText: "View Collection",
              heroCtaHref: "/products",
              heroSecondaryCtaText: "View Cart",
              heroSecondaryCtaHref: "/cart",
            }
          : {
              heroCtaText: "Explore Collection",
              heroCtaHref: "/products",
              heroSecondaryCtaText: "View Cart",
              heroSecondaryCtaHref: "/cart",
            };

  const heroMap: Record<DominantStyle, HeroLayout> = {
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

  const ctaVariantMap: Record<DominantStyle, "solid" | "outline" | "ghost"> = {
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

  const isDark =
    colorScheme === "dark" ||
    style === "dark-luxury" ||
    style === "tech-precision";

  const isComparisonHeavy = /electronics|tech|health|supplement|furniture|lighting/i.test(
    category,
  );
  const productGridLayout: ProductGridLayout =
    visualDensity === "dense" ||
    ctaStyle === "utility-first" ||
    (isComparisonHeavy && style !== "bold-playful" && style !== "editorial")
      ? "list"
      : "grid";

  return textResult({
    heroVariant: heroMap[style] ?? "split",
    heroBadge: badgeMap[style] ?? null,
    heroTextAlign: textAlignMap[style] ?? "left",
    heroCtaVariant: ctaVariantMap[style] ?? "solid",
    heroOverlayOpacity: overlayMap[style] ?? 0,
    ...heroCta,
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
    productGridLayout,
    rationale: `${style} style for ${category} — ${heroMap[style] ?? "split"} hero with ${productGridLayout} merchandising`,
  });
}

async function getStorefrontConfig(): Promise<MCPToolResult> {
  const config = await readStoreConfig();
  return textResult(config);
}

async function applyConfigUpdate(
  args: Record<string, unknown>,
): Promise<MCPToolResult> {
  const currentConfig = await readStoreConfig().catch(() => null);
  const applied = sanitizeConfigUpdateForAccessibility(args, currentConfig);
  return textResult({ success: true, applied });
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
): Promise<MCPToolResult> {
  switch (name) {
    case "analyze_vision_input":
      return await analyzeVisionInput(args);
    case "generate_theme":
      return generateTheme(args);
    case "plan_layout":
      return planLayout(args);
    case "get_storefront_config":
      return getStorefrontConfig();
    case "apply_config_update":
      return await applyConfigUpdate(args);
    default:
      return textResult({ error: `Unknown tool: ${name}` });
  }
}
