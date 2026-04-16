type MaybeStylePatch = {
  backgroundColor?: string;
  textColor?: string;
  fontSize?: string;
};

type MaybeThemePatch = {
  primaryColor?: string;
  secondaryColor?: string;
  colorScheme?: "light" | "dark";
  navStyle?: "bordered" | "transparent" | "filled";
};

type AccessibilityUpdate = {
  themeChanges?: MaybeThemePatch;
  navChanges?: MaybeStylePatch;
  componentStyleChanges?: Record<string, MaybeStylePatch | undefined>;
};

type MaybeConfig = {
  theme?: {
    primaryColor?: string;
    colorScheme?: "light" | "dark";
    navStyle?: "bordered" | "transparent" | "filled";
  };
  hero?: {
    backgroundColor?: string;
    layout?: string;
    backgroundImage?: string;
  };
};

export function normalizeHex(value?: string | null): string | null {
  if (!value) return null;
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

function toLinear(channel: number): number {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function hexToRgb(value: string): [number, number, number] | null {
  const hex = normalizeHex(value);
  if (!hex) return null;
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export function contrastRatio(foreground: string, background: string): number {
  const fg = hexToRgb(foreground);
  const bg = hexToRgb(background);
  if (!fg || !bg) return 1;

  const fgLum =
    0.2126 * toLinear(fg[0]) +
    0.7152 * toLinear(fg[1]) +
    0.0722 * toLinear(fg[2]);
  const bgLum =
    0.2126 * toLinear(bg[0]) +
    0.7152 * toLinear(bg[1]) +
    0.0722 * toLinear(bg[2]);
  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);
  return (lighter + 0.05) / (darker + 0.05);
}

export function pickAccessibleTextColor(
  background: string,
  preferredText?: string,
): string {
  const bg = normalizeHex(background) ?? "#ffffff";
  const candidates = [preferredText, "#111111", "#ffffff"]
    .map((value) => normalizeHex(value))
    .filter(
      (value, index, arr): value is string =>
        Boolean(value) && arr.indexOf(value) === index,
    );

  let best = "#111111";
  let bestRatio = 0;

  for (const candidate of candidates) {
    const ratio = contrastRatio(candidate, bg);
    if (ratio > bestRatio) {
      best = candidate;
      bestRatio = ratio;
    }
    if (ratio >= 4.5) {
      return candidate;
    }
  }

  return best;
}

function ensureDistinctSurfaceColor(
  background?: string | null,
  adjacentBackground?: string | null,
): string | undefined {
  const bg = normalizeHex(background);
  const adjacent = normalizeHex(adjacentBackground);

  if (!bg) return undefined;
  if (!adjacent || bg !== adjacent) return bg;

  const isLightSurface =
    contrastRatio("#111111", bg) >= contrastRatio("#ffffff", bg);

  if (isLightSurface) {
    return bg === "#ffffff" ? "#f5f5f5" : "#ffffff";
  }

  return bg === "#0a0a0a" || bg === "#111111" ? "#171717" : "#0a0a0a";
}

function ensureStyleContrast(
  style: MaybeStylePatch | undefined,
  fallbackBackground?: string,
): MaybeStylePatch | undefined {
  if (!style) return style;

  const background =
    normalizeHex(style.backgroundColor) ?? normalizeHex(fallbackBackground);
  if (!background) return style;

  return {
    ...style,
    backgroundColor: style.backgroundColor ?? background,
    textColor: pickAccessibleTextColor(background, style.textColor),
  };
}

export function sanitizeConfigUpdateForAccessibility<
  T extends AccessibilityUpdate,
>(update: T, currentConfig?: MaybeConfig | null): T {
  const next = JSON.parse(JSON.stringify(update ?? {})) as T;
  const themeChanges = (next.themeChanges ?? {}) as MaybeThemePatch;
  const colorScheme =
    themeChanges.colorScheme ?? currentConfig?.theme?.colorScheme ?? "light";
  const navStyle =
    themeChanges.navStyle ?? currentConfig?.theme?.navStyle ?? "bordered";
  const baseBackground = colorScheme === "dark" ? "#0a0a0a" : "#ffffff";
  const filledNavBackground =
    themeChanges.primaryColor ??
    currentConfig?.theme?.primaryColor ??
    baseBackground;

  next.navChanges = ensureStyleContrast(
    next.navChanges,
    baseBackground,
  ) as T["navChanges"];

  if (next.componentStyleChanges) {
    const componentStyleChanges = {
      ...next.componentStyleChanges,
      navbar: ensureStyleContrast(
        next.componentStyleChanges.navbar,
        navStyle === "filled" ? filledNavBackground : baseBackground,
      ),
      hero: ensureStyleContrast(
        next.componentStyleChanges.hero,
        baseBackground,
      ),
      productGrid: ensureStyleContrast(
        next.componentStyleChanges.productGrid,
        baseBackground,
      ),
      categories: ensureStyleContrast(
        next.componentStyleChanges.categories,
        baseBackground,
      ),
      footer: ensureStyleContrast(
        next.componentStyleChanges.footer,
        colorScheme === "dark" ? "#0a0a0a" : "#111111",
      ),
    };

    const heroBackground =
      normalizeHex(componentStyleChanges.hero?.backgroundColor) ??
      normalizeHex(currentConfig?.hero?.backgroundColor);
    const navBackground =
      normalizeHex(componentStyleChanges.navbar?.backgroundColor) ??
      normalizeHex(next.navChanges?.backgroundColor) ??
      normalizeHex(
        navStyle === "filled" ? filledNavBackground : baseBackground,
      );

    if (heroBackground && navBackground && heroBackground === navBackground) {
      const adjustedNavBackground =
        ensureDistinctSurfaceColor(navBackground, heroBackground) ??
        navBackground;
      const adjustedNavText = pickAccessibleTextColor(
        adjustedNavBackground,
        componentStyleChanges.navbar?.textColor ?? next.navChanges?.textColor,
      );

      componentStyleChanges.navbar = {
        ...componentStyleChanges.navbar,
        backgroundColor: adjustedNavBackground,
        textColor: adjustedNavText,
      };

      next.navChanges = {
        ...(next.navChanges ?? {}),
        backgroundColor: adjustedNavBackground,
        textColor: adjustedNavText,
      } as T["navChanges"];
    }

    next.componentStyleChanges =
      componentStyleChanges as T["componentStyleChanges"];
  }

  return next;
}
