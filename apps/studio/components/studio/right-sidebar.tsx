'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Save, Check } from 'lucide-react'
import { useStudioStore } from '@/lib/store'
import { ComponentEditor } from '@/components/studio/component-editor'
import { ThemePanel } from './theme-panel'
import { NavPanel } from './nav-panel'
import { PageSelector } from './page-selector'
import { PageSettingsPanel } from './page-settings-panel'

export function RightSidebar() {
  const { config, customPages, pageContainers, selectedComponent } = useStudioStore()
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved'>('idle')

  async function handleSave() {
    setSaveState('saving')
    try {
      // Convert each custom page's containers into LayoutSection[] for the web renderer
      const customPagesWithSections = customPages.map((p) => {
        const containers = pageContainers[p.id] ?? []
        let order = 0
        const sections = containers.flatMap((container) =>
          container.components
            .filter((c) => c.kind === 'prebuilt')
            .map((c) => ({ id: c.sectionType, type: c.sectionType, enabled: true, order: order++ }))
        )
        return { ...p, sections }
      })
      // Convert core page containers into LayoutSection[] for the web renderer
      const corePageIds = ['products', 'product-detail', 'cart'] as const
      const pagesSections: Partial<Record<(typeof corePageIds)[number], { id: string; type: string; enabled: boolean; order: number }[]>> = {}
      for (const pid of corePageIds) {
        let order = 0
        pagesSections[pid] = (pageContainers[pid] ?? []).flatMap((container) =>
          container.components
            .filter((c) => c.kind === 'prebuilt')
            .map((c) => ({ id: c.sectionType, type: c.sectionType, enabled: true, order: order++ }))
        )
      }
      const payload = { ...config, customPages: customPagesWithSections, pagesSections }
      await fetch('/api/store-config', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ config: payload }) })
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch { setSaveState('idle') }
  }

  return (
    <div data-testid="right-sidebar" className="flex h-full w-80 shrink-0 flex-col border-l border-border bg-background">
      <div data-testid="right-sidebar-header" className="shrink-0 border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold">Designer</h2>
      </div>
      <PageSelector />
      <div className="relative min-h-0 flex-1">
        <div data-testid="right-sidebar-content" className="h-full overflow-y-auto">
          <NavPanel />
          <ThemePanel />
          <PageSettingsPanel />
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
