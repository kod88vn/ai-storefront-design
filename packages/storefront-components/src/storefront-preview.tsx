import type { LayoutSection, StorefrontConfig } from '@ai-storefront/types'
import { StorefrontNavbar } from './navbar'
import { StorefrontHero } from './hero'
import { StorefrontProductGrid } from './product-grid'
import { StorefrontCategories } from './categories'
import { StorefrontFooter } from './footer'
import { ExtraSections } from './extra-sections'

interface StorefrontPreviewProps {
    config: StorefrontConfig
    cartCount?: number
}

export function StorefrontPreview({ config, cartCount = 0 }: StorefrontPreviewProps) {
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

    const FONT_FAMILIES: Record<string, string> = {
        'modern-sans': 'system-ui, -apple-system, "Segoe UI", sans-serif',
        'geometric-sans': '"Century Gothic", Futura, "Trebuchet MS", sans-serif',
        'humanist-sans': '"Gill Sans", Optima, "Segoe UI", sans-serif',
        'editorial-serif': 'Georgia, "Times New Roman", serif',
        'display-serif': 'Palatino, "Book Antiqua", "Palatino Linotype", serif',
        'slab-serif': 'Rockwell, "Courier New", Georgia, serif',
        'mono-tech': '"SF Mono", "Roboto Mono", "Courier New", monospace',
        'handwritten': '"Bradley Hand", "Brush Script MT", cursive',
        'condensed': '"Arial Narrow", Impact, "Franklin Gothic Book", sans-serif',
        'rounded': '"Varela Round", "Nunito", "Comic Sans MS", sans-serif',
    }

    const RADIUS_MAP: Record<string, string> = {
        none: '0px', sm: '4px', md: '8px', lg: '16px', xl: '24px', full: '9999px',
    }

    const radiusVal = RADIUS_MAP[theme.borderRadius] ?? '8px'
    const fontFamilyVal = FONT_FAMILIES[theme.fontStyle ?? 'modern-sans'] ?? 'system-ui, sans-serif'
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
            <StorefrontNavbar theme={theme} navConfig={config.nav} cartCount={cartCount} />
            {sortedSections.map(renderSection)}
        </div>
    )
}
