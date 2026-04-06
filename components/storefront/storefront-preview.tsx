'use client'

import { useStudioStore } from '@/lib/store'
import { StorefrontNavbar } from './navbar'
import { StorefrontHero } from './hero'
import { StorefrontProductGrid } from './product-grid'
import { StorefrontCategories } from './categories'
import { StorefrontFooter } from './footer'

export function StorefrontPreview() {
  const { config } = useStudioStore()
  const { sections, theme } = config

  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  const renderSection = (section: (typeof sections)[0]) => {
    if (!section.enabled) return null

    switch (section.type) {
      case 'hero':
        return <StorefrontHero key={section.id} config={config.hero} theme={theme} />
      case 'product-grid':
        return (
          <StorefrontProductGrid
            key={section.id}
            columns={config.productGrid.columns}
            theme={theme}
          />
        )
      case 'categories':
        return <StorefrontCategories key={section.id} theme={theme} />
      case 'footer':
        return <StorefrontFooter key={section.id} theme={theme} />
      default:
        return null
    }
  }

  return (
    <div
      className="min-h-full"
      style={{
        '--storefront-primary': theme.primaryColor,
        '--storefront-secondary': theme.secondaryColor,
        '--storefront-radius':
          theme.borderRadius === 'none'
            ? '0px'
            : theme.borderRadius === 'md'
              ? '8px'
              : '9999px',
      } as React.CSSProperties}
    >
      <StorefrontNavbar theme={theme} />
      {sortedSections.map(renderSection)}
    </div>
  )
}
