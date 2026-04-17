import type { CartItem, LayoutSection, StorefrontConfig } from '@ai-storefront/types'
import { StorefrontNavbar } from './navbar'
import { StorefrontHero } from './hero'
import { StorefrontProductGrid } from './product-grid'
import { StorefrontCategories } from './categories'
import { StorefrontFooter } from './footer'
import { ExtraSections } from './extra-sections'
import { ProductsPage } from './pages/products-page'
import { ProductDetailPage } from './pages/product-detail-page'
import { CartPage } from './pages/cart-page'

interface StorefrontPreviewProps {
    config: StorefrontConfig
    cartCount?: number
    cartItems?: CartItem[]
    onAddToCart?: (productId: string) => void
    onUpdateQty?: (productId: string, qty: number) => void
    onRemove?: (productId: string) => void
    productId?: string
}

export function StorefrontPreview({ config, cartCount = 0, cartItems = [], onAddToCart, onUpdateQty, onRemove, productId }: StorefrontPreviewProps) {
    const sortedSections = [...config.sections].sort((a, b) => a.order - b.order)

    function renderSection(section: LayoutSection) {
        if (!section.enabled) return null
        switch (section.type) {
            case 'hero':
                return <StorefrontHero key={`${section.id}-${config.hero.layout}`} config={config.hero} theme={config.theme} />
            case 'product-grid':
                return <StorefrontProductGrid key={`${section.id}-${config.productGrid.layout ?? 'grid'}-${config.productGrid.columns}`} config={config.productGrid} theme={config.theme} />
            case 'categories':
                return <StorefrontCategories key={section.id} theme={config.theme} categoriesConfig={config.categories} />
            case 'footer':
                return <StorefrontFooter key={section.id} theme={config.theme} footerConfig={config.footer} />
            case 'products-listing':
                return <ProductsPage key={section.id} theme={config.theme} navConfig={config.nav} pagesConfig={config.pages?.products} cartItems={cartItems} onAddToCart={onAddToCart} showNav={false} />
            case 'cart-content':
                return <CartPage key={section.id} theme={config.theme} navConfig={config.nav} cartItems={cartItems} pagesConfig={config.pages?.cart} onUpdateQty={onUpdateQty} onRemove={onRemove} showNav={false} />
            case 'product-detail-content':
                return <ProductDetailPage key={section.id} theme={config.theme} navConfig={config.nav} productId={productId} pagesConfig={config.pages?.productDetail} cartItems={cartItems} onAddToCart={onAddToCart ? (pid, qty = 1) => { for (let i = 0; i < qty; i++) onAddToCart(pid) } : undefined} showNav={false} />
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
    const heroBackground = config.hero.backgroundColor
        ?? (config.hero.layout === 'editorial'
            ? theme.colorScheme === 'dark' ? '#0a0a0a' : theme.primaryColor
            : config.hero.layout === 'centered'
                ? config.hero.backgroundImage ? '#0a0a0a' : '#f5f5f5'
                : '#ffffff')

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
            <StorefrontNavbar theme={theme} navConfig={config.nav} cartCount={cartCount} heroBackground={heroBackground} />
            {sortedSections.map(renderSection)}
        </div>
    )
}
