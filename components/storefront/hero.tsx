'use client'

import type { HeroConfig, ThemeConfig } from '@/lib/types'

interface StorefrontHeroProps {
  config: HeroConfig
  theme: ThemeConfig
}

export function StorefrontHero({ config, theme }: StorefrontHeroProps) {
  const { layout, title, subtitle, ctaText } = config

  if (layout === 'minimal') {
    return (
      <section className="bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-3xl text-center">
          <h1
            className="text-3xl font-light tracking-tight sm:text-4xl"
            style={{ color: theme.primaryColor }}
          >
            {title}
          </h1>
          <p className="mt-4 text-neutral-600">{subtitle}</p>
          <button
            className="mt-6 px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
            style={{
              backgroundColor: theme.secondaryColor,
              borderRadius: 'var(--storefront-radius)',
            }}
          >
            {ctaText}
          </button>
        </div>
      </section>
    )
  }

  if (layout === 'centered') {
    return (
      <section className="relative overflow-hidden bg-neutral-50 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1
            className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl"
            style={{ color: theme.primaryColor }}
          >
            {title}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600">
            {subtitle}
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button
              className="px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{
                backgroundColor: theme.secondaryColor,
                borderRadius: 'var(--storefront-radius)',
              }}
            >
              {ctaText}
            </button>
            <button
              className="border px-8 py-3 text-sm font-medium transition-colors hover:bg-neutral-100"
              style={{
                borderColor: theme.primaryColor,
                color: theme.primaryColor,
                borderRadius: 'var(--storefront-radius)',
              }}
            >
              Learn More
            </button>
          </div>
        </div>
      </section>
    )
  }

  // Split layout (default)
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-7xl lg:grid-cols-2">
        <div className="flex flex-col justify-center px-4 py-16 sm:px-6 lg:py-24">
          <h1
            className="text-4xl font-semibold tracking-tight sm:text-5xl"
            style={{ color: theme.primaryColor }}
          >
            {title}
          </h1>
          <p className="mt-6 text-lg text-neutral-600">{subtitle}</p>
          <div className="mt-8">
            <button
              className="px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
              style={{
                backgroundColor: theme.secondaryColor,
                borderRadius: 'var(--storefront-radius)',
              }}
            >
              {ctaText}
            </button>
          </div>
        </div>
        <div className="relative aspect-square lg:aspect-auto">
          <img
            src="https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=800&fit=crop"
            alt="Hero"
            className="h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  )
}
