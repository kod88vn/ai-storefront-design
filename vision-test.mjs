import fs from "node:fs";
import { generateText } from "ai";

if (!process.env.AI_GATEWAY_API_KEY) {
  throw new Error("Set AI_GATEWAY_API_KEY before running this test.");
}

const image = fs.readFileSync(new URL("./delacalle1.webp", import.meta.url));
console.log("Image size:", (image.length / 1024).toFixed(1), "KB");
console.log("Calling Anthropic Claude through Vercel AI Gateway...\n");

const prompt = `You are a design analyst. Extract structured design tokens from this storefront screenshot and respond with ONLY a raw JSON object (no markdown fences):

{
  "siteCategory": "<food-delivery|fashion|footwear|beauty|electronics|home|marketplace|grocery|wellness|other>",
  "businessModel": "<marketplace|single-brand-dtc|multi-brand-retail|editorial-commerce|service-led-commerce>",
  "primaryColor": "<exact hex of dominant brand color — navbar, buttons, or headings>",
  "secondaryColor": "<exact hex of accent or CTA button color>",
  "backgroundColor": "<exact hex of the main page/canvas background color>",
  "sectionBackgroundColor": "<exact hex of the main secondary surface/background>",
  "colorScheme": "<light|dark>",
  "fontStyle": "<modern-sans|geometric-sans|humanist-sans|editorial-serif|display-serif|slab-serif|mono-tech|handwritten|condensed|rounded>",
  "navStyle": "<bordered|transparent|filled>",
  "borderRadius": "<none|sm|md|lg|xl|full>",
  "heroLayout": "<split|centered|minimal|fullbleed|editorial>",
  "productGridColumns": "<2|3|4>",
  "dominantStyle": "<dark-luxury|organic|editorial|bold-playful|clean|earthy|maximalist|minimalist|mission-driven|tech-precision>",
  "visualDensity": "<sparse|balanced|dense>",
  "ctaStyle": "<utility-first|promotion-first|brand-first|editorial-soft>",
  "imageryStyle": "<product-cutout|lifestyle|editorial-campaign|app-ui|restaurant-food|mixed>",
  "headlineTone": "<performance|premium|playful|functional|editorial|urgent>",
  "navigationDensity": "<minimal|medium|dense>",
  "sectionOrder": ["<hero>", "<category chips>", "<promo banners>", "<product grid>", "<collections>", "<social proof>", "<footer>"],
  "mood": "<2-3 word aesthetic>",
  "brandSignals": ["<3-6 short concrete signals that distinguish this experience>"],
  "observations": "<1-2 sentences on typography, sections, imagery>"
}

Rules:
- sample real hex values from the visible pixels; never use generic placeholders.
- prefer structural and commercial differences over vague adjectives.
- brandSignals must mention specific cues like restaurant cards, sticky cuisine chips, athlete imagery, monochrome product cutouts, oversized sale messaging, etc.
- Uber Eats and Nike should not produce similar outputs.`;

const { text } = await generateText({
  model: process.env.VISION_MODEL ?? "anthropic/claude-sonnet-5",
  maxOutputTokens: 600,
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: prompt },
        { type: "image", image },
      ],
    },
  ],
});

console.log("Raw response:\n" + text);

try {
  const cleaned = text.trim().replace(/^```json\s*|```\s*$/g, "");
  const parsed = JSON.parse(cleaned);
  console.log("\nParsed tokens:\n" + JSON.stringify(parsed, null, 2));
} catch {
  console.log("(could not JSON-parse response)");
}
