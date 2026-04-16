const FALLBACK_DARK = "#171717";
const FALLBACK_LIGHT = "#ffffff";

export function normalizeHex(value?: string | null): string | undefined {
  if (!value) return undefined;
  const trimmed = value.trim();
  const match = trimmed.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if (!match) return undefined;
  const hex = match[1];
  if (hex.length === 3) {
    return `#${hex[0]}${hex[0]}${hex[1]}${hex[1]}${hex[2]}${hex[2]}`.toLowerCase();
  }
  return `#${hex}`.toLowerCase();
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex) ?? FALLBACK_DARK;
  const value = normalized.slice(1);
  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function toLinear(channel: number) {
  const normalized = channel / 255;
  return normalized <= 0.03928
    ? normalized / 12.92
    : ((normalized + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string) {
  const { r, g, b } = hexToRgb(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(
  foreground?: string | null,
  background?: string | null,
) {
  const fg = normalizeHex(foreground) ?? FALLBACK_DARK;
  const bg = normalizeHex(background) ?? FALLBACK_LIGHT;
  const lighter = Math.max(luminance(fg), luminance(bg));
  const darker = Math.min(luminance(fg), luminance(bg));
  return Number(((lighter + 0.05) / (darker + 0.05)).toFixed(2));
}

export function pickAccessibleTextColor(
  background: string,
  preferred?: string | null,
  minRatio = 4.5,
) {
  const bg = normalizeHex(background) ?? FALLBACK_LIGHT;
  const candidates = [
    normalizeHex(preferred),
    FALLBACK_DARK,
    FALLBACK_LIGHT,
  ].filter(Boolean) as string[];

  let best = candidates[0] ?? FALLBACK_DARK;
  let bestRatio = 0;

  for (const candidate of candidates) {
    const ratio = contrastRatio(candidate, bg);
    if (ratio >= minRatio) return candidate;
    if (ratio > bestRatio) {
      best = candidate;
      bestRatio = ratio;
    }
  }

  return best;
}

export function pickAccessibleAccentColor(
  background: string,
  preferred?: string | null,
  minRatio = 3,
) {
  return pickAccessibleTextColor(background, preferred, minRatio);
}

export function ensureDistinctSurfaceColor(
  background?: string | null,
  adjacentBackground?: string | null,
) {
  const bg = normalizeHex(background);
  const adjacent = normalizeHex(adjacentBackground);

  if (!bg) return undefined;
  if (!adjacent || bg !== adjacent) return bg;

  const isLightSurface = contrastRatio("#111111", bg) >= contrastRatio("#ffffff", bg);

  if (isLightSurface) {
    return bg === "#ffffff" ? "#f5f5f5" : "#ffffff";
  }

  return bg === "#0a0a0a" || bg === "#111111" ? "#171717" : "#0a0a0a";
}
