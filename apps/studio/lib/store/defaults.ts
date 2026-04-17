import type {
  HeroConfig,
  NavConfig,
  ProductGridConfig,
  SectionType,
  StorefrontConfig,
} from "@ai-storefront/types";
import type { DesignerContainer } from "@/lib/types";
import { DEFAULT_FLEX_CONFIG, DEFAULT_GRID_CONFIG } from "@/lib/types";

function makeBlock(
  id: string,
  label: string,
  sectionType: SectionType,
): DesignerContainer {
  return {
    id,
    label,
    layoutMode: "block",
    flexConfig: { ...DEFAULT_FLEX_CONFIG },
    gridConfig: { ...DEFAULT_GRID_CONFIG },
    components: [
      { kind: "prebuilt", id: sectionType, sectionType, customClasses: "" },
    ],
  };
}

export const defaultContainers: DesignerContainer[] = [
  makeBlock("c-hero", "Hero", "hero"),
  makeBlock("c-products", "Product Grid", "product-grid"),
  makeBlock("c-categories", "Categories", "categories"),
  makeBlock("c-footer", "Footer", "footer"),
];

export const defaultPageContainers: Record<string, DesignerContainer[]> = {
  home: defaultContainers,
  products: [
    makeBlock("p-listing", "Products Listing", "products-listing"),
    makeBlock("p-footer", "Footer", "footer"),
  ],
  "product-detail": [
    makeBlock("pd-content", "Product Detail", "product-detail-content"),
    makeBlock("pd-footer", "Footer", "footer"),
  ],
  cart: [
    makeBlock("cart-body", "Cart", "cart-content"),
    makeBlock("cart-footer", "Footer", "footer"),
  ],
};

export const defaultNavConfig: NavConfig = {
  brandName: "STUDIO",
  links: [
    { id: "nav-home", label: "Home", href: "/" },
    { id: "nav-shop", label: "Shop", href: "/products" },
    { id: "nav-collections", label: "Collections", href: "/products" },
    { id: "nav-journal", label: "Journal", href: "#" },
  ],
};

export const defaultConfig: StorefrontConfig = {
  theme: {
    primaryColor: "#1a1a1a",
    secondaryColor: "#22c55e",
    borderRadius: "md",
  },
  sections: [
    { id: "hero", type: "hero", enabled: true, order: 0 },
    { id: "product-grid", type: "product-grid", enabled: true, order: 1 },
    { id: "categories", type: "categories", enabled: true, order: 2 },
    { id: "footer", type: "footer", enabled: true, order: 3 },
  ],
  hero: {
    layout: "split",
    title: "Curated Home Essentials",
    subtitle: "Discover timeless pieces for modern living",
    ctaText: "Shop Collection",
  } as HeroConfig,
  productGrid: {
    columns: 3,
    layout: "grid",
  } as ProductGridConfig,
  sectionData: {},
  nav: defaultNavConfig,
};
