'use client'

import { useStudioStore } from '@/lib/store'
import { StorefrontNavbar } from './navbar'
import { StorefrontHero } from './hero'
import { StorefrontProductGrid } from './product-grid'
import { StorefrontCategories } from './categories'
import { StorefrontFooter } from './footer'

export function StorefrontPreview() {
  const { config } = useStudioStore()
  const { sections, theme, sectionData } = config

  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  const renderSection = (section: (typeof sections)[0]) => {
    if (!section.enabled) return null

    switch (section.type) {
      case 'announcement-bar': {
        const data = sectionData['announcement-bar']
        return data ? (
          <section key={section.id} className="px-4 py-2 text-center text-xs font-medium" style={{ backgroundColor: data.backgroundColor || theme.primaryColor, color: data.textColor || '#ffffff' }}>
            {data.link ? <a href={data.link}>{data.text}</a> : data.text}
          </section>
        ) : null
      }
      case 'benefits-bar': {
        const items = sectionData['benefits-bar']?.items || []
        if (items.length === 0) return null
        return (
          <section key={section.id} className="border-y border-neutral-200 bg-neutral-50 px-4 py-3">
            <div className="mx-auto grid max-w-7xl gap-3 text-center text-xs text-neutral-700 sm:grid-cols-2 lg:grid-cols-4">
              {items.slice(0, 4).map((item, idx) => <div key={`${item.label}-${idx}`}>{item.label}</div>)}
            </div>
          </section>
        )
      }
      case 'hero':
        return <StorefrontHero key={section.id} config={config.hero} theme={theme} />
      case 'featured-collection': {
        const data = sectionData['featured-collection']
        if (!data) return null
        return (
          <section key={section.id} className="bg-white px-4 py-12 sm:px-6">
            <div className="mx-auto max-w-7xl">
              <h2 className="text-2xl font-semibold" style={{ color: theme.primaryColor }}>{data.heading}</h2>
              {data.subheading && <p className="mt-2 text-sm text-neutral-600">{data.subheading}</p>}
            </div>
          </section>
        )
      }
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
      case 'testimonials': {
        const data = sectionData.testimonials
        if (!data || data.items.length === 0) return null
        return (
          <section key={section.id} className="bg-neutral-50 px-4 py-12 sm:px-6">
            <div className="mx-auto max-w-7xl">
              <h2 className="mb-6 text-2xl font-semibold" style={{ color: theme.primaryColor }}>{data.heading}</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {data.items.slice(0, 3).map((item, idx) => (
                  <blockquote key={`${item.author}-${idx}`} className="rounded-lg border border-neutral-200 bg-white p-4 text-sm text-neutral-700">
                    <p>"{item.quote}"</p>
                    <footer className="mt-3 font-medium text-neutral-900">{item.author}</footer>
                  </blockquote>
                ))}
              </div>
            </div>
          </section>
        )
      }
      case 'newsletter': {
        const data = sectionData.newsletter
        if (!data) return null
        return (
          <section key={section.id} className="px-4 py-12 sm:px-6" style={{ backgroundColor: data.backgroundColor || '#f5f5f5' }}>
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-2xl font-semibold" style={{ color: theme.primaryColor }}>{data.heading}</h2>
              <p className="mt-2 text-sm text-neutral-600">{data.subtext}</p>
            </div>
          </section>
        )
      }
      case 'trust-badges': {
        const items = sectionData['trust-badges']?.items || []
        if (items.length === 0) return null
        return (
          <section key={section.id} className="border-y border-neutral-200 bg-white px-4 py-4">
            <div className="mx-auto grid max-w-7xl gap-3 text-center text-xs text-neutral-700 sm:grid-cols-2 lg:grid-cols-4">
              {items.slice(0, 4).map((item, idx) => <div key={`${item.label}-${idx}`}>{item.label}</div>)}
            </div>
          </section>
        )
      }
      case 'brand-strip': {
        const data = sectionData['brand-strip']
        if (!data || data.brands.length === 0) return null
        return (
          <section key={section.id} className="bg-neutral-50 px-4 py-6">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 text-sm font-semibold tracking-wide text-neutral-500">
              {data.brands.slice(0, 8).map((brand) => <span key={brand.name}>{brand.logoText || brand.name}</span>)}
            </div>
          </section>
        )
      }
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
