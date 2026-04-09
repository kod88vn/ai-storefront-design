'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Palette, ChevronDown, Save, Check, Plus, GripVertical, Trash2, Pencil, Type, Image as ImageIcon, Layers, ArrowRight, ArrowDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useStudioStore } from '@/lib/store'
import { ComponentEditor } from '@/components/studio/component-editor'
import type { DesignerContainer, ComponentItem, ContainerLayoutMode, FlexContainerConfig, GridContainerConfig, SectionType } from '@/lib/types'

// ─── Constants ────────────────────────────────────────────────────────────────

const selectCls = 'h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
const labelCls = 'text-[10px] font-medium uppercase tracking-wider text-muted-foreground'

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

// ─── ThemePanel ───────────────────────────────────────────────────────────────

function ThemePanel() {
  const { config, updateTheme } = useStudioStore()
  const { theme } = config
  const [open, setOpen] = useState(true)
  return (
    <div data-testid="theme-panel" className="border-b border-border">
      <button onClick={() => setOpen((o) => !o)} data-testid="theme-panel-toggle" className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-muted/50">
        <span className="flex items-center gap-2"><Palette className="h-3.5 w-3.5" />Theme</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div data-testid="theme-panel-body" className="space-y-3 px-3 pb-3">
          {([['Primary', 'primaryColor', theme.primaryColor], ['Secondary', 'secondaryColor', theme.secondaryColor]] as const).map(([label, key, val]) => (
            <div key={key} className="space-y-1">
              <span className={labelCls}>{label} Color</span>
              <div className="flex items-center gap-2" data-testid={`${key}-row`}>
                <input type="color" value={val} onChange={(e) => updateTheme({ [key]: e.target.value })} data-testid={`${key}-picker`} className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent" />
                <Input value={val} onChange={(e) => updateTheme({ [key]: e.target.value })} data-testid={`${key}-input`} className="h-8 flex-1 font-mono text-xs" />
              </div>
            </div>
          ))}
          <div className="space-y-1">
            <span className={labelCls}>Border Radius</span>
            <select value={theme.borderRadius} onChange={(e) => updateTheme({ borderRadius: e.target.value as 'none' | 'md' | 'full' })} data-testid="border-radius-select" className={selectCls}>
              <option value="none">None (0px)</option>
              <option value="md">Medium (8px)</option>
              <option value="full">Full (9999px)</option>
            </select>
          </div>
          <div className="space-y-1">
            <span className={labelCls}>Nav Style</span>
            <select value={theme.navStyle ?? 'bordered'} onChange={(e) => updateTheme({ navStyle: e.target.value as 'bordered' | 'transparent' | 'filled' })} data-testid="nav-style-select" className={selectCls}>
              <option value="bordered">Bordered (white + border)</option>
              <option value="transparent">Transparent (overlay on hero)</option>
              <option value="filled">Filled (solid brand color)</option>
            </select>
          </div>
          <div className="space-y-1">
            <span className={labelCls}>Color Scheme</span>
            <div className="flex gap-1">
              {([['light', '☀️ Light'], ['dark', '🌙 Dark']] as const).map(([val, lbl]) => (
                <button key={val} onClick={() => updateTheme({ colorScheme: val })} data-testid={`color-scheme-${val}`}
                  className={`flex-1 rounded py-1.5 text-xs font-medium transition-colors ${(theme.colorScheme ?? 'light') === val ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                  {lbl}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <span className={labelCls}>Font Style</span>
            <select value={theme.fontStyle ?? 'modern-sans'} onChange={(e) => updateTheme({ fontStyle: e.target.value as 'modern-sans' | 'editorial-serif' | 'mono-tech' })} data-testid="font-style-select" className={selectCls}>
              <option value="modern-sans">Modern Sans</option>
              <option value="editorial-serif">Editorial Serif</option>
              <option value="mono-tech">Mono Tech</option>
            </select>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ContainerLayoutConfig ────────────────────────────────────────────────────
// Visual 3×3 alignment picker — columns = horizontal, rows = vertical
// direction=row  → justify=horizontal, align=vertical
// direction=col  → align=horizontal, justify=vertical

const POS_VALS = ['start', 'center', 'end'] as const
const CELL_GLYPHS = ['↖', '↑', '↗', '←', '·', '→', '↙', '↓', '↘']

function ContainerLayoutConfig({ id, layoutMode, flexConfig, gridConfig, onMode, onFlex, onGrid }: {
  id: string; layoutMode: ContainerLayoutMode; flexConfig: FlexContainerConfig; gridConfig: GridContainerConfig
  onMode: (m: ContainerLayoutMode) => void; onFlex: (p: Partial<FlexContainerConfig>) => void; onGrid: (p: Partial<GridContainerConfig>) => void
}) {
  const { direction, justify, align, gap, wrap } = flexConfig

  // Map current flex values to visual col/row (horizontal/vertical)
  const hVal = direction === 'row' ? justify : align
  const vVal = direction === 'row' ? align : justify
  const selCol = POS_VALS.indexOf(hVal as typeof POS_VALS[number])
  const selRow = POS_VALS.indexOf(vVal as typeof POS_VALS[number])

  function handleCellClick(col: number, row: number) {
    const h = POS_VALS[col]
    const v = POS_VALS[row]
    onFlex(direction === 'row' ? { justify: h, align: v } : { align: h, justify: v })
  }

  const gapVal = layoutMode === 'grid' ? gridConfig.gap : gap
  function setGap(v: number) { layoutMode === 'grid' ? onGrid({ gap: v }) : onFlex({ gap: v }) }

  return (
    <div data-testid={`layout-config-${id}`} className="space-y-3 rounded-md border border-border bg-muted/20 p-3">
      {/* Mode tabs: Stack / Flex / Grid */}
      <div className="space-y-1.5">
        <span className={labelCls}>Layout</span>
        <div className="flex gap-1">
          <button onClick={() => onMode('block')} title="Items stack vertically, full width"
            className={`flex-1 rounded py-1 text-xs font-medium transition-colors ${layoutMode === 'block' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>Stack</button>
          <button onClick={() => onMode('flex')} title="Arrange items in a row or column with alignment"
            className={`flex-1 rounded py-1 text-xs font-medium transition-colors ${layoutMode === 'flex' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>Flex</button>
          <button onClick={() => onMode('grid')} title="Arrange items in a fixed column grid"
            className={`flex-1 rounded py-1 text-xs font-medium transition-colors ${layoutMode === 'grid' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>Grid</button>
        </div>
      </div>

      {/* Stack: no extra controls */}
      {layoutMode === 'block' && (
        <p className="text-[10px] text-muted-foreground">Items stack top to bottom, each taking full width.</p>
      )}

      {/* Flex controls */}
      {layoutMode === 'flex' && (
        <>
          <div className="space-y-1.5">
            <span className={labelCls}>Direction</span>
            <div className="flex gap-1">
              {([['row', 'Row →', ArrowRight], ['column', 'Column ↓', ArrowDown]] as const).map(([val, lbl, Icon]) => (
                <button key={val} onClick={() => onFlex({ direction: val })}
                  title={val === 'row' ? 'Arrange items side by side' : 'Stack items top to bottom'}
                  className={`flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors ${direction === val ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                  <Icon className="h-3.5 w-3.5" />{lbl}
                </button>
              ))}
            </div>
          </div>
          <div className="flex gap-3">
            <div className="space-y-1.5">
              <span className={labelCls}>Alignment</span>
              <div className="grid grid-cols-3 gap-0.5 rounded-md border border-border bg-background p-1" data-testid={`align-grid-${id}`}>
                {[0, 1, 2].map((row) =>
                  [0, 1, 2].map((col) => {
                    const hLabel = ['Left', 'Center', 'Right'][col]
                    const vLabel = ['Top', 'Middle', 'Bottom'][row]
                    const active = col === selCol && row === selRow
                    return (
                      <button key={`${row}-${col}`} onClick={() => handleCellClick(col, row)}
                        title={`${vLabel} ${hLabel}`}
                        className={`flex h-7 w-7 items-center justify-center rounded text-xs transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                        {CELL_GLYPHS[row * 3 + col]}
                      </button>
                    )
                  })
                )}
              </div>
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <div className="space-y-1.5">
                <span className={labelCls}>Gap</span>
                <div className="flex items-center overflow-hidden rounded-md border border-border">
                  <button onClick={() => setGap(Math.max(0, gapVal - 1))} className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-muted">−</button>
                  <span className="flex-1 text-center text-xs font-mono">{gapVal}</span>
                  <button onClick={() => setGap(Math.min(16, gapVal + 1))} className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-muted">+</button>
                </div>
              </div>
              {direction === 'row' && (
                <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-muted-foreground" title="Wrap items to next row when they overflow">
                  <input type="checkbox" checked={wrap} onChange={(e) => onFlex({ wrap: e.target.checked })} className="h-3 w-3 accent-primary" />
                  Wrap
                </label>
              )}
            </div>
          </div>
        </>
      )}

      {/* Grid controls */}
      {layoutMode === 'grid' && (
        <div className="flex gap-3">
          <div className="space-y-1.5">
            <span className={labelCls}>Columns</span>
            <div className="flex gap-1">
              {[2, 3, 4, 6].map((n) => (
                <button key={n} onClick={() => onGrid({ cols: n })} title={`${n} equal columns`}
                  className={`flex-1 rounded border py-1 text-xs font-medium transition-colors ${gridConfig.cols === n ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>{n}</button>
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <span className={labelCls}>Gap</span>
            <div className="flex items-center overflow-hidden rounded-md border border-border">
              <button onClick={() => setGap(Math.max(0, gapVal - 1))} className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-muted">−</button>
              <span className="flex-1 text-center text-xs font-mono">{gapVal}</span>
              <button onClick={() => setGap(Math.min(16, gapVal + 1))} className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-muted">+</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── ComponentRow ─────────────────────────────────────────────────────────────

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

// ─── ComponentPickerInline ────────────────────────────────────────────────────

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

// ─── ContainerNode (recursive, unified for all depths) ────────────────────────

const DEPTH_BORDER = ['border-primary/60', 'border-violet-400/70', 'border-emerald-400/70', 'border-amber-400/70']
const DEPTH_HEADER = ['bg-primary/5', 'bg-violet-500/5', 'bg-emerald-500/5', 'bg-amber-500/5']
const DEPTH_BADGE = [
  'bg-primary/10 text-primary',
  'bg-violet-100 text-violet-600 dark:bg-violet-900/30 dark:text-violet-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
]

interface ContainerCbs {
  onLabelSave: (l: string) => void
  onMode: (m: ContainerLayoutMode) => void
  onFlex: (p: Partial<FlexContainerConfig>) => void
  onGrid: (p: Partial<GridContainerConfig>) => void
  onAdd: (comp: ComponentItem) => void
  onRemoveChild: (id: string) => void
  onPatchChild: (id: string, patch: Record<string, unknown>) => void
  onRemoveSelf: () => void
}

function ContainerNode({ id, label, layoutMode, flexConfig, gridConfig, components, usedTypes, depth = 0, cbs }: {
  id: string; label: string; layoutMode: ContainerLayoutMode
  flexConfig: FlexContainerConfig; gridConfig: GridContainerConfig
  components: ComponentItem[]; usedTypes: Set<string>; depth?: number
  cbs: ContainerCbs
}) {
  const [open, setOpen] = useState(depth === 0)
  const [editing, setEditing] = useState(false)
  const [labelVal, setLabelVal] = useState(label)
  const [showPicker, setShowPicker] = useState(false)

  function saveLabel() { cbs.onLabelSave(labelVal); setEditing(false) }

  const d = Math.min(depth, DEPTH_BORDER.length - 1)

  return (
    <div
      data-testid={`container-node-${id}`}
      className={`border-l-2 ${DEPTH_BORDER[d]} ${depth === 0 ? 'border-b border-border' : 'ml-3 mt-2 rounded-r-sm'}`}
    >
      {/* Header */}
      <div className={`flex items-center gap-1.5 px-2 py-2 ${DEPTH_HEADER[d]}`}>
        {depth === 0 && <GripVertical className="h-4 w-4 shrink-0 text-muted-foreground" />}
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

      {/* Body */}
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
                <ComponentRow key={comp.id} comp={comp} containerId={id}
                  onRemove={() => cbs.onRemoveChild(comp.id)}
                />
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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function collectUsedTypes(comps: ComponentItem[], set: Set<string>) {
  for (const comp of comps) {
    if (comp.kind === 'prebuilt') set.add(comp.sectionType)
    if (comp.kind === 'container') collectUsedTypes(comp.components, set)
  }
}

// ─── ContainersPanel ──────────────────────────────────────────────────────────

function ContainersPanel() {
  const { containers, addContainer, addComponentToContainer, removeContainer, updateContainerLabel, updateContainerLayoutMode, updateContainerFlexConfig, updateContainerGridConfig, removeComponentFromContainer, updateComponentInContainer } = useStudioStore()
  const [open, setOpen] = useState(false)
  const usedTypes = new Set<string>()
  for (const c of containers) collectUsedTypes(c.components, usedTypes)
  return (
    <div data-testid="containers-panel">
      <button onClick={() => setOpen((o) => !o)} data-testid="containers-panel-toggle" className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-xs font-semibold hover:bg-muted/50">
        <span className="flex items-center gap-2"><Layers className="h-3.5 w-3.5" />Containers</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <>
        <div className="flex justify-end border-b border-border px-3 py-1.5">
          <button onClick={addContainer} className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20" data-testid="add-container-button">
            <Plus className="h-3 w-3" />Add Container
          </button>
        </div>
        <div data-testid="containers-list">
          {containers.map((c) => (
            <ContainerNode
              key={c.id}
              id={c.id} label={c.label} layoutMode={c.layoutMode}
              flexConfig={c.flexConfig} gridConfig={c.gridConfig} components={c.components}
              usedTypes={usedTypes} depth={0}
              cbs={{
                onLabelSave: (l) => updateContainerLabel(c.id, l),
                onMode: (m) => updateContainerLayoutMode(c.id, m),
                onFlex: (p) => updateContainerFlexConfig(c.id, p),
                onGrid: (p) => updateContainerGridConfig(c.id, p),
                onAdd: (comp) => addComponentToContainer(c.id, comp),
                onRemoveChild: (compId) => removeComponentFromContainer(c.id, compId),
                onPatchChild: (compId, patch) => updateComponentInContainer(c.id, compId, patch),
                onRemoveSelf: () => removeContainer(c.id),
              }}
            />
          ))}
        </div>
      </>}
    </div>
  )
}

// ─── RightSidebar ─────────────────────────────────────────────────────────────

export function RightSidebar() {
  const { config, selectedComponent } = useStudioStore()
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')
  async function handleSave() {
    setSaveState('saving')
    try {
      await fetch('/api/store-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config }) })
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch { setSaveState('idle') }
  }
  return (
    <div data-testid="right-sidebar" className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-background">
      <div data-testid="right-sidebar-header" className="shrink-0 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Designer</h2>
      </div>
      <div className="relative min-h-0 flex-1">
        <div data-testid="right-sidebar-content" className="h-full overflow-y-auto">
          <ThemePanel />
          <ContainersPanel />
        </div>
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />
      </div>
      <AnimatePresence initial={false}>
        {selectedComponent && (
          <motion.div
            key="editor-pane"
            data-testid="component-editor-pane"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.4, 0, 0.2, 1] }}
            className="shrink-0 overflow-hidden bg-muted shadow-[0_-4px_12px_rgba(0,0,0,0.08)]"
            style={{ borderTop: '3px solid transparent', borderImage: 'linear-gradient(to right, #f87171, #fb923c, #facc15, #4ade80, #38bdf8, #818cf8, #e879f9) 1' }}
          >
            <div className="relative max-h-[45vh]">
              <div className="overflow-y-auto max-h-[45vh]">
                <ComponentEditor containerId={selectedComponent.containerId} componentId={selectedComponent.componentId} />
              </div>
              <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-10 bg-gradient-to-t from-muted to-transparent" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <div data-testid="right-sidebar-footer" className="shrink-0 border-t border-border p-3">
        <button data-testid="save-config-button" onClick={handleSave} disabled={saveState === 'saving'} className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60">
          {saveState === 'saved' ? <><Check className="h-4 w-4" />Saved!</> : <><Save className="h-4 w-4" />{saveState === 'saving' ? 'Saving…' : 'Save to Web'}</>}
        </button>
      </div>
    </div>
  )
}
