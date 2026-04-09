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

    const { theme } = config
    const radiusVal = theme.borderRadius === 'none' ? '0px' : theme.borderRadius === 'full' ? '9999px' : '8px'
    const fontFamilyVal = theme.fontStyle === 'editorial-serif' ? 'Georgia, "Times New Roman", serif' : theme.fontStyle === 'mono-tech' ? '"Courier New", monospace' : 'system-ui, sans-serif'
    const baseBg = theme.colorScheme === 'dark' ? '#0a0a0a' : '#ffffff'
    const baseText = theme.colorScheme === 'dark' ? '#f5f5f5' : '#0a0a0a'
    const isTransparentNav = theme.navStyle === 'transparent'

    return (
        <div
            data-testid="storefront-preview"
            className={`min-h-screen ${isTransparentNav ? 'relative' : ''}`}
            style={{
                ['--storefront-radius' as string]: radiusVal,
                fontFamily: fontFamilyVal,
                backgroundColor: baseBg,
                color: baseText,
            }}
        >
            <StorefrontNavbar theme={theme} />
            {sortedSections.map(renderSection)}
        </div>
    )
}
