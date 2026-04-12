'use client'

import { useState, type DragEvent } from 'react'
import { GripVertical, Layers, ChevronDown, Trash2, Plus, Pencil, Type, Image as ImageIcon } from 'lucide-react'
import { useStudioStore } from '@/lib/store'
import { ContainerLayoutConfig, labelCls } from './container-layout-config'
import type { ComponentItem, ContainerLayoutMode, FlexContainerConfig, GridContainerConfig, SectionType } from '@/lib/types'

const SECTION_LABELS: Record<string, string> = {
    hero: 'Hero', 'product-grid': 'Product Grid', categories: 'Categories', footer: 'Footer',
    'announcement-bar': 'Announcement Bar', 'benefits-bar': 'Benefits Bar',
    'featured-collection': 'Featured Collection', testimonials: 'Testimonials',
    newsletter: 'Newsletter', 'trust-badges': 'Trust Badges', 'brand-strip': 'Brand Strip',
}
const ALL_SECTION_TYPES: SectionType[] = [
    'hero', 'product-grid', 'categories', 'announcement-bar', 'benefits-bar',
    'featured-collection', 'testimonials', 'newsletter', 'trust-badges', 'brand-strip', 'footer',
]

const DEPTH_BORDER = ['border-primary/60', 'border-violet-400/70', 'border-emerald-400/70', 'border-amber-400/70']
const DEPTH_HEADER = ['bg-primary/5', 'bg-violet-500/5', 'bg-emerald-500/5', 'bg-amber-500/5']
const DEPTH_BADGE = [
    'bg-primary/10 text-primary',
    'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
]

export interface ContainerCbs {
    onLabelSave: (l: string) => void
    onMode: (m: ContainerLayoutMode) => void
    onFlex: (p: Partial<FlexContainerConfig>) => void
    onGrid: (p: Partial<GridContainerConfig>) => void
    onAdd: (comp: ComponentItem) => void
    onRemoveChild: (id: string) => void
    onPatchChild: (id: string, patch: Record<string, unknown>) => void
    onRemoveSelf: () => void
}

interface DragHandleProps {
    draggable?: boolean
    onDragStart?: (e: DragEvent<HTMLButtonElement>) => void
    onDragEnd?: () => void
}

function ComponentRow({ comp, containerId, onRemove, editable = true }: { comp: ComponentItem; containerId: string; onRemove?: () => void; editable?: boolean }) {
    const { removeComponentFromContainer, setSelectedComponent, selectedComponent } = useStudioStore()
    const isSelected = editable && selectedComponent?.containerId === containerId && selectedComponent.componentId === comp.id
    const label = comp.kind === 'prebuilt' ? (SECTION_LABELS[comp.sectionType] ?? comp.sectionType) : comp.kind === 'custom-text' ? 'Custom Text' : 'Custom Image'
    const doRemove = onRemove ?? (() => removeComponentFromContainer(containerId, comp.id))
    return (
        <div data-testid={`component-row-${comp.id}`} className={`flex items-center gap-1.5 rounded-md border px-2 py-1.5 ${isSelected ? 'border-primary bg-primary/5' : 'border-border bg-card'}`}>
            <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            <span className="flex-1 text-xs">{label}</span>
            {editable && <button onClick={() => setSelectedComponent(isSelected ? null : { containerId, componentId: comp.id })} className={`rounded p-0.5 ${isSelected ? 'text-primary' : 'text-muted-foreground hover:text-foreground'}`} data-testid={`edit-component-${comp.id}`}><Pencil className="h-3 w-3" /></button>}
            <button onClick={doRemove} className="rounded p-0.5 text-muted-foreground hover:text-destructive" data-testid={`remove-component-${comp.id}`}><Trash2 className="h-3 w-3" /></button>
        </div>
    )
}

function ComponentPickerInline({ onAdd, usedTypes, onClose }: {
    onAdd: (comp: ComponentItem) => void; usedTypes: Set<string>; onClose: () => void
}) {
    function add(comp: ComponentItem) { onAdd(comp); onClose() }
    return (
        <div data-testid="component-picker" className="rounded-md border border-border bg-card p-2 shadow-md">
            <div className="mb-1.5 flex items-center justify-between">
                <span className={labelCls}>Add to Container</span>
                <button onClick={onClose} className="text-[10px] text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="max-h-52 space-y-0.5 overflow-y-auto">
                <button onClick={() => add({ kind: 'container', id: crypto.randomUUID(), label: 'Container', layoutMode: 'block', flexConfig: { direction: 'row', wrap: false, justify: 'start', align: 'start', gap: 4 }, gridConfig: { cols: 2, gap: 4 }, components: [], customClasses: '' })} className="flex w-full items-center gap-1.5 rounded bg-primary/8 px-2 py-1.5 text-left text-xs font-semibold text-primary hover:bg-primary/15">
                    <Layers className="h-3.5 w-3.5" />Container
                </button>
                <hr className="my-1 border-border" />
                {ALL_SECTION_TYPES.map((type) => {
                    const disabled = usedTypes.has(type)
                    return (
                        <button key={type} disabled={disabled} onClick={() => add({ kind: 'prebuilt', id: crypto.randomUUID(), sectionType: type, customClasses: '' })} className={`flex w-full items-center justify-between rounded px-2 py-1 text-left text-xs ${disabled ? 'cursor-not-allowed opacity-40' : 'hover:bg-muted'}`}>
                            {SECTION_LABELS[type] ?? type}
                            {disabled && <span className="text-[9px] text-muted-foreground">in use</span>}
                        </button>
                    )
                })}
                <hr className="my-1 border-border" />
                <button onClick={() => add({ kind: 'custom-text', id: crypto.randomUUID(), html: '<p>Type here…</p>', customClasses: '' })} className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs hover:bg-muted"><Type className="h-3 w-3" />Custom Text</button>
                <button onClick={() => add({ kind: 'custom-image', id: crypto.randomUUID(), src: '', alt: '', width: '100%', height: 'auto', objectFit: 'cover', customClasses: '' })} className="flex w-full items-center gap-1.5 rounded px-2 py-1 text-left text-xs hover:bg-muted"><ImageIcon className="h-3 w-3" />Custom Image</button>
            </div>
        </div>
    )
}

export function ContainerNode({ id, label, layoutMode, flexConfig, gridConfig, components, usedTypes, depth = 0, cbs, dragHandleProps }: {
    id: string; label: string; layoutMode: ContainerLayoutMode
    flexConfig: FlexContainerConfig; gridConfig: GridContainerConfig
    components: ComponentItem[]; usedTypes: Set<string>; depth?: number
    cbs: ContainerCbs
    dragHandleProps?: DragHandleProps
}) {
    const [open, setOpen] = useState(depth === 0)
    const [editing, setEditing] = useState(false)
    const [labelVal, setLabelVal] = useState(label)
    const [showPicker, setShowPicker] = useState(false)

    function saveLabel() { cbs.onLabelSave(labelVal); setEditing(false) }

    const d = Math.min(depth, DEPTH_BORDER.length - 1)

    return (
        <div data-testid={`container-node-${id}`} className={`border-l-2 ${DEPTH_BORDER[d]} ${depth === 0 ? 'border-b border-border' : 'ml-3 mt-2 rounded-r-sm'}`}>
            <div className={`flex items-center gap-1.5 px-2 py-2 ${DEPTH_HEADER[d]}`}>
                {depth === 0 && (
                    <button
                        type="button"
                        data-testid={`drag-container-${id}`}
                        title="Drag to reorder"
                        className="cursor-grab rounded p-0.5 text-muted-foreground active:cursor-grabbing"
                        {...dragHandleProps}
                    >
                        <GripVertical className="h-4 w-4 shrink-0" />
                    </button>
                )}
                <Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                {editing
                    ? <input value={labelVal} onChange={(e) => setLabelVal(e.target.value)} onBlur={saveLabel} onKeyDown={(e) => e.key === 'Enter' && saveLabel()} autoFocus className="flex-1 rounded border border-ring bg-background px-1.5 text-xs focus:outline-none" />
                    : <span className="flex-1 cursor-pointer select-none text-xs font-semibold tracking-tight hover:text-primary" onClick={() => setEditing(true)}>{label}</span>
                }
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide ${DEPTH_BADGE[d]}`}>{layoutMode}</span>
                <button onClick={() => setOpen((o) => !o)} className="rounded p-0.5 hover:bg-black/5 dark:hover:bg-white/10" data-testid={`toggle-${id}`}>
                    <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                <button onClick={cbs.onRemoveSelf} className="rounded p-0.5 text-muted-foreground hover:text-destructive" data-testid={`remove-container-${id}`}>
                    <Trash2 className="h-3.5 w-3.5" />
                </button>
            </div>

            {open && (
                <div className="space-y-2 p-2 pb-3">
                    <ContainerLayoutConfig
                        id={id} layoutMode={layoutMode} flexConfig={flexConfig} gridConfig={gridConfig}
                        onMode={cbs.onMode} onFlex={cbs.onFlex} onGrid={cbs.onGrid}
                    />
                    <div className="space-y-1">
                        {components.map((comp) => {
                            if (comp.kind === 'container') {
                                const nc = comp
                                return (
                                    <ContainerNode
                                        key={nc.id}
                                        id={nc.id} label={nc.label} layoutMode={nc.layoutMode}
                                        flexConfig={nc.flexConfig} gridConfig={nc.gridConfig} components={nc.components}
                                        usedTypes={usedTypes} depth={depth + 1}
                                        cbs={{
                                            onLabelSave: (l) => cbs.onPatchChild(nc.id, { label: l }),
                                            onMode: (m) => cbs.onPatchChild(nc.id, { layoutMode: m }),
                                            onFlex: (p) => cbs.onPatchChild(nc.id, { flexConfig: { ...nc.flexConfig, ...p } }),
                                            onGrid: (p) => cbs.onPatchChild(nc.id, { gridConfig: { ...nc.gridConfig, ...p } }),
                                            onAdd: (c) => cbs.onPatchChild(nc.id, { components: [...nc.components, c] }),
                                            onRemoveChild: (cId) => cbs.onPatchChild(nc.id, { components: nc.components.filter((x) => x.id !== cId) }),
                                            onPatchChild: (cId, patch) => cbs.onPatchChild(nc.id, { components: nc.components.map((x) => x.id === cId ? { ...x, ...patch } : x) }),
                                            onRemoveSelf: () => cbs.onRemoveChild(nc.id),
                                        }}
                                    />
                                )
                            }
                            return (
                                <ComponentRow key={comp.id} comp={comp} containerId={id} onRemove={() => cbs.onRemoveChild(comp.id)} />
                            )
                        })}
                    </div>
                    {showPicker
                        ? <ComponentPickerInline onAdd={cbs.onAdd} usedTypes={usedTypes} onClose={() => setShowPicker(false)} />
                        : (
                            <button onClick={() => setShowPicker(true)} className="mt-1 flex items-center gap-1 rounded px-1 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground" data-testid={`add-to-${id}`}>
                                <Plus className="h-3.5 w-3.5" />Add
                            </button>
                        )
                    }
                </div>
            )}
        </div>
    )
}
