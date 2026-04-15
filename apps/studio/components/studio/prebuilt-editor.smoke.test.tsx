/**
 * Smoke tests: catch "undefined identifier used in render" and
 * "named export missing from shared utils" bugs without testing functionality.
 */
import React from "react";
import { render } from "@testing-library/react";

import {
  ColorRow,
  Field,
  FONT_SIZES,
  inputCls,
  labelCls,
  selectCls,
} from "./prebuilt-editor-shared";
import { PrebuiltEditor } from "./prebuilt-editor";
import type { SectionType } from "@ai-storefront/types";

// ─── Shared exports ────────────────────────────────────────────────────────────
// If any of these fail, a named export was removed or renamed in the shared file.

describe("prebuilt-editor-shared exports", () => {
  it("inputCls is a string", () => expect(typeof inputCls).toBe("string"));
  it("selectCls is a string", () => expect(typeof selectCls).toBe("string"));
  it("labelCls is a string", () => expect(typeof labelCls).toBe("string"));
  it("FONT_SIZES is a non-empty array", () => {
    expect(Array.isArray(FONT_SIZES)).toBe(true);
    expect(FONT_SIZES.length).toBeGreaterThan(0);
  });
  it("Field is a function", () => expect(typeof Field).toBe("function"));
  it("ColorRow is a function", () => expect(typeof ColorRow).toBe("function"));
});

// ─── Editor render smoke tests ─────────────────────────────────────────────────
// Rendering each section type catches undefined-identifier bugs inside JSX
// (e.g. using `labelCls` in a component that forgot to import it).

describe("PrebuiltEditor renders without crashing", () => {
  function smoke(sectionType: SectionType) {
    const comp = {
      kind: "prebuilt" as const,
      id: "smoke-1",
      sectionType,
      customClasses: "",
    };
    return () => render(<PrebuiltEditor comp={comp} containerId="c0" />);
  }

  it("hero", () => expect(smoke("hero")).not.toThrow());
  it("product-grid", () => expect(smoke("product-grid")).not.toThrow());
  it("categories", () => expect(smoke("categories")).not.toThrow());
  it("footer", () => expect(smoke("footer")).not.toThrow());
  it("products-listing", () =>
    expect(smoke("products-listing")).not.toThrow());
  it("product-detail-content", () =>
    expect(smoke("product-detail-content")).not.toThrow());
  it("cart-content", () => expect(smoke("cart-content")).not.toThrow());
});
