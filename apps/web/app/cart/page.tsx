'use client'

import { CartPage } from '@ai-storefront/storefront-components'
import { useCart } from '../../lib/cart-context'
import { useConfig } from '../../lib/use-config'

export default function CartPageRoute() {
    const config = useConfig()
    const { items, updateQty, removeFromCart } = useCart()

    if (!config) return null

    return (
        <CartPage
            theme={config.theme}
            navConfig={config.nav}
            cartItems={items}
            pagesConfig={config.pages?.cart}
            onUpdateQty={updateQty}
            onRemove={removeFromCart}
        />
    )
}
