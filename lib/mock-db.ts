import type { Product, Category } from './types'

export const mockProducts: Product[] = [
  {
    id: '1',
    title: 'Minimal Desk Lamp',
    price: 89.00,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400&h=400&fit=crop',
    category: 'lighting',
  },
  {
    id: '2',
    title: 'Ceramic Vase Set',
    price: 120.00,
    image: 'https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400&h=400&fit=crop',
    category: 'decor',
  },
  {
    id: '3',
    title: 'Linen Throw Blanket',
    price: 75.00,
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=400&fit=crop',
    category: 'textiles',
  },
  {
    id: '4',
    title: 'Oak Side Table',
    price: 245.00,
    image: 'https://images.unsplash.com/photo-1499933374294-4584851497cc?w=400&h=400&fit=crop',
    category: 'furniture',
  },
  {
    id: '5',
    title: 'Pendant Light',
    price: 165.00,
    image: 'https://images.unsplash.com/photo-1524484485831-a92ffc0de03f?w=400&h=400&fit=crop',
    category: 'lighting',
  },
  {
    id: '6',
    title: 'Woven Basket',
    price: 45.00,
    image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=400&fit=crop',
    category: 'decor',
  },
  {
    id: '7',
    title: 'Cotton Cushion',
    price: 38.00,
    image: 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400&h=400&fit=crop',
    category: 'textiles',
  },
  {
    id: '8',
    title: 'Walnut Shelf',
    price: 195.00,
    image: 'https://images.unsplash.com/photo-1532372320572-cda25653a26d?w=400&h=400&fit=crop',
    category: 'furniture',
  },
]

export const mockCategories: Category[] = [
  { id: '1', name: 'Lighting', slug: 'lighting' },
  { id: '2', name: 'Decor', slug: 'decor' },
  { id: '3', name: 'Textiles', slug: 'textiles' },
  { id: '4', name: 'Furniture', slug: 'furniture' },
]

// Simulated API delay
export async function fetchProducts(): Promise<Product[]> {
  await new Promise((resolve) => setTimeout(resolve, 800))
  return mockProducts
}

export async function fetchCategories(): Promise<Category[]> {
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockCategories
}
