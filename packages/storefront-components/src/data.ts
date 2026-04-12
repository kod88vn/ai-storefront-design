import type { Category, NavConfig, Product } from "@ai-storefront/types";

export const sampleCategories: Category[] = [
  { id: "c1", name: "Lighting", slug: "lighting" },
  { id: "c2", name: "Decor", slug: "decor" },
  { id: "c3", name: "Textiles", slug: "textiles" },
  { id: "c4", name: "Furniture", slug: "furniture" },
];

export const sampleProducts: Product[] = [
  {
    id: "p1",
    title: "Arc Floor Lamp",
    price: 189,
    image:
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=600&h=600&fit=crop",
    category: "lighting",
    badge: "New",
    rating: 4.7,
    reviewCount: 112,
    description:
      "A sculptural arc lamp that casts warm, diffused light over your living space. Handcrafted from brushed brass with a linen shade.",
    images: [
      "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&h=800&fit=crop",
      "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&h=800&fit=crop",
    ],
  },
  {
    id: "p2",
    title: "Linen Throw Pillow",
    price: 39,
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
    category: "textiles",
    badge: "Best Seller",
    rating: 4.8,
    reviewCount: 241,
    description:
      "Belgian linen throw pillow filled with premium feather-down insert. Machine washable cover in a natural, undyed hue.",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop",
    ],
  },
  {
    id: "p3",
    title: "Walnut Coffee Table",
    price: 329,
    image:
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=600&h=600&fit=crop",
    category: "furniture",
    rating: 4.6,
    reviewCount: 78,
    description:
      "Solid walnut coffee table with hairpin legs. Each piece is unique — the natural grain pattern varies. FSC certified wood.",
    images: [
      "https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=800&h=800&fit=crop",
    ],
  },
  {
    id: "p4",
    title: "Ceramic Vase Set",
    price: 79,
    image:
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&h=600&fit=crop",
    category: "decor",
    rating: 4.5,
    reviewCount: 94,
    description:
      "Set of three hand-thrown ceramic vases in varying heights. Food-safe glaze in warm stone tones.",
    images: [
      "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=800&fit=crop",
    ],
  },
  {
    id: "p5",
    title: "Wool Area Rug",
    price: 249,
    image:
      "https://images.unsplash.com/photo-1600166898405-da9535204843?w=600&h=600&fit=crop",
    category: "textiles",
    badge: "Sale",
    rating: 4.4,
    reviewCount: 56,
    description:
      "Hand-woven New Zealand wool rug with a subtle geometric weave. Non-slip backing included.",
    images: [
      "https://images.unsplash.com/photo-1600166898405-da9535204843?w=800&h=800&fit=crop",
    ],
  },
  {
    id: "p6",
    title: "Pendant Ceiling Light",
    price: 159,
    image:
      "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=600&h=600&fit=crop",
    category: "lighting",
    rating: 4.7,
    reviewCount: 63,
    description:
      "Blown-glass pendant in an amber hue. Includes 3m braided fabric cord and ceiling rose.",
    images: [
      "https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=800&h=800&fit=crop",
    ],
  },
  {
    id: "p7",
    title: "Oak Bookshelf",
    price: 445,
    image:
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=600&fit=crop",
    category: "furniture",
    rating: 4.9,
    reviewCount: 34,
    description:
      "Solid oak bookshelf with adjustable shelves and a natural oil finish. Ready to assemble.",
    images: [
      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=800&fit=crop",
    ],
  },
  {
    id: "p8",
    title: "Scented Candle Trio",
    price: 58,
    image:
      "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=600&h=600&fit=crop",
    category: "decor",
    badge: "New",
    rating: 4.6,
    reviewCount: 187,
    description:
      "Three soy-wax candles in cedar, vanilla, and eucalyptus. 40-hour burn time each.",
    images: [
      "https://images.unsplash.com/photo-1602028915047-37269d1a73f7?w=800&h=800&fit=crop",
    ],
  },
];

export const defaultNavConfig: NavConfig = {
  brandName: "STUDIO",
  links: [
    { id: "nav-home", label: "Home", href: "/" },
    { id: "nav-shop", label: "Shop", href: "/products" },
    { id: "nav-collections", label: "Collections", href: "/products" },
    { id: "nav-journal", label: "Journal", href: "#" },
  ],
};
