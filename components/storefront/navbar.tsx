'use client'

import { ShoppingBag, Search, User } from 'lucide-react'
import { mockCategories } from '@/lib/mock-db'
import type { ThemeConfig } from '@/lib/types'

interface StorefrontNavbarProps {
  theme: ThemeConfig
}

export function StorefrontNavbar({ theme }: StorefrontNavbarProps) {
  return (
    <nav className="border-b border-neutral-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-8">
            <a
              href="#"
              className="text-xl font-semibold tracking-tight"
              style={{ color: theme.primaryColor }}
            >
              STUDIO
            </a>
            
            {/* Category Links */}
            <div className="hidden items-center gap-6 md:flex">
              {mockCategories.map((category) => (
                <a
                  key={category.id}
                  href="#"
                  className="text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
                >
                  {category.name}
                </a>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button className="p-2 text-neutral-600 transition-colors hover:text-neutral-900">
              <Search className="h-5 w-5" />
            </button>
            <button className="p-2 text-neutral-600 transition-colors hover:text-neutral-900">
              <User className="h-5 w-5" />
            </button>
            <button className="relative p-2 text-neutral-600 transition-colors hover:text-neutral-900">
              <ShoppingBag className="h-5 w-5" />
              <span
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center text-xs font-medium text-white"
                style={{
                  backgroundColor: theme.secondaryColor,
                  borderRadius: 'var(--storefront-radius)',
                }}
              >
                3
              </span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
