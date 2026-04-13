import fs from "fs";

const img = fs.readFileSync("delacalle1.webp");
const b64 = img.toString("base64");
const dataUrl = `data:image/webp;base64,${b64}`;

console.log("Image size:", (img.length / 1024).toFixed(1), "KB");
console.log("Calling grok-2-vision-1212...\n");

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

const res = await fetch("https://api.x.ai/v1/chat/completions", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.XAI_API_KEY}`,
  },
  body: JSON.stringify({
    model: "grok-4-0709",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: prompt },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
    max_tokens: 600,
  }),
});

const data = await res.json();

if (data.error) {
  console.error("API error:", JSON.stringify(data.error, null, 2));
  process.exit(1);
}

const text = data.choices?.[0]?.message?.content ?? "";
console.log("Raw response:\n" + text);

try {
  const cleaned = text.trim().replace(/^```json\s*|```\s*$/g, "");
  const parsed = JSON.parse(cleaned);
  console.log("\nParsed tokens:\n" + JSON.stringify(parsed, null, 2));
} catch {
  console.log("(could not JSON-parse response)");
}
