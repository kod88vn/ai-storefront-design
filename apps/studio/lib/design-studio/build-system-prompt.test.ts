import { defaultConfig } from "@/lib/store/defaults";
import { buildSystemPrompt } from "./build-system-prompt";

describe("buildSystemPrompt", () => {
  const baseContext = {
    currentConfig: {
      ...defaultConfig,
      theme: {
        ...defaultConfig.theme,
        navStyle: "transparent",
        fontStyle: "editorial-serif",
        colorScheme: "dark",
      },
      productGrid: {
        ...defaultConfig.productGrid,
        columns: 2,
        layout: "list",
      },
    },
  } as any;

  const baseSkills = [
    { name: "planner", content: "1. Call plan_feedback first." },
    { name: "layout_planner", content: "Prefer list for dense discovery catalogs." },
  ] as any;

  const baseTools = [
    { name: "plan_feedback", description: "Gather approval", inputSchema: { type: "object" } },
    { name: "apply_config_update", description: "Apply the approved plan", inputSchema: { type: "object" } },
  ] as any;

  it("includes the active page config summary including list merchandising mode", () => {
    const prompt = buildSystemPrompt({
      context: baseContext,
      skills: baseSkills,
      mcpTools: baseTools,
      preComputedTokens: "",
      visionFailed: false,
    });

    expect(prompt).toContain("hero: split layout");
    expect(prompt).toContain("cta=Shop Collection -> /products");
    expect(prompt).toContain("nav=transparent");
    expect(prompt).toContain("scheme=dark");
    expect(prompt).toContain("grid: 2 columns, list mode");
    expect(prompt).toContain("Update the hero CTA labels and links");
  });

  it("adds explicit rejection instructions for the HITL revision loop", () => {
    const prompt = buildSystemPrompt({
      context: {
        ...baseContext,
        planFeedback: {
          approved: false,
          modifications: "make it lighter and less dense",
        },
      } as any,
      skills: baseSkills,
      mcpTools: baseTools,
      preComputedTokens: "",
      visionFailed: false,
    });

    expect(prompt).toContain("The user rejected the plan");
    expect(prompt).toContain("make it lighter and less dense");
    expect(prompt).toContain("Do NOT call apply_config_update yet");
  });
});
