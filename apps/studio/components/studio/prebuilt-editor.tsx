'use client'

import { useStudioStore } from '@/lib/store'
import { AdvancedSection } from './advanced-section'
import type { ComponentItem } from '@/lib/types'
import { HERO_LAYOUTS } from '@ai-storefront/types'
import { ColorRow, Field, FONT_SIZES, inputCls, labelCls, selectCls } from './prebuilt-editor-shared'
import { SECTION_DATA_TYPES, SectionDataEditor } from './section-data-editor'

function HeroEditor() {
    const { config, updateHero } = useStudioStore()
    const h = config.hero
    return (
        <div className="space-y-3">
            <Field label="Layout">
                <select value={h.layout} onChange={(e) => updateHero({ layout: e.target.value as never })} className={selectCls}>
                    {HERO_LAYOUTS.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
            </Field>
            <Field label="Title"><input className={inputCls} value={h.title} onChange={(e) => updateHero({ title: e.target.value })} /></Field>
            <Field label="Subtitle"><input className={inputCls} value={h.subtitle} onChange={(e) => updateHero({ subtitle: e.target.value })} /></Field>
            <Field label="CTA Button Text"><input className={inputCls} value={h.ctaText} onChange={(e) => updateHero({ ctaText: e.target.value })} /></Field>
            <Field label="Secondary CTA (optional)"><input className={inputCls} value={h.ctaSecondaryText ?? ''} onChange={(e) => updateHero({ ctaSecondaryText: e.target.value })} /></Field>
            <Field label="Background Image URL"><input className={inputCls} value={h.backgroundImage ?? ''} onChange={(e) => updateHero({ backgroundImage: e.target.value })} placeholder="https://..." /></Field>
            <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                    <span className={labelCls}>Background</span>
                    <div className="flex items-center gap-1.5">
                        <input type="color" value={h.backgroundColor || '#ffffff'} onChange={(e) => updateHero({ backgroundColor: e.target.value })} className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border" />
                        <input className={inputCls} value={h.backgroundColor ?? ''} onChange={(e) => updateHero({ backgroundColor: e.target.value || undefined })} placeholder="auto" />
                    </div>
                </div>
                <div className="space-y-1">
                    <span className={labelCls}>Text Color</span>
                    <div className="flex items-center gap-1.5">
                        <input type="color" value={h.textColor || '#000000'} onChange={(e) => updateHero({ textColor: e.target.value })} className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border" />
                        <input className={inputCls} value={h.textColor ?? ''} onChange={(e) => updateHero({ textColor: e.target.value || undefined })} placeholder="auto" />
                    </div>
                </div>
            </div>
            <Field label="Font Size">
                <select value={h.fontSize ?? ''} onChange={(e) => updateHero({ fontSize: (e.target.value || undefined) as typeof FONT_SIZES[number] | undefined })} className={selectCls}>
                    <option value="">Default</option>
                    {FONT_SIZES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
            </Field>
        </div>
    )
}

function ProductGridEditor() {
    const { config, setProductGridColumns, updateProductGrid } = useStudioStore()
    const pg = config.productGrid
    return (
        <div className="space-y-3">
            <Field label="Columns">
                <select value={pg.columns} onChange={(e) => setProductGridColumns(parseInt(e.target.value) as 2 | 3 | 4)} className={selectCls}>
                    <option value={2}>2 Columns</option><option value={3}>3 Columns</option><option value={4}>4 Columns</option>
                </select>
            </Field>
            <Field label="Section Heading (optional)"><input className={inputCls} value={pg.heading ?? ''} onChange={(e) => updateProductGrid({ heading: e.target.value })} placeholder="e.g. Best Sellers" /></Field>
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input type="checkbox" checked={pg.showRatings ?? false} onChange={(e) => updateProductGrid({ showRatings: e.target.checked })} className="accent-primary h-3.5 w-3.5" />
                Show Star Ratings
            </label>
            <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                    <span className={labelCls}>Background</span>
                    <div className="flex items-center gap-1.5">
                        <input type="color" value={pg.backgroundColor || '#ffffff'} onChange={(e) => updateProductGrid({ backgroundColor: e.target.value })} className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border" />
                        <input className={inputCls} value={pg.backgroundColor ?? ''} onChange={(e) => updateProductGrid({ backgroundColor: e.target.value || undefined })} placeholder="auto" />
                    </div>
                </div>
                <div className="space-y-1">
                    <span className={labelCls}>Text Color</span>
                    <div className="flex items-center gap-1.5">
                        <input type="color" value={pg.textColor || '#000000'} onChange={(e) => updateProductGrid({ textColor: e.target.value })} className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border" />
                        <input className={inputCls} value={pg.textColor ?? ''} onChange={(e) => updateProductGrid({ textColor: e.target.value || undefined })} placeholder="auto" />
                    </div>
                </div>
            </div>
            <Field label="Font Size">
                <select value={pg.fontSize ?? ''} onChange={(e) => updateProductGrid({ fontSize: (e.target.value || undefined) as typeof FONT_SIZES[number] | undefined })} className={selectCls}>
                    <option value="">Default</option>
                    {FONT_SIZES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
            </Field>
        </div>
    )
}

function CategoriesEditor() {
    const { config, updateCategoriesConfig } = useStudioStore()
    const cfg = config.categories ?? {}
    return (
        <div className="space-y-3">
            <Field label="Heading"><input className={inputCls} value={cfg.heading ?? 'Shop by Category'} onChange={(e) => updateCategoriesConfig({ heading: e.target.value })} /></Field>
            <ColorRow label="Background Color" value={cfg.backgroundColor ?? '#f5f5f5'} onChange={(v) => updateCategoriesConfig({ backgroundColor: v })} />
            <ColorRow label="Text Color" value={cfg.textColor ?? '#525252'} onChange={(v) => updateCategoriesConfig({ textColor: v })} />
            <Field label="Font Size">
                <select value={cfg.fontSize ?? 'base'} onChange={(e) => updateCategoriesConfig({ fontSize: e.target.value as typeof FONT_SIZES[number] })} className={selectCls}>
                    {FONT_SIZES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
            </Field>
        </div>
    )
}

function FooterEditor() {
    const { config, updateFooterConfig } = useStudioStore()
    const cfg = config.footer ?? {}
    return (
        <div className="space-y-3">
            <Field label="Tagline"><input className={inputCls} value={cfg.tagline ?? ''} onChange={(e) => updateFooterConfig({ tagline: e.target.value })} placeholder="Curated pieces for modern living." /></Field>
            <ColorRow label="Background Color" value={cfg.backgroundColor ?? '#ffffff'} onChange={(v) => updateFooterConfig({ backgroundColor: v })} />
            <ColorRow label="Text Color" value={cfg.textColor ?? '#171717'} onChange={(v) => updateFooterConfig({ textColor: v })} />
            <Field label="Font Size">
                <select value={cfg.fontSize ?? 'base'} onChange={(e) => updateFooterConfig({ fontSize: e.target.value as typeof FONT_SIZES[number] })} className={selectCls}>
                    {FONT_SIZES.map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
            </Field>
        </div>
    )
}

function ProductsListingEditor() {
    const { config, updateProductsPageConfig } = useStudioStore()
    const cfg = { heading: 'All Products', columns: 3 as 2 | 3 | 4, showFilters: true, ...config.pages?.products }
    return (
        <div className="space-y-3">
            <Field label="Heading"><input className={inputCls} value={cfg.heading} onChange={(e) => updateProductsPageConfig({ heading: e.target.value })} /></Field>
            <Field label="Subheading"><input className={inputCls} value={cfg.subheading ?? ''} onChange={(e) => updateProductsPageConfig({ subheading: e.target.value })} placeholder="Optional tagline" /></Field>
            <Field label="Grid Columns">
                <select value={cfg.columns} onChange={(e) => updateProductsPageConfig({ columns: Number(e.target.value) as 2 | 3 | 4 })} className={selectCls}>
                    <option value={2}>2 columns</option><option value={3}>3 columns</option><option value={4}>4 columns</option>
                </select>
            </Field>
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input type="checkbox" checked={cfg.showFilters} onChange={(e) => updateProductsPageConfig({ showFilters: e.target.checked })} className="accent-primary h-3.5 w-3.5" />
                Show category filters
            </label>
        </div>
    )
}

function ProductDetailEditor() {
    const { config, updateProductDetailPageConfig } = useStudioStore()
    const cfg = { showReviews: true, showRelated: true, ...config.pages?.productDetail }
    return (
        <div className="space-y-3">
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input type="checkbox" checked={cfg.showReviews} onChange={(e) => updateProductDetailPageConfig({ showReviews: e.target.checked })} className="accent-primary h-3.5 w-3.5" />
                Show reviews section
            </label>
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input type="checkbox" checked={cfg.showRelated} onChange={(e) => updateProductDetailPageConfig({ showRelated: e.target.checked })} className="accent-primary h-3.5 w-3.5" />
                Show related products
            </label>
        </div>
    )
}

function CartEditor() {
    const { config, updateCartPageConfig } = useStudioStore()
    const cfg = { emptyMessage: 'Your cart is empty.', checkoutButtonText: 'Checkout', ...config.pages?.cart }
    return (
        <div className="space-y-3">
            <Field label="Empty Cart Message"><input className={inputCls} value={cfg.emptyMessage} onChange={(e) => updateCartPageConfig({ emptyMessage: e.target.value })} /></Field>
            <Field label="Checkout Button Text"><input className={inputCls} value={cfg.checkoutButtonText} onChange={(e) => updateCartPageConfig({ checkoutButtonText: e.target.value })} /></Field>
        </div>
    )
}

const HAS_EDITOR = new Set([
    'hero', 'product-grid', 'categories', 'footer',
    'products-listing', 'product-detail-content', 'cart-content',
    ...SECTION_DATA_TYPES,
])

export function PrebuiltEditor({ comp, containerId }: { comp: ComponentItem & { kind: 'prebuilt' }; containerId: string }) {
    const { updateComponentInContainer } = useStudioStore()
    return (
        <div className="space-y-4">
            {comp.sectionType === 'hero' && <HeroEditor />}
            {comp.sectionType === 'product-grid' && <ProductGridEditor />}
            {comp.sectionType === 'categories' && <CategoriesEditor />}
            {comp.sectionType === 'footer' && <FooterEditor />}
            {comp.sectionType === 'products-listing' && <ProductsListingEditor />}
            {comp.sectionType === 'product-detail-content' && <ProductDetailEditor />}
            {comp.sectionType === 'cart-content' && <CartEditor />}
            {SECTION_DATA_TYPES.has(comp.sectionType) && <SectionDataEditor sectionKey={comp.sectionType} />}
            {!HAS_EDITOR.has(comp.sectionType) && (
                <p className="text-xs text-muted-foreground">This component has no editable content fields.</p>
            )}
            <AdvancedSection value={comp.customClasses} onChange={(v) => updateComponentInContainer(containerId, comp.id, { customClasses: v })} />
        </div>
    )
}
