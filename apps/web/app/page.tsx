'use client'

import { StorefrontPreview } from '@ai-storefront/storefront-components'
import { useCart } from '../lib/cart-context'
import { useConfig } from '../lib/use-config'

export default function HomePage() {
    const config = useConfig()
    const { count } = useCart()

    if (!config) return null

    return <StorefrontPreview config={config} cartCount={count} />
}
