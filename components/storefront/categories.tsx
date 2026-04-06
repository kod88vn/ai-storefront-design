'use client'

import { mockCategories } from '@/lib/mock-db'
import type { ThemeConfig } from '@/lib/types'

interface StorefrontCategoriesProps {
  theme: ThemeConfig
}

const categoryImages: Record<string, string> = {
  lighting: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=400&h=300&fit=crop',
  decor: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
  textiles: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=400&h=300&fit=crop',
  furniture: 'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=400&h=300&fit=crop',
}

export function StorefrontCategories({ theme }: StorefrontCategoriesProps) {
  return (
    <section className="bg-neutral-50 px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h2
          className="mb-8 text-2xl font-semibold"
          style={{ color: theme.primaryColor }}
        >
          Shop by Category
        </h2>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {mockCategories.map((category) => (
            <a
              key={category.id}
              href="#"
              className="group relative aspect-[4/3] overflow-hidden"
              style={{ borderRadius: 'var(--storefront-radius)' }}
            >
              <img
                src={categoryImages[category.slug]}
                alt={category.name}
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/30 transition-colors group-hover:bg-black/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-lg font-medium text-white">
                  {category.name}
                </span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
