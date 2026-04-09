'use client'

import { useEffect, useRef, useState } from 'react'
import { Bold, Italic, Underline, List, Link2, Code, RotateCcw, ChevronDown, Plus, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStudioStore } from '@/lib/store'
import type { ComponentItem, DesignerContainer } from '@/lib/types'

// ─── Deep component search ────────────────────────────────────────────────────

function findInItems(items: ComponentItem[], containerId: string, componentId: string): ComponentItem | undefined {
    for (const item of items) {
        if (item.kind !== 'container') continue
        if (item.id === containerId) return item.components.find((c) => c.id === componentId)
        const found = findInItems(item.components, containerId, componentId)
        if (found) return found
    }
}

export function findComponentDeep(containers: DesignerContainer[], containerId: string, componentId: string): ComponentItem | undefined {
    for (const c of containers) {
        if (c.id === containerId) return c.components.find((comp) => comp.id === componentId)
        const found = findInItems(c.components, containerId, componentId)
        if (found) return found
    }
}

// ─── Shared helpers ───────────────────────────────────────────────────────────

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

// ─── Advanced section (Tailwind classes) ──────────────────────────────────────

function AdvancedSection({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false)
    const classes = value.trim().split(/\s+/).filter(Boolean)
    return (
        <div className="border-t border-border pt-2">
            <button onClick={() => setOpen((o) => !o)} className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground">
                <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
                Advanced {classes.length > 0 && <span className="ml-1 rounded bg-muted px-1 py-0.5 font-mono">{classes.length}</span>}
            </button>
            {open && (
                <div className="mt-2 space-y-2">
                    {classes.length > 0 && (
                        <div className="space-y-1">
                            <span className={labelCls}>Applied Classes</span>
                            <div className="flex flex-wrap gap-1">
                                {classes.map((cls) => (
                                    <span key={cls} className="flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                                        {cls}
                                        <button
                                            onClick={() => onChange(classes.filter((c) => c !== cls).join(' '))}
                                            className="ml-0.5 text-muted-foreground hover:text-destructive"
                                            title={`Remove ${cls}`}
                                        >✕</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="space-y-1">
                        <span className={labelCls}>Add / Edit Classes</span>
                        <textarea
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="e.g. rounded-lg shadow-md p-4"
                            rows={2}
                            className="w-full resize-none rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

// ─── WYSIWYG text editor ──────────────────────────────────────────────────────

const ICONS = [Bold, Italic, Underline, List, Link2, Code] as const
const CMDS = ['bold', 'italic', 'underline', 'insertUnorderedList', 'createLink', 'formatBlock'] as const

function ToolBtn({ icon: Icon, cmd, arg, label, editorRef, onChange }: { icon: React.ElementType; cmd: string; arg?: string; label: string; editorRef: React.RefObject<HTMLDivElement | null>; onChange: (v: string) => void }) {
    function run(e: React.MouseEvent) {
        e.preventDefault()
        const val = cmd === 'createLink' ? window.prompt('Enter URL:') : arg
        if (cmd === 'createLink' && !val) return
        document.execCommand(cmd, false, val ?? undefined)
        if (editorRef.current) onChange(editorRef.current.innerHTML)
    }
    return (
        <button onMouseDown={run} className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground" title={label}>
            <Icon className="h-3.5 w-3.5" />
        </button>
    )
}

function WysiwygEditor({ html, onChange }: { html: string; onChange: (v: string) => void }) {
    const ref = useRef<HTMLDivElement>(null)
    const focused = useRef(false)
    useEffect(() => { if (ref.current) ref.current.innerHTML = html }, [])
    useEffect(() => { if (ref.current && !focused.current) ref.current.innerHTML = html }, [html])

    return (
        <div className="overflow-hidden rounded-md border border-border">
            <div className="flex flex-wrap gap-0.5 border-b border-border bg-muted/40 p-1">
                <ToolBtn icon={Bold} cmd="bold" label="Bold (Ctrl+B)" editorRef={ref} onChange={onChange} />
                <ToolBtn icon={Italic} cmd="italic" label="Italic (Ctrl+I)" editorRef={ref} onChange={onChange} />
                <ToolBtn icon={Underline} cmd="underline" label="Underline (Ctrl+U)" editorRef={ref} onChange={onChange} />
                <ToolBtn icon={List} cmd="insertUnorderedList" label="Bullet List" editorRef={ref} onChange={onChange} />
                <ToolBtn icon={Link2} cmd="createLink" label="Insert Link" editorRef={ref} onChange={onChange} />
                <ToolBtn icon={Code} cmd="formatBlock" arg="pre" label="Code Block" editorRef={ref} onChange={onChange} />
                <button onMouseDown={(e) => { e.preventDefault(); document.execCommand('removeFormat'); if (ref.current) onChange(ref.current.innerHTML) }} title="Clear Formatting" className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"><RotateCcw className="h-3.5 w-3.5" /></button>
            </div>
            <div
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                onFocus={() => { focused.current = true }}
                onBlur={() => { focused.current = false; if (ref.current) onChange(ref.current.innerHTML) }}
                onInput={() => { if (ref.current) onChange(ref.current.innerHTML) }}
                className="min-h-24 px-3 py-2 text-sm focus:outline-none"
            />
        </div>
    )
}

// ─── Prebuilt editors ─────────────────────────────────────────────────────────

const HERO_LAYOUTS = ['split', 'centered', 'minimal', 'fullbleed']
const GRID_LAYOUTS = ['grid', 'horizontal-scroll']
const TESTIMONIAL_LAYOUTS = ['grid', 'list', 'featured']
const BENEFIT_ICONS = ['truck', 'shield', 'refresh', 'award', 'clock', 'leaf', 'star', 'heart', 'check', 'zap', 'globe', 'tag']

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
    const { config, setProductGridColumns } = useStudioStore()
    const pg = config.productGrid
    return (
        <div className="space-y-3">
            <Field label="Columns">
                <select value={pg.columns} onChange={(e) => setProductGridColumns(parseInt(e.target.value) as 2 | 3 | 4)} className={selectCls}>
                    <option value={2}>2 Columns</option><option value={3}>3 Columns</option><option value={4}>4 Columns</option>
                </select>
            </Field>
            <label className="flex items-center gap-2 text-xs text-foreground cursor-pointer">
                <input type="checkbox" checked={pg.showRatings ?? false} onChange={(e) => useStudioStore.getState().updateSectionData({})} className="accent-primary h-3.5 w-3.5" />
                Show Ratings
            </label>
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
        const d = data as { text?: string; link?: string; backgroundColor?: string; scrolling?: boolean }
        return (
            <div className="space-y-3">
                <Field label="Text"><input className={inputCls} value={d.text ?? ''} onChange={(e) => patch('text', e.target.value)} /></Field>
                <Field label="Link URL"><input className={inputCls} value={d.link ?? ''} onChange={(e) => patch('link', e.target.value)} placeholder="https://..." /></Field>
                <div className="flex items-center gap-2"><input type="color" value={d.backgroundColor ?? '#000'} onChange={(e) => patch('backgroundColor', e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-border" /><span className="text-xs text-muted-foreground">Background Color</span></div>
                <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={d.scrolling ?? false} onChange={(e) => patch('scrolling', e.target.checked)} className="accent-primary h-3.5 w-3.5" />Scrolling Marquee</label>
            </div>
        )
    }

    if (sectionKey === 'benefits-bar') {
        const d = data as { items?: Array<{ icon: string; label: string; detail?: string }> }
        const items = d.items ?? []
        return (
            <div className="space-y-2">
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
        const d = data as { heading?: string; layout?: string; showRatings?: boolean; items?: Array<{ quote: string; author: string; location?: string; rating: number }> }
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
        const d = data as { heading?: string; subtext?: string; buttonText?: string; incentive?: string; backgroundColor?: string }
        return (
            <div className="space-y-3">
                <Field label="Heading"><input className={inputCls} value={d.heading ?? ''} onChange={(e) => patch('heading', e.target.value)} /></Field>
                <Field label="Subtext"><input className={inputCls} value={d.subtext ?? ''} onChange={(e) => patch('subtext', e.target.value)} /></Field>
                <Field label="Button Label"><input className={inputCls} value={d.buttonText ?? 'Subscribe'} onChange={(e) => patch('buttonText', e.target.value)} /></Field>
                <Field label="Incentive Text (optional)"><input className={inputCls} value={d.incentive ?? ''} onChange={(e) => patch('incentive', e.target.value || null)} placeholder="e.g. Get 10% off" /></Field>
                <div className="flex items-center gap-2"><input type="color" value={d.backgroundColor ?? '#f5f5f5'} onChange={(e) => patch('backgroundColor', e.target.value)} className="h-8 w-10 cursor-pointer rounded border border-border" /><span className="text-xs text-muted-foreground">Background Color</span></div>
            </div>
        )
    }

    if (sectionKey === 'trust-badges') {
        const d = data as { items?: Array<{ icon: string; label: string }> }
        const items = d.items ?? []
        return (
            <div className="space-y-2">
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
        const d = data as { heading?: string; brands?: Array<{ name: string; logoText?: string }> }
        const brands = d.brands ?? []
        return (
            <div className="space-y-3">
                <Field label="Heading"><input className={inputCls} value={d.heading ?? ''} onChange={(e) => patch('heading', e.target.value)} /></Field>
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
        const d = data as { heading?: string; subheading?: string; layout?: string }
        return (
            <div className="space-y-3">
                <Field label="Heading"><input className={inputCls} value={d.heading ?? ''} onChange={(e) => patch('heading', e.target.value)} /></Field>
                <Field label="Subheading"><input className={inputCls} value={d.subheading ?? ''} onChange={(e) => patch('subheading', e.target.value)} /></Field>
                <Field label="Layout">
                    <select value={d.layout ?? 'grid'} onChange={(e) => patch('layout', e.target.value)} className={selectCls}>
                        {GRID_LAYOUTS.map((v) => <option key={v} value={v}>{v}</option>)}
                    </select>
                </Field>
            </div>
        )
    }

    return <p className="text-xs text-muted-foreground">No editable fields for this component.</p>
}

// ─── Custom component editors ─────────────────────────────────────────────────

function CustomTextEditor({ comp, containerId }: { comp: ComponentItem & { kind: 'custom-text' }; containerId: string }) {
    const { updateComponentInContainer } = useStudioStore()
    return (
        <div className="space-y-3">
            <Field label="Content">
                <WysiwygEditor html={comp.html} onChange={(html) => updateComponentInContainer(containerId, comp.id, { html })} />
            </Field>
            <AdvancedSection value={comp.customClasses} onChange={(v) => updateComponentInContainer(containerId, comp.id, { customClasses: v })} />
        </div>
    )
}

function CustomImageEditor({ comp, containerId }: { comp: ComponentItem & { kind: 'custom-image' }; containerId: string }) {
    const { updateComponentInContainer } = useStudioStore()
    function p(k: string, v: unknown) { updateComponentInContainer(containerId, comp.id, { [k]: v }) }
    return (
        <div className="space-y-3">
            <Field label="Image URL"><input className={inputCls} value={comp.src} onChange={(e) => p('src', e.target.value)} placeholder="https://example.com/image.jpg" /></Field>
            <Field label="Alt Text"><input className={inputCls} value={comp.alt} onChange={(e) => p('alt', e.target.value)} placeholder="Describe the image" /></Field>
            <div className="grid grid-cols-2 gap-2">
                <Field label="Width"><input className={inputCls} value={comp.width} onChange={(e) => p('width', e.target.value)} placeholder="100% or 400px" /></Field>
                <Field label="Height"><input className={inputCls} value={comp.height} onChange={(e) => p('height', e.target.value)} placeholder="auto or 300px" /></Field>
            </div>
            <Field label="Object Fit">
                <select value={comp.objectFit} onChange={(e) => p('objectFit', e.target.value)} className={selectCls}>
                    {(['cover', 'contain', 'fill', 'auto'] as const).map((v) => <option key={v} value={v}>{v}</option>)}
                </select>
            </Field>
            <AdvancedSection value={comp.customClasses} onChange={(v) => p('customClasses', v)} />
        </div>
    )
}

// ─── Prebuilt editor dispatch ─────────────────────────────────────────────────

const SECTION_DATA_TYPES = new Set(['announcement-bar', 'benefits-bar', 'featured-collection', 'testimonials', 'newsletter', 'trust-badges', 'brand-strip'])

function PrebuiltEditor({ comp, containerId }: { comp: ComponentItem & { kind: 'prebuilt' }; containerId: string }) {
    const { updateComponentInContainer } = useStudioStore()
    return (
        <div className="space-y-4">
            {comp.sectionType === 'hero' && <HeroEditor />}
            {comp.sectionType === 'product-grid' && <ProductGridEditor />}
            {SECTION_DATA_TYPES.has(comp.sectionType) && <SectionDataEditor sectionKey={comp.sectionType} />}
            {!['hero', 'product-grid', ...SECTION_DATA_TYPES].includes(comp.sectionType) && (
                <p className="text-xs text-muted-foreground">This component has no editable content fields.</p>
            )}
            <AdvancedSection value={comp.customClasses} onChange={(v) => updateComponentInContainer(containerId, comp.id, { customClasses: v })} />
        </div>
    )
}

// ─── Main component editor ────────────────────────────────────────────────────

const COMPONENT_LABELS: Record<string, string> = {
    hero: 'Hero', 'product-grid': 'Product Grid', categories: 'Categories', footer: 'Footer',
    'announcement-bar': 'Announcement Bar', 'benefits-bar': 'Benefits Bar',
    'featured-collection': 'Featured Collection', testimonials: 'Testimonials',
    newsletter: 'Newsletter', 'trust-badges': 'Trust Badges', 'brand-strip': 'Brand Strip',
    'custom-text': 'Custom Text', 'custom-image': 'Custom Image',
}

export function ComponentEditor({ containerId, componentId }: { containerId: string; componentId: string }) {
    const { containers, setSelectedComponent } = useStudioStore()
    const comp = findComponentDeep(containers, containerId, componentId)
    if (!comp) return null

    const label = comp.kind === 'prebuilt' ? COMPONENT_LABELS[comp.sectionType] : comp.kind === 'custom-text' ? 'Custom Text' : 'Custom Image'

    return (
        <div data-testid="component-editor">
            <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
                <span className="text-xs font-semibold text-foreground">{label}</span>
                <button onClick={() => setSelectedComponent(null)} className="text-[10px] text-muted-foreground hover:text-foreground">✕ Close</button>
            </div>
            <div className="space-y-4 p-3">
                {comp.kind === 'prebuilt' && <PrebuiltEditor comp={comp} containerId={containerId} />}
                {comp.kind === 'custom-text' && <CustomTextEditor comp={comp} containerId={containerId} />}
                {comp.kind === 'custom-image' && <CustomImageEditor comp={comp} containerId={containerId} />}
            </div>
        </div>
    )
}
