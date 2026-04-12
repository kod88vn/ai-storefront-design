'use client'

import { use } from 'react'
import { ProductDetailPage } from '@ai-storefront/storefront-components'
import { useCart } from '../../../lib/cart-context'
import { useConfig } from '../../../lib/use-config'

interface Props {
    params: Promise<{ id: string }>
}

export default function ProductPage({ params }: Props) {
    const { id } = use(params)
    const config = useConfig()
    const { items, addToCart } = useCart()

    if (!config) return null

    function handleAddToCart(productId: string, qty: number) {
        for (let i = 0; i < qty; i++) addToCart(productId)
    }

    return (
        <ProductDetailPage
            theme={config.theme}
            navConfig={config.nav}
            productId={id}
            pagesConfig={config.pages?.productDetail}
            cartItems={items}
            onAddToCart={handleAddToCart}
        />
    )
}
