import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { StorefrontPreview, StorefrontProductGrid } from "@ai-storefront/storefront-components";
import { defaultConfig } from "@/lib/store/defaults";
import { PrebuiltEditor } from "./prebuilt-editor";

describe("StorefrontProductGrid list mode", () => {
  it("renders products in list layout when configured", () => {
    render(
      <StorefrontProductGrid
        config={{ columns: 3, layout: "list", heading: "Featured Products" }}
        theme={{
          primaryColor: "#111827",
          secondaryColor: "#f59e0b",
          borderRadius: "md",
          colorScheme: "light",
        }}
      />,
    );

    expect(screen.getByTestId("storefront-product-list")).toBeInTheDocument();
  });

  it("mutes the columns control in list mode", () => {
    render(
      <PrebuiltEditor
        comp={{ kind: "prebuilt", id: "pg-1", sectionType: "product-grid", customClasses: "" }}
        containerId="c-1"
      />,
    );

    fireEvent.change(screen.getByTestId("product-grid-layout-select"), {
      target: { value: "list" },
    });

    const columns = screen.getByTestId("product-grid-columns-select");
    expect(columns).toBeDisabled();
  });

  it("switches the preview from a 3-column grid to stacked list rows", () => {
    const config = {
      ...defaultConfig,
      sections: [{ id: "pg", type: "product-grid", enabled: true, order: 0 }],
      productGrid: { ...defaultConfig.productGrid, columns: 3 as const, layout: "grid" as const },
    };

    const { rerender } = render(<StorefrontPreview config={config} />);

    const cards = screen.getByTestId("storefront-product-cards");
    expect(cards.className).toContain("lg:grid-cols-3");

    rerender(
      <StorefrontPreview
        config={{
          ...config,
          productGrid: { ...config.productGrid, layout: "list" as const },
        }}
      />,
    );

    expect(screen.queryByTestId("storefront-product-cards")).not.toBeInTheDocument();
    expect(screen.getByTestId("storefront-product-list")).toBeInTheDocument();
    expect(screen.getAllByTestId("storefront-product-list-item").length).toBeGreaterThan(0);
  });
});
