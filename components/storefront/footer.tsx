'use client'

import type { ThemeConfig } from '@/lib/types'

interface StorefrontFooterProps {
  theme: ThemeConfig
}

export function StorefrontFooter({ theme }: StorefrontFooterProps) {
  return (
    <footer className="border-t border-neutral-200 bg-white px-4 py-12 sm:px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-8 md:grid-cols-4">
          {/* Brand */}
          <div>
            <h3
              className="text-lg font-semibold"
              style={{ color: theme.primaryColor }}
            >
              STUDIO
            </h3>
            <p className="mt-4 text-sm text-neutral-600">
              Curating beautiful pieces for modern living spaces since 2020.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-medium text-neutral-900">Shop</h4>
            <ul className="mt-4 space-y-2">
              {['New Arrivals', 'Best Sellers', 'Sale', 'Collections'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-neutral-600 hover:text-neutral-900">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-neutral-900">Support</h4>
            <ul className="mt-4 space-y-2">
              {['FAQ', 'Shipping', 'Returns', 'Contact'].map((link) => (
                <li key={link}>
                  <a href="#" className="text-sm text-neutral-600 hover:text-neutral-900">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="font-medium text-neutral-900">Newsletter</h4>
            <p className="mt-4 text-sm text-neutral-600">
              Subscribe for updates and exclusive offers.
            </p>
            <div className="mt-4 flex gap-2">
              <input
                type="email"
                placeholder="Your email"
                className="flex-1 border border-neutral-300 bg-white px-3 py-2 text-sm placeholder:text-neutral-400 focus:outline-none focus:ring-2"
                style={{
                  borderRadius: 'var(--storefront-radius)',
                  focusRingColor: theme.secondaryColor,
                } as React.CSSProperties}
              />
              <button
                className="px-4 py-2 text-sm font-medium text-white"
                style={{
                  backgroundColor: theme.secondaryColor,
                  borderRadius: 'var(--storefront-radius)',
                }}
              >
                Join
              </button>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-neutral-200 pt-8 text-center text-sm text-neutral-500">
          &copy; 2024 STUDIO. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
