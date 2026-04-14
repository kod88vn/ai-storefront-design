'use client'

import { use } from 'react'
import { StorefrontPreview } from '@ai-storefront/storefront-components'
import type { LayoutSection } from '@ai-storefront/types'
import { useCart } from '../../../lib/cart-context'
import { useConfig } from '../../../lib/use-config'

const DEFAULT_SECTIONS: LayoutSection[] = [
    { id: 'product-detail-content', type: 'product-detail-content', enabled: true, order: 0 },
    { id: 'footer', type: 'footer', enabled: true, order: 1 },
]

interface Props {
    params: Promise<{ id: string }>
}

export default function ProductPage({ params }: Props) {
    const { id } = use(params)
    const config = useConfig()
    const { items, addToCart } = useCart()

    if (!config) return null

    const pageConfig = { ...config, sections: config.pagesSections?.['product-detail'] ?? DEFAULT_SECTIONS }

    return (
        <StorefrontPreview
            config={pageConfig}
            productId={id}
            cartItems={items}
            cartCount={items.reduce((n, i) => n + i.qty, 0)}
            onAddToCart={addToCart}
        />
    )
}
