'use client'

import { useState } from 'react'
import { Settings, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useStudioStore } from '@/lib/store'
import { ContainersPanel } from './containers-panel'

const labelCls = 'text-[10px] font-medium uppercase tracking-wider text-muted-foreground'
const selectCls = 'h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring'

function Toggle({ checked, onChange, label, testId }: { checked: boolean; onChange: (v: boolean) => void; label: string; testId: string }) {
    return (
        <label data-testid={testId} className="flex cursor-pointer items-center justify-between gap-2">
            <span className="text-xs">{label}</span>
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                aria-label={label}
                onClick={() => onChange(!checked)}
                className={`relative h-5 w-9 rounded-full transition-colors ${checked ? 'bg-emerald-500' : 'bg-emerald-200'}`}
            >
                <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full shadow transition-transform ${checked ? 'translate-x-4 bg-emerald-900' : 'translate-x-0 bg-emerald-600'}`} />
            </button>
        </label>
    )
}

function HomeSettings() {
    return <ContainersPanel title="Home Page" />
}

function ProductsSettings() {
    const { config, updateProductsPageConfig } = useStudioStore()
    const cfg = { heading: 'All Products', subheading: '', columns: 3 as 2 | 3 | 4, showFilters: true, ...config.pages?.products }

    return (
        <div data-testid="products-settings" className="space-y-3 px-3 pb-4 pt-2">
            <div className="space-y-1">
                <span className={labelCls}>Page Heading</span>
                <Input value={cfg.heading} onChange={(e) => updateProductsPageConfig({ heading: e.target.value })} className="h-8 text-xs" data-testid="products-heading" />
            </div>
            <div className="space-y-1">
                <span className={labelCls}>Subheading</span>
                <Input value={cfg.subheading ?? ''} onChange={(e) => updateProductsPageConfig({ subheading: e.target.value })} className="h-8 text-xs" placeholder="Optional tagline" data-testid="products-subheading" />
            </div>
            <div className="space-y-1">
                <span className={labelCls}>Grid Columns</span>
                <select value={cfg.columns} onChange={(e) => updateProductsPageConfig({ columns: Number(e.target.value) as 2 | 3 | 4 })} className={selectCls} data-testid="products-columns">
                    <option value={2}>2 columns</option>
                    <option value={3}>3 columns</option>
                    <option value={4}>4 columns</option>
                </select>
            </div>
            <Toggle checked={cfg.showFilters} onChange={(v) => updateProductsPageConfig({ showFilters: v })} label="Show category filters" testId="products-show-filters" />
        </div>
    )
}

function ProductDetailSettings() {
    const { config, updateProductDetailPageConfig } = useStudioStore()
    const cfg = { showReviews: true, showRelated: true, ...config.pages?.productDetail }

    return (
        <div data-testid="product-detail-settings" className="space-y-3 px-3 pb-4 pt-2">
            <Toggle checked={cfg.showReviews} onChange={(v) => updateProductDetailPageConfig({ showReviews: v })} label="Show reviews section" testId="pdp-show-reviews" />
            <Toggle checked={cfg.showRelated} onChange={(v) => updateProductDetailPageConfig({ showRelated: v })} label="Show related products" testId="pdp-show-related" />
        </div>
    )
}

function CartSettings() {
    const { config, updateCartPageConfig } = useStudioStore()
    const cfg = { emptyMessage: 'Your cart is empty. Start shopping!', checkoutButtonText: 'Proceed to Checkout', ...config.pages?.cart }

    return (
        <div data-testid="cart-settings" className="space-y-3 px-3 pb-4 pt-2">
            <div className="space-y-1">
                <span className={labelCls}>Empty Cart Message</span>
                <Input value={cfg.emptyMessage} onChange={(e) => updateCartPageConfig({ emptyMessage: e.target.value })} className="h-8 text-xs" data-testid="cart-empty-message" />
            </div>
            <div className="space-y-1">
                <span className={labelCls}>Checkout Button Text</span>
                <Input value={cfg.checkoutButtonText} onChange={(e) => updateCartPageConfig({ checkoutButtonText: e.target.value })} className="h-8 text-xs" data-testid="cart-checkout-text" />
            </div>
        </div>
    )
}

function CustomSettings() {
    return (
        <div data-testid="custom-settings" className="px-3 py-4 text-xs text-muted-foreground">
            Custom page editor coming soon.
        </div>
    )
}

const PAGE_LABELS: Record<string, string> = {
    home: 'Home Layout',
    products: 'Products Page',
    'product-detail': 'Product Detail Page',
    cart: 'Cart Page',
    custom: 'Custom Page',
}

export function PageSettingsPanel() {
    const { currentPage } = useStudioStore()
    const [open, setOpen] = useState(false)

    // Home page delegates entirely to ContainersPanel which has its own header
    if (currentPage === 'home') return <HomeSettings />

    return (
        <div data-testid="page-settings-panel" className="border-b border-border">
            <button
                onClick={() => setOpen((o) => !o)}
                data-testid="page-settings-toggle"
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-muted/50"
            >
                <span className="flex items-center gap-2">
                    <Settings className="h-3.5 w-3.5" />
                    {PAGE_LABELS[currentPage] ?? 'Page Settings'}
                </span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <>
                    {currentPage === 'products' && <ProductsSettings />}
                    {currentPage === 'product-detail' && <ProductDetailSettings />}
                    {currentPage === 'cart' && <CartSettings />}
                    {currentPage === 'custom' && <CustomSettings />}
                </>
            )}
        </div>
    )
}
