'use client'

import { Plus, Trash2 } from 'lucide-react'
import { useStudioStore } from '@/lib/store'
import { AdvancedSection } from './advanced-section'
import type { ComponentItem } from '@/lib/types'
import { HERO_LAYOUTS, BENEFIT_ICONS, COLLECTION_LAYOUTS, TESTIMONIAL_LAYOUTS } from '@ai-storefront/types'

const inputCls = 'h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring'
const selectCls = 'h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
const labelCls = 'text-[10px] font-medium uppercase tracking-wider text-muted-foreground'

function Field({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="space-y-1">
            <span className={labelCls}>{label}</span>
            {children}
        </div>
    )
}

function ColorRow({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
    return (
        <div className="flex items-center gap-2">
            <input type="color" value={value} onChange={(e) => onChange(e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-border" />
            <span className="text-xs text-muted-foreground">{label}</span>
        </div>
    )
}

const FONT_SIZES = ['sm', 'base', 'lg', 'xl'] as const

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

function SectionDataEditor({ sectionKey }: { sectionKey: string }) {
    const { config, updateSectionData } = useStudioStore()
    const data = (config.sectionData as Record<string, unknown>)[sectionKey] ?? {}

    function patch(k: string, v: unknown) {
        updateSectionData({ [sectionKey]: { ...data as object, [k]: v } } as never)
    }

    if (sectionKey === 'announcement-bar') {
        const d = data as { text?: string; link?: string; backgroundColor?: string; textColor?: string; scrolling?: boolean }
        return (
            <div className="space-y-3">
                <Field label="Text"><input className={inputCls} value={d.text ?? ''} onChange={(e) => patch('text', e.target.value)} /></Field>
                <Field label="Link URL"><input className={inputCls} value={d.link ?? ''} onChange={(e) => patch('link', e.target.value)} placeholder="https://..." /></Field>
                <ColorRow label="Background Color" value={d.backgroundColor ?? '#000000'} onChange={(v) => patch('backgroundColor', v)} />
                <ColorRow label="Text Color" value={d.textColor ?? '#ffffff'} onChange={(v) => patch('textColor', v)} />
                <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={d.scrolling ?? false} onChange={(e) => patch('scrolling', e.target.checked)} className="accent-primary h-3.5 w-3.5" />Scrolling Marquee</label>
            </div>
        )
    }

    if (sectionKey === 'benefits-bar') {
        const d = data as { items?: Array<{ icon: string; label: string; detail?: string }>; backgroundColor?: string; textColor?: string }
        // Use the same defaults the component renders, so editor and preview stay in sync
        const items = d.items ?? [
            { icon: 'truck', label: '[BENEFIT 1 — Click to edit]', detail: '[Supporting detail text]' },
            { icon: 'refresh', label: '[BENEFIT 2 — Click to edit]', detail: '[Supporting detail text]' },
            { icon: 'shield', label: '[BENEFIT 3 — Click to edit]', detail: '[Supporting detail text]' },
            { icon: 'award', label: '[BENEFIT 4 — Click to edit]', detail: '[Supporting detail text]' },
        ]
        return (
            <div className="space-y-2">
                <ColorRow label="Background Color" value={d.backgroundColor ?? '#f5f5f5'} onChange={(v) => patch('backgroundColor', v)} />
                <ColorRow label="Text Color" value={d.textColor ?? '#171717'} onChange={(v) => patch('textColor', v)} />
                {items.map((item, i) => (
                    <div key={i} className="flex gap-1.5 rounded-md border border-border p-2">
                        <select value={item.icon} onChange={(e) => { const next = [...items]; next[i] = { ...item, icon: e.target.value }; patch('items', next) }} className="h-7 rounded border border-border bg-background px-1 text-xs">
                            {BENEFIT_ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                        </select>
                        <input className={`${inputCls} flex-1`} value={item.label} onChange={(e) => { const next = [...items]; next[i] = { ...item, label: e.target.value }; patch('items', next) }} placeholder="Label" />
                        <input className={`${inputCls} flex-1`} value={item.detail ?? ''} onChange={(e) => { const next = [...items]; next[i] = { ...item, detail: e.target.value }; patch('items', next) }} placeholder="Detail" />
                        <button onClick={() => patch('items', items.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                ))}
                <button onClick={() => patch('items', [...items, { icon: 'truck', label: '[New Benefit]', detail: '' }])} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="h-3.5 w-3.5" />Add item</button>
            </div>
        )
    }

    if (sectionKey === 'testimonials') {
        const d = data as { heading?: string; layout?: string; showRatings?: boolean; backgroundColor?: string; textColor?: string; items?: Array<{ quote: string; author: string; location?: string; rating: number }> }
        const items = d.items ?? []
        return (
            <div className="space-y-3">
                <Field label="Heading"><input className={inputCls} value={d.heading ?? ''} onChange={(e) => patch('heading', e.target.value)} /></Field>
                <Field label="Layout">
                    <select value={d.layout ?? 'grid'} onChange={(e) => patch('layout', e.target.value)} className={selectCls}>
                        {TESTIMONIAL_LAYOUTS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                </Field>
                <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={d.showRatings ?? true} onChange={(e) => patch('showRatings', e.target.checked)} className="accent-primary h-3.5 w-3.5" />Show Star Ratings</label>
                <ColorRow label="Background Color" value={d.backgroundColor ?? '#ffffff'} onChange={(v) => patch('backgroundColor', v)} />
                <ColorRow label="Text Color" value={d.textColor ?? '#171717'} onChange={(v) => patch('textColor', v)} />
                <div className="space-y-2">
                    {items.map((item, i) => (
                        <div key={i} className="space-y-1 rounded-md border border-border p-2">
                            <textarea value={item.quote} onChange={(e) => { const next = [...items]; next[i] = { ...item, quote: e.target.value }; patch('items', next) }} rows={2} className="w-full resize-none rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Quote" />
                            <div className="flex gap-1.5">
                                <input className={`${inputCls} flex-1`} value={item.author} onChange={(e) => { const next = [...items]; next[i] = { ...item, author: e.target.value }; patch('items', next) }} placeholder="Author" />
                                <input className={`${inputCls} flex-1`} value={item.location ?? ''} onChange={(e) => { const next = [...items]; next[i] = { ...item, location: e.target.value }; patch('items', next) }} placeholder="Location" />
                                <select value={item.rating} onChange={(e) => { const next = [...items]; next[i] = { ...item, rating: parseInt(e.target.value) }; patch('items', next) }} className="h-8 w-14 rounded border border-border bg-background px-1 text-xs">
                                    {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{'★'.repeat(n)}</option>)}
                                </select>
                                <button onClick={() => patch('items', items.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => patch('items', [...items, { quote: '[New testimonial]', author: '[Name]', location: '', rating: 5 }])} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="h-3.5 w-3.5" />Add testimonial</button>
                </div>
            </div>
        )
    }

    if (sectionKey === 'newsletter') {
        const d = data as { heading?: string; subtext?: string; buttonText?: string; incentive?: string; backgroundColor?: string; textColor?: string }
        return (
            <div className="space-y-3">
                <Field label="Heading"><input className={inputCls} value={d.heading ?? ''} onChange={(e) => patch('heading', e.target.value)} /></Field>
                <Field label="Subtext"><input className={inputCls} value={d.subtext ?? ''} onChange={(e) => patch('subtext', e.target.value)} /></Field>
                <Field label="Button Label"><input className={inputCls} value={d.buttonText ?? 'Subscribe'} onChange={(e) => patch('buttonText', e.target.value)} /></Field>
                <Field label="Incentive Text (optional)"><input className={inputCls} value={d.incentive ?? ''} onChange={(e) => patch('incentive', e.target.value || null)} placeholder="e.g. Get 10% off" /></Field>
                <ColorRow label="Background Color" value={d.backgroundColor ?? '#f5f5f5'} onChange={(v) => patch('backgroundColor', v)} />
                <ColorRow label="Text Color" value={d.textColor ?? '#171717'} onChange={(v) => patch('textColor', v)} />
            </div>
        )
    }

    if (sectionKey === 'trust-badges') {
        const d = data as { items?: Array<{ icon: string; label: string }>; backgroundColor?: string; textColor?: string }
        const items = d.items ?? []
        return (
            <div className="space-y-2">
                <ColorRow label="Background Color" value={d.backgroundColor ?? '#ffffff'} onChange={(v) => patch('backgroundColor', v)} />
                <ColorRow label="Text Color" value={d.textColor ?? '#171717'} onChange={(v) => patch('textColor', v)} />
                {items.map((item, i) => (
                    <div key={i} className="flex gap-1.5 items-center">
                        <select value={item.icon} onChange={(e) => { const next = [...items]; next[i] = { ...item, icon: e.target.value }; patch('items', next) }} className="h-7 rounded border border-border bg-background px-1 text-xs">
                            {BENEFIT_ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                        </select>
                        <input className={`${inputCls} flex-1`} value={item.label} onChange={(e) => { const next = [...items]; next[i] = { ...item, label: e.target.value }; patch('items', next) }} placeholder="Label" />
                        <button onClick={() => patch('items', items.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                ))}
                <button onClick={() => patch('items', [...items, { icon: 'shield', label: '[Trust point]' }])} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="h-3.5 w-3.5" />Add item</button>
            </div>
        )
    }

    if (sectionKey === 'brand-strip') {
        const d = data as { heading?: string; brands?: Array<{ name: string; logoText?: string }>; backgroundColor?: string; textColor?: string }
        const brands = d.brands ?? []
        return (
            <div className="space-y-3">
                <Field label="Heading"><input className={inputCls} value={d.heading ?? ''} onChange={(e) => patch('heading', e.target.value)} /></Field>
                <ColorRow label="Background Color" value={d.backgroundColor ?? '#ffffff'} onChange={(v) => patch('backgroundColor', v)} />
                <ColorRow label="Text Color" value={d.textColor ?? '#171717'} onChange={(v) => patch('textColor', v)} />
                <div className="space-y-1.5">
                    {brands.map((b, i) => (
                        <div key={i} className="flex gap-1.5 items-center">
                            <input className={`${inputCls} flex-1`} value={b.name} onChange={(e) => { const next = [...brands]; next[i] = { ...b, name: e.target.value }; patch('brands', next) }} placeholder="Name" />
                            <input className={`${inputCls} flex-1`} value={b.logoText ?? ''} onChange={(e) => { const next = [...brands]; next[i] = { ...b, logoText: e.target.value }; patch('brands', next) }} placeholder="Display text" />
                            <button onClick={() => patch('brands', brands.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                    ))}
                    <button onClick={() => patch('brands', [...brands, { name: '[Brand]', logoText: '[BRAND]' }])} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="h-3.5 w-3.5" />Add brand</button>
                </div>
            </div>
        )
    }

    if (sectionKey === 'featured-collection') {
        const d = data as { heading?: string; subheading?: string; layout?: string; backgroundColor?: string; textColor?: string }
        return (
            <div className="space-y-3">
                <Field label="Heading"><input className={inputCls} value={d.heading ?? ''} onChange={(e) => patch('heading', e.target.value)} /></Field>
                <Field label="Subheading"><input className={inputCls} value={d.subheading ?? ''} onChange={(e) => patch('subheading', e.target.value)} /></Field>
                <Field label="Layout">
                    <select value={d.layout ?? 'grid'} onChange={(e) => patch('layout', e.target.value)} className={selectCls}>
                        {COLLECTION_LAYOUTS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                </Field>
                <ColorRow label="Background Color" value={d.backgroundColor ?? '#ffffff'} onChange={(v) => patch('backgroundColor', v)} />
                <ColorRow label="Text Color" value={d.textColor ?? '#171717'} onChange={(v) => patch('textColor', v)} />
            </div>
        )
    }

    return <p className="text-xs text-muted-foreground">No editable fields for this component.</p>
}

const SECTION_DATA_TYPES = new Set(['announcement-bar', 'benefits-bar', 'featured-collection', 'testimonials', 'newsletter', 'trust-badges', 'brand-strip'])
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
