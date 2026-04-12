'use client'

import { ProductsPage } from '@ai-storefront/storefront-components'
import { useCart } from '../../lib/cart-context'
import { useConfig } from '../../lib/use-config'

export default function ProductsListPage() {
    const config = useConfig()
    const { items, addToCart } = useCart()

    if (!config) return null

    return (
        <ProductsPage
            theme={config.theme}
            navConfig={config.nav}
            pagesConfig={config.pages?.products}
            cartItems={items}
            onAddToCart={addToCart}
        />
    )
}
