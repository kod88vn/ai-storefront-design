import type { Category, Product } from "@ai-storefront/types";

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
  },
];
