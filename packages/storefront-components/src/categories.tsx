import type { CategoriesConfig, ThemeConfig } from '@ai-storefront/types'
import { sampleCategories } from './data'

interface CategoriesProps {
    theme: ThemeConfig
    categoriesConfig?: CategoriesConfig
}

const FONT_SIZE_MAP = { sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' } as const

export function StorefrontCategories({ theme, categoriesConfig }: CategoriesProps) {
    const isDark = (theme.colorScheme ?? 'light') === 'dark'
    const effectiveBg = categoriesConfig?.backgroundColor ?? (isDark ? '#1a1a1a' : '#f5f5f5')
    const cardBg = isDark ? '#2a2a2a' : '#ffffff'
    const effectiveText = categoriesConfig?.textColor ?? (isDark ? '#e5e5e5' : '#525252')
    const headingColor = categoriesConfig?.textColor ?? theme.primaryColor
    // Default to 'sm' so the wrapper always has a base font-size. Category cards then inherit it instead
    // of being fixed at 0.875rem via the Tailwind text-sm class.
    const effectiveFontSize = FONT_SIZE_MAP[categoriesConfig?.fontSize ?? 'sm']
    return (
        <section data-testid="storefront-categories" className="px-4 py-12 sm:px-6" style={{ backgroundColor: effectiveBg, fontSize: effectiveFontSize }}>
            <div className="mx-auto max-w-7xl">
                <h2 className="mb-6 text-2xl font-semibold" style={{ color: headingColor }}>{categoriesConfig?.heading ?? 'Shop by Category'}</h2>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {sampleCategories.map((category) => (
                        <div key={category.id} className="rounded-md px-4 py-6 text-center font-medium" style={{ backgroundColor: cardBg, color: effectiveText }}>
                            {category.name}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
