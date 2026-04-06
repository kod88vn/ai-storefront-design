'use client'

import { useEffect, useState } from 'react'
import { fetchProducts } from '@/lib/mock-db'
import type { Product, ThemeConfig } from '@/lib/types'
import { Skeleton } from '@/components/ui/skeleton'

interface StorefrontProductGridProps {
  columns: 2 | 3 | 4
  theme: ThemeConfig
}

export function StorefrontProductGrid({ columns, theme }: StorefrontProductGridProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetchProducts().then((data) => {
      setProducts(data)
      setLoading(false)
    })
  }, [])

  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  }

  return (
    <section className="bg-white px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <h2
          className="mb-8 text-2xl font-semibold"
          style={{ color: theme.primaryColor }}
        >
          Featured Products
        </h2>
        <div className={`grid gap-6 ${gridCols[columns]}`}>
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <ProductSkeleton key={i} />
              ))
            : products.map((product) => (
                <ProductCard key={product.id} product={product} theme={theme} />
              ))}
        </div>
      </div>
    </section>
  )
}

function ProductCard({ product, theme }: { product: Product; theme: ThemeConfig }) {
  return (
    <div className="group cursor-pointer">
      <div
        className="relative aspect-square overflow-hidden bg-neutral-100"
        style={{ borderRadius: 'var(--storefront-radius)' }}
      >
        <img
          src={product.image}
          alt={product.title}
          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <button
          className="absolute bottom-4 left-1/2 -translate-x-1/2 translate-y-full px-6 py-2 text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100"
          style={{
            backgroundColor: theme.secondaryColor,
            borderRadius: 'var(--storefront-radius)',
          }}
        >
          Add to Cart
        </button>
      </div>
      <div className="mt-4">
        <h3 className="text-sm font-medium text-neutral-900">{product.title}</h3>
        <p className="mt-1 text-sm text-neutral-600">
          ${product.price.toFixed(2)}
        </p>
      </div>
    </div>
  )
}

function ProductSkeleton() {
  return (
    <div>
      <Skeleton className="aspect-square w-full" />
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/4" />
      </div>
    </div>
  )
}
