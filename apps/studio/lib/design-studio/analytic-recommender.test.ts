import { buildAnalyticBaseline, synthesizeGoal, toDirectives } from "./analytic-recommender";

describe("analytic recommender", () => {
  it("maps dense electronics flows to a list-based utility-first baseline", () => {
    const answers = {
      category: "Electronics & Tech",
      personality: "Professional & Clinical",
      mood: "Cool & Professional",
      typography: "Technical & Precise",
      focus: "Product discovery",
      density: "Dense discovery",
      merchandising: "Social proof + trust",
      heroTreatment: "Centered conversion hero",
    };

    const directives = toDirectives(answers);
    const baseline = buildAnalyticBaseline(answers);

    expect(directives.productGridLayout).toBe("list");
    expect(directives.ctaStyle).toBe("utility-first");
    expect(baseline.theme.fontStyle).toBe("mono-tech");
    expect(baseline.productGrid.layout).toBe("list");
    expect(baseline.productGrid.columns).toBe(4);
    expect(baseline.sectionOrder.slice(0, 3)).toEqual([
      "hero",
      "categories",
      "product-grid",
    ]);
  });

  it("keeps premium storytelling flows editorial and brand-led", () => {
    const answers = {
      category: "Fashion & Apparel",
      personality: "Luxury & High-end",
      mood: "Dark & Moody",
      typography: "Editorial & Refined",
      focus: "Brand storytelling",
      density: "Spacious premium",
      merchandising: "Collections + editorial curation",
      heroTreatment: "Editorial storytelling",
    };

    const baseline = buildAnalyticBaseline(answers);
    const goal = synthesizeGoal(answers);

    expect(baseline.theme.colorScheme).toBe("dark");
    expect(baseline.theme.navStyle).toBe("transparent");
    expect(baseline.hero.layout).toBe("editorial");
    expect(baseline.productGrid.layout).toBe("grid");
    expect(baseline.productGrid.columns).toBe(2);
    expect(goal).toContain("heroLayout: editorial");
    expect(goal).toContain("productGridLayout: grid");
  });
});
