'use client'

import { useState } from 'react'
import { Layers, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useStudioStore } from '@/lib/store'

const labelCls = 'text-[10px] font-medium uppercase tracking-wider text-muted-foreground'
const selectCls = 'h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring'

type FontSizeOption = 'sm' | 'base' | 'lg' | 'xl'

function ColorRow({ label, value, onChange, testId }: { label: string; value: string; onChange: (v: string) => void; testId: string }) {
    return (
        <div className="space-y-1">
            <span className={labelCls}>{label}</span>
            <div className="flex items-center gap-2" data-testid={`${testId}-row`}>
                <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)}
                    data-testid={`${testId}-picker`} className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent" />
                <Input value={value} onChange={(e) => onChange(e.target.value)}
                    data-testid={`${testId}-input`} placeholder="inherit" className="h-8 flex-1 font-mono text-xs" />
            </div>
        </div>
    )
}

function FontSizeRow({ value, onChange, testId }: { value: FontSizeOption | undefined; onChange: (v: FontSizeOption | undefined) => void; testId: string }) {
    return (
        <div className="space-y-1">
            <span className={labelCls}>Text Size</span>
            <select value={value ?? ''} onChange={(e) => onChange((e.target.value || undefined) as FontSizeOption | undefined)}
                className={selectCls} data-testid={testId}>
                <option value="">Default</option>
                <option value="sm">Small (0.875rem)</option>
                <option value="base">Base (1rem)</option>
                <option value="lg">Large (1.125rem)</option>
                <option value="xl">X-Large (1.25rem)</option>
            </select>
        </div>
    )
}

function SectionStyleBlock({ label, testId, children }: { label: string; testId: string; children: React.ReactNode }) {
    const [open, setOpen] = useState(false)
    return (
        <div data-testid={testId} className="border-b border-border/50 last:border-0">
            <button onClick={() => setOpen((o) => !o)} data-testid={`${testId}-toggle`}
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted/40 hover:text-foreground">
                {label}
                <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && <div data-testid={`${testId}-body`} className="space-y-3 px-3 pb-3">{children}</div>}
        </div>
    )
}

function HeroStyleSection() {
    const { config, updateHero } = useStudioStore()
    const hero = config.hero
    return (
        <SectionStyleBlock label="Hero" testId="section-style-hero">
            <ColorRow label="Background Color" value={hero.backgroundColor ?? ''} onChange={(v) => updateHero({ backgroundColor: v || undefined })} testId="hero-bg" />
            <ColorRow label="Text Color" value={hero.textColor ?? ''} onChange={(v) => updateHero({ textColor: v || undefined })} testId="hero-text" />
            <FontSizeRow value={hero.fontSize} onChange={(v) => updateHero({ fontSize: v })} testId="hero-font-size" />
        </SectionStyleBlock>
    )
}

function ProductGridStyleSection() {
    const { config, updateProductGrid } = useStudioStore()
    const pg = config.productGrid
    return (
        <SectionStyleBlock label="Product Grid" testId="section-style-product-grid">
            <ColorRow label="Background Color" value={pg.backgroundColor ?? ''} onChange={(v) => updateProductGrid({ backgroundColor: v || undefined })} testId="product-grid-bg" />
            <ColorRow label="Text Color" value={pg.textColor ?? ''} onChange={(v) => updateProductGrid({ textColor: v || undefined })} testId="product-grid-text" />
            <FontSizeRow value={pg.fontSize} onChange={(v) => updateProductGrid({ fontSize: v })} testId="product-grid-font-size" />
        </SectionStyleBlock>
    )
}

function CategoriesStyleSection() {
    const { config, updateCategoriesConfig } = useStudioStore()
    const cats = config.categories ?? {}
    return (
        <SectionStyleBlock label="Categories" testId="section-style-categories">
            <ColorRow label="Background Color" value={cats.backgroundColor ?? ''} onChange={(v) => updateCategoriesConfig({ backgroundColor: v || undefined })} testId="categories-bg" />
            <ColorRow label="Text Color" value={cats.textColor ?? ''} onChange={(v) => updateCategoriesConfig({ textColor: v || undefined })} testId="categories-text" />
            <FontSizeRow value={cats.fontSize} onChange={(v) => updateCategoriesConfig({ fontSize: v })} testId="categories-font-size" />
        </SectionStyleBlock>
    )
}

function FooterStyleSection() {
    const { config, updateFooterConfig } = useStudioStore()
    const footer = config.footer ?? {}
    return (
        <SectionStyleBlock label="Footer" testId="section-style-footer">
            <ColorRow label="Background Color" value={footer.backgroundColor ?? ''} onChange={(v) => updateFooterConfig({ backgroundColor: v || undefined })} testId="footer-bg" />
            <ColorRow label="Text Color" value={footer.textColor ?? ''} onChange={(v) => updateFooterConfig({ textColor: v || undefined })} testId="footer-text" />
            <FontSizeRow value={footer.fontSize} onChange={(v) => updateFooterConfig({ fontSize: v })} testId="footer-font-size" />
        </SectionStyleBlock>
    )
}

export function ComponentStylesPanel() {
    const [open, setOpen] = useState(false)
    return (
        <div data-testid="component-styles-panel" className="border-b border-border">
            <button onClick={() => setOpen((o) => !o)} data-testid="component-styles-toggle"
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-muted/50">
                <span className="flex items-center gap-2"><Layers className="h-3.5 w-3.5" />Section Styles</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div data-testid="component-styles-body">
                    <HeroStyleSection />
                    <ProductGridStyleSection />
                    <CategoriesStyleSection />
                    <FooterStyleSection />
                </div>
            )}
        </div>
    )
}
