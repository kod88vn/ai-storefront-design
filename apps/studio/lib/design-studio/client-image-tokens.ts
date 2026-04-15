import type { UploadedImageTokens } from "@/lib/types";

type RgbBucket = {
  r: number;
  g: number;
  b: number;
  count: number;
  lum: number;
  sat: number;
};

function toHex(value: number): string {
  return value.toString(16).padStart(2, "0");
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

function luminance(r: number, g: number, b: number): number {
  return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
}

function saturation(r: number, g: number, b: number): number {
  const max = Math.max(r, g, b) / 255;
  const min = Math.min(r, g, b) / 255;
  if (max === min) return 0;
  const lightness = (max + min) / 2;
  const delta = max - min;
  return delta / (1 - Math.abs(2 * lightness - 1));
}

function hue(r: number, g: number, b: number): number {
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  if (delta === 0) return 0;
  if (max === rn) return ((gn - bn) / delta + (gn < bn ? 6 : 0)) * 60;
  if (max === gn) return ((bn - rn) / delta + 2) * 60;
  return ((rn - gn) / delta + 4) * 60;
}

function quantize(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value / 24) * 24));
}

function sampleWeight(
  x: number,
  y: number,
  width: number,
  height: number,
): number {
  let weight = 1;

  if (y < height * 0.18) weight *= 0.35;
  else if (y < height * 0.3) weight *= 0.75;

  if (x < width * 0.08 || x > width * 0.92) weight *= 0.9;

  return weight;
}

function pickDominantStyle(
  primary: RgbBucket,
  accent: RgbBucket,
  colorScheme: "light" | "dark",
): NonNullable<UploadedImageTokens["dominantStyle"]> {
  const accentHue = hue(accent.r, accent.g, accent.b);

  if (colorScheme === "dark") {
    if (accentHue >= 35 && accentHue <= 65) return "dark-luxury";
    if (accentHue >= 190 && accentHue <= 250) return "tech-precision";
    return "dark-luxury";
  }

  const primaryHue = hue(primary.r, primary.g, primary.b);
  if (accentHue >= 85 && accentHue <= 160) return "organic";
  if (accentHue >= 15 && accentHue <= 40) return "earthy";
  if (accentHue >= 300 || accentHue <= 15) return "bold-playful";
  if (primaryHue >= 35 && primaryHue <= 70) return "editorial";
  return "clean";
}

export async function extractImageTokensFromDataUrl(
  dataUrl: string,
): Promise<UploadedImageTokens | null> {
  return new Promise((resolve) => {
    const img = new Image();

    img.onload = () => {
      const canvas = document.createElement("canvas");
      const maxSide = 64;
      const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
      canvas.width = Math.max(1, Math.round(img.width * scale));
      canvas.height = Math.max(1, Math.round(img.height * scale));

      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) {
        resolve(null);
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const buckets = new Map<string, RgbBucket>();

      let pixelCount = 0;
      let luminanceSum = 0;

      for (let i = 0; i < data.length; i += 16) {
        const alpha = data[i + 3];
        if (alpha < 200) continue;

        const pixelIndex = i / 4;
        const x = pixelIndex % canvas.width;
        const y = Math.floor(pixelIndex / canvas.width);
        const weight = sampleWeight(x, y, canvas.width, canvas.height);

        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        const lum = luminance(r, g, b);
        const sat = saturation(r, g, b);

        pixelCount += weight;
        luminanceSum += lum * weight;

        const qr = quantize(r);
        const qg = quantize(g);
        const qb = quantize(b);
        const key = `${qr},${qg},${qb}`;

        const existing = buckets.get(key);
        if (existing) {
          existing.count += weight;
        } else {
          buckets.set(key, { r: qr, g: qg, b: qb, count: weight, lum, sat });
        }
      }

      const sorted = [...buckets.values()].sort((a, b) => b.count - a.count);
      const fallback = { r: 17, g: 17, b: 17, count: 1, lum: 0.07, sat: 0 };
      const background = sorted[0] ?? fallback;
      const avgLum =
        pixelCount > 0 ? luminanceSum / pixelCount : background.lum;
      const colorScheme: "light" | "dark" = avgLum < 0.52 ? "dark" : "light";

      const darkCandidate =
        sorted.find((bucket) => bucket.lum < 0.4) ?? background;
      const neutralCandidate =
        sorted.find((bucket) => bucket.lum < 0.5 && bucket.sat < 0.28) ??
        darkCandidate;
      const mutedBrandCandidate =
        sorted.find(
          (bucket) =>
            bucket.lum < 0.62 && bucket.sat >= 0.08 && bucket.sat <= 0.45,
        ) ?? neutralCandidate;
      const vividCandidate =
        sorted.find(
          (bucket) =>
            bucket.sat > 0.24 &&
            Math.abs(bucket.lum - background.lum) > 0.06 &&
            bucket.count < background.count * 0.9,
        ) ??
        sorted.find((bucket) => bucket.sat > 0.12 && bucket !== background) ??
        sorted[1] ??
        background;

      const primary =
        colorScheme === "dark"
          ? darkCandidate
          : (mutedBrandCandidate ?? background);
      const secondary =
        vividCandidate === primary
          ? (sorted.find((bucket) => bucket !== primary) ?? background)
          : vividCandidate;
      const dominantStyle = pickDominantStyle(primary, secondary, colorScheme);

      resolve({
        primaryColor: rgbToHex(primary.r, primary.g, primary.b),
        secondaryColor: rgbToHex(secondary.r, secondary.g, secondary.b),
        backgroundColor: rgbToHex(background.r, background.g, background.b),
        sectionBackgroundColor: rgbToHex(
          background.r,
          background.g,
          background.b,
        ),
        colorScheme,
        dominantStyle,
        fontStyle:
          dominantStyle === "tech-precision"
            ? "mono-tech"
            : dominantStyle === "editorial"
              ? "editorial-serif"
              : "modern-sans",
        navStyle: colorScheme === "dark" ? "transparent" : "bordered",
        borderRadius:
          dominantStyle === "dark-luxury" || dominantStyle === "tech-precision"
            ? "none"
            : dominantStyle === "bold-playful"
              ? "full"
              : "md",
        heroLayout:
          dominantStyle === "dark-luxury" || dominantStyle === "tech-precision"
            ? "editorial"
            : canvas.width > canvas.height * 1.15
              ? "split"
              : "centered",
        productGridColumns: 3,
        mood: colorScheme === "dark" ? "high-contrast premium" : "clean modern",
        observations:
          colorScheme === "dark"
            ? "Dark-led screenshot with strong contrast and premium emphasis."
            : "Light-led screenshot with a clean, modern retail feel.",
      });
    };

    img.onerror = () => resolve(null);
    img.src = dataUrl;
  });
}
