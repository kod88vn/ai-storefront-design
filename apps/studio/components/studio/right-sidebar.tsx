'use client'

import { useState } from 'react'
import {
  Palette,
  Layout,
  Type,
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useStudioStore } from '@/lib/store'

// ── Shared helpers ────────────────────────────────────────────────────────────

const selectCls =
  'h-9 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-ring'

interface PanelProps {
  title: string
  icon: React.ElementType
  testId: string
  children: React.ReactNode
}

function Panel({ title, icon: Icon, testId, children }: PanelProps) {
  const [open, setOpen] = useState(true)
  return (
    <div data-testid={testId} className="border-b border-border last:border-b-0">
      <button
        onClick={() => setOpen((o) => !o)}
        data-testid={`${testId}-toggle`}
        className="flex w-full items-center justify-between px-3 py-2 text-sm font-medium hover:bg-muted/50"
      >
        <span className="flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {title}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div data-testid={`${testId}-body`} className="space-y-4 px-3 pb-4">
          {children}
        </div>
      )}
    </div>
  )
}

// ── ThemePanel ────────────────────────────────────────────────────────────────

function ThemePanel() {
  const { config, updateTheme } = useStudioStore()
  const { theme } = config

  return (
    <Panel title="Theme" icon={Palette} testId="theme-panel">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Primary Color</Label>
        <div className="flex items-center gap-2" data-testid="primary-color-row">
          <input
            type="color"
            value={theme.primaryColor}
            onChange={(e) => updateTheme({ primaryColor: e.target.value })}
            data-testid="primary-color-picker"
            className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
          />
          <Input
            value={theme.primaryColor}
            onChange={(e) => updateTheme({ primaryColor: e.target.value })}
            data-testid="primary-color-input"
            className="h-9 flex-1 font-mono text-xs"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Secondary Color</Label>
        <div className="flex items-center gap-2" data-testid="secondary-color-row">
          <input
            type="color"
            value={theme.secondaryColor}
            onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
            data-testid="secondary-color-picker"
            className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
          />
          <Input
            value={theme.secondaryColor}
            onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
            data-testid="secondary-color-input"
            className="h-9 flex-1 font-mono text-xs"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Border Radius</Label>
        <select
          value={theme.borderRadius}
          onChange={(e) =>
            updateTheme({ borderRadius: e.target.value as 'none' | 'md' | 'full' })
          }
          data-testid="border-radius-select"
          className={selectCls}
        >
          <option value="none">None (0px)</option>
          <option value="md">Medium (8px)</option>
          <option value="full">Full (9999px)</option>
        </select>
      </div>
    </Panel>
  )
}

// ── LayoutPanel ───────────────────────────────────────────────────────────────

function LayoutPanel() {
  const { config, reorderSections, toggleSection } = useStudioStore()
  const { sections } = config
  const [draggedId, setDraggedId] = useState<string | null>(null)

  function handleDragOver(e: React.DragEvent, targetId: string) {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return
    const copy = [...sections]
    const from = copy.findIndex((s) => s.id === draggedId)
    const to = copy.findIndex((s) => s.id === targetId)
    const [item] = copy.splice(from, 1)
    copy.splice(to, 0, item)
    copy.forEach((s, i) => (s.order = i))
    reorderSections(copy)
  }

  const sorted = [...sections].sort((a, b) => a.order - b.order)

  return (
    <Panel title="Layout" icon={Layout} testId="layout-panel">
      <p className="text-xs text-muted-foreground">Drag to reorder sections</p>
      {sorted.map((section) => (
        <div
          key={section.id}
          draggable
          onDragStart={() => setDraggedId(section.id)}
          onDragOver={(e) => handleDragOver(e, section.id)}
          onDragEnd={() => setDraggedId(null)}
          data-testid={`section-row-${section.id}`}
          className={`flex cursor-move items-center gap-2 rounded-lg border bg-card px-3 py-2 transition-opacity ${draggedId === section.id || !section.enabled ? 'opacity-50' : ''
            }`}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
          <span className="flex-1 text-sm capitalize">
            {section.type.replace('-', ' ')}
          </span>
          <button
            onClick={() => toggleSection(section.id)}
            data-testid={`section-toggle-${section.id}`}
            className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            {section.enabled ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
      ))}
    </Panel>
  )
}

// ── ContentPanel ──────────────────────────────────────────────────────────────

function ContentPanel() {
  const { config, updateHero, setProductGridColumns } = useStudioStore()
  const { hero, productGrid } = config

  return (
    <Panel title="Content" icon={Type} testId="content-panel">
      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Hero Layout</Label>
        <select
          value={hero.layout}
          onChange={(e) =>
            updateHero({ layout: e.target.value as 'split' | 'centered' | 'minimal' })
          }
          data-testid="hero-layout-select"
          className={selectCls}
        >
          <option value="split">Split</option>
          <option value="centered">Centered</option>
          <option value="minimal">Minimal</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Hero Title</Label>
        <Input
          value={hero.title}
          onChange={(e) => updateHero({ title: e.target.value })}
          data-testid="hero-title-input"
          className="h-9 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Hero Subtitle</Label>
        <Input
          value={hero.subtitle}
          onChange={(e) => updateHero({ subtitle: e.target.value })}
          data-testid="hero-subtitle-input"
          className="h-9 text-sm"
        />
      </div>

      <div className="space-y-2">
        <Label className="text-xs text-muted-foreground">Product Grid Columns</Label>
        <select
          value={productGrid.columns.toString()}
          onChange={(e) => setProductGridColumns(parseInt(e.target.value) as 2 | 3 | 4)}
          data-testid="grid-columns-select"
          className={selectCls}
        >
          <option value="2">2 Columns</option>
          <option value="3">3 Columns</option>
          <option value="4">4 Columns</option>
        </select>
      </div>
    </Panel>
  )
}

// ── Root ──────────────────────────────────────────────────────────────────────

export function RightSidebar() {
  return (
    <div
      data-testid="right-sidebar"
      className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-background"
    >
      <div data-testid="right-sidebar-header" className="shrink-0 border-b border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Live Editor</h2>
        <p className="mt-1 text-xs text-muted-foreground">Customize your storefront in real-time</p>
      </div>

      <div
        data-testid="right-sidebar-content"
        className="min-h-0 flex-1 overflow-y-auto"
      >
        <ThemePanel />
        <LayoutPanel />
        <ContentPanel />
      </div>
    </div>
  )
}



