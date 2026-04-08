import type { LayoutSection, StorefrontConfig } from '@ai-storefront/types'
import { StorefrontNavbar } from './navbar'
import { StorefrontHero } from './hero'
import { StorefrontProductGrid } from './product-grid'
import { StorefrontCategories } from './categories'
import { StorefrontFooter } from './footer'
import { ExtraSections } from './extra-sections'

interface StorefrontPreviewProps {
    config: StorefrontConfig
}

export function StorefrontPreview({ config }: StorefrontPreviewProps) {
    const sortedSections = [...config.sections].sort((a, b) => a.order - b.order)

    function renderSection(section: LayoutSection) {
        if (!section.enabled) return null
        switch (section.type) {
            case 'hero':
                return <StorefrontHero key={section.id} config={config.hero} theme={config.theme} />
            case 'product-grid':
                return <StorefrontProductGrid key={section.id} config={config.productGrid} theme={config.theme} />
            case 'categories':
                return <StorefrontCategories key={section.id} theme={config.theme} />
            case 'footer':
                return <StorefrontFooter key={section.id} theme={config.theme} />
            default:
                return <ExtraSections key={section.id} section={section} config={config} />
        }
    }

    return (
        <div data-testid="storefront-preview" className="min-h-screen bg-white" style={{ ['--storefront-radius' as string]: config.theme.borderRadius === 'none' ? '0px' : config.theme.borderRadius === 'full' ? '9999px' : '8px' }}>
            <StorefrontNavbar theme={config.theme} />
            {sortedSections.map(renderSection)}
        </div>
    )
}
