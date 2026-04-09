'use client'

import { useStudioStore } from '@/lib/store'
import type { ComponentItem, DesignerContainer } from '@/lib/types'
import { WysiwygEditor } from './wysiwyg-editor'
import { AdvancedSection } from './advanced-section'
import { PrebuiltEditor } from './prebuilt-editor'

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
