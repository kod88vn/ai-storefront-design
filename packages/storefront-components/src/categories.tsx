import type { ThemeConfig } from '@ai-storefront/types'
import { sampleCategories } from './data'

interface CategoriesProps {
    theme: ThemeConfig
}

export function StorefrontCategories({ theme }: CategoriesProps) {
    const isDark = (theme.colorScheme ?? 'light') === 'dark'
    const bg = isDark ? '#1a1a1a' : '#f5f5f5'
    const cardBg = isDark ? '#2a2a2a' : '#ffffff'
    const cardText = isDark ? '#e5e5e5' : '#525252'
    return (
        <section data-testid="storefront-categories" className="px-4 py-12 sm:px-6" style={{ backgroundColor: bg }}>
            <div className="mx-auto max-w-7xl">
                <h2 className="mb-6 text-2xl font-semibold" style={{ color: theme.primaryColor }}>Shop by Category</h2>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {sampleCategories.map((category) => (
                        <div key={category.id} className="rounded-md px-4 py-6 text-center text-sm font-medium" style={{ backgroundColor: cardBg, color: cardText }}>
                            {category.name}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
