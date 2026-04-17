'use client'

import { StorefrontPreview } from '@ai-storefront/storefront-components'
import type { LayoutSection } from '@ai-storefront/types'
import { useCart } from '../../lib/cart-context'
import { useConfig } from '../../lib/use-config'
import { buildLivePageSections } from '../../lib/live-page-sections'

const DEFAULT_SECTIONS: LayoutSection[] = [
    { id: 'cart-content', type: 'cart-content', enabled: true, order: 0 },
    { id: 'footer', type: 'footer', enabled: true, order: 1 },
]

export default function CartPageRoute() {
    const config = useConfig()
    const { items, updateQty, removeFromCart } = useCart()

    if (!config) return null

    const pageConfig = {
        ...config,
        sections: buildLivePageSections(config.sections, config.pagesSections?.cart ?? DEFAULT_SECTIONS),
    }

    return (
        <StorefrontPreview
            config={pageConfig}
            cartItems={items}
            cartCount={items.reduce((n, i) => n + i.qty, 0)}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
        />
    )
}
