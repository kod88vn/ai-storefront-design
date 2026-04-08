import type { ThemeConfig } from '@ai-storefront/types'
import { sampleCategories } from './data'

interface CategoriesProps {
    theme: ThemeConfig
}

export function StorefrontCategories({ theme }: CategoriesProps) {
    return (
        <section data-testid="storefront-categories" className="bg-neutral-50 px-4 py-12 sm:px-6">
            <div className="mx-auto max-w-7xl">
                <h2 className="mb-6 text-2xl font-semibold" style={{ color: theme.primaryColor }}>Shop by Category</h2>
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                    {sampleCategories.map((category) => (
                        <div key={category.id} className="rounded-md bg-white px-4 py-6 text-center text-sm font-medium text-neutral-700">
                            {category.name}
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
