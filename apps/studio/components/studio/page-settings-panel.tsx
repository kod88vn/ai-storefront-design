'use client'

import { useStudioStore } from '@/lib/store'
import { ContainersPanel } from './containers-panel'

const PAGE_LABELS: Record<string, string> = {
    home: 'Home Page',
    products: 'Products Page',
    'product-detail': 'Product Detail',
    cart: 'Cart Page',
    custom: 'Custom Page',
}

export function PageSettingsPanel() {
    const { currentPage } = useStudioStore()
    const label = PAGE_LABELS[currentPage] ?? 'Page Layout'
    return <ContainersPanel title={label} />
}

