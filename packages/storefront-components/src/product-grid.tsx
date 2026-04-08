import type { ProductGridConfig, ThemeConfig } from '@ai-storefront/types'
import { sampleProducts } from './data'

interface ProductGridProps {
    config: ProductGridConfig
    theme: ThemeConfig
}

export function StorefrontProductGrid({ config, theme }: ProductGridProps) {
    const gridClass = config.columns === 2 ? 'sm:grid-cols-2' : config.columns === 4 ? 'sm:grid-cols-2 lg:grid-cols-4' : 'sm:grid-cols-2 lg:grid-cols-3'
    return (
        <section data-testid="storefront-product-grid" className="bg-white px-4 py-12 sm:px-6">
            <div className="mx-auto max-w-7xl">
                <h2 className="mb-6 text-2xl font-semibold" style={{ color: theme.primaryColor }}>Featured Products</h2>
                <div className={`grid grid-cols-1 gap-6 ${gridClass}`}>
                    {sampleProducts.map((product) => (
                        <article key={product.id} data-testid="storefront-product-card" className="group">
                            <div className="aspect-square overflow-hidden rounded-md bg-neutral-100">
                                <img src={product.image} alt={product.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                            </div>
                            <h3 className="mt-3 text-sm font-medium text-neutral-900">{product.title}</h3>
                            <p className="mt-1 text-sm text-neutral-600">${product.price.toFixed(2)}</p>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}
