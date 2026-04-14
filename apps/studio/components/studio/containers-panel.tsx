'use client'

import { useState } from 'react'
import { Layers, ChevronDown, Plus } from 'lucide-react'
import { useStudioStore } from '@/lib/store'
import { ContainerNode } from './container-node'
import type { ComponentItem } from '@/lib/types'

function collectUsedTypes(comps: ComponentItem[], set: Set<string>) {
    for (const comp of comps) {
        if (comp.kind === 'prebuilt') set.add(comp.sectionType)
        if (comp.kind === 'container') collectUsedTypes(comp.components, set)
    }
}

export function ContainersPanel({ title = 'Containers' }: { title?: string }) {
    const {
        pageContainers, currentPage,
        addContainer, addComponentToContainer, removeContainer, reorderContainers,
        updateContainerLabel, updateContainerLayoutMode, updateContainerFlexConfig,
        updateContainerGridConfig, removeComponentFromContainer, updateComponentInContainer,
    } = useStudioStore()
    const containers = pageContainers[currentPage] ?? []
    const [open, setOpen] = useState(false)
    const [draggingContainerId, setDraggingContainerId] = useState<string | null>(null)
    const [overContainerId, setOverContainerId] = useState<string | null>(null)

    const usedTypes = new Set<string>()
    for (const c of containers) collectUsedTypes(c.components, usedTypes)

    function moveContainer(fromId: string, targetId: string) {
        if (fromId === targetId) return
        const from = containers.findIndex((c) => c.id === fromId)
        const to = containers.findIndex((c) => c.id === targetId)
        if (from < 0 || to < 0) return
        const next = [...containers]
        const [moved] = next.splice(from, 1)
        next.splice(to, 0, moved)
        reorderContainers(next)
    }

    function handleDropOn(targetId: string) {
        if (!draggingContainerId) return
        moveContainer(draggingContainerId, targetId)
        setDraggingContainerId(null)
        setOverContainerId(null)
    }

    return (
        <div data-testid="containers-panel">
            <button onClick={() => setOpen((o) => !o)} data-testid="containers-panel-toggle" className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-xs font-semibold hover:bg-muted/50">
                <span className="flex items-center gap-2"><Layers className="h-3.5 w-3.5" />{title}</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <>
                    <div className="flex justify-end border-b border-border px-3 py-1.5">
                        <button onClick={addContainer} className="flex items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-medium text-primary hover:bg-primary/20" data-testid="add-container-button">
                            <Plus className="h-3 w-3" />Add Container
                        </button>
                    </div>
                    <div data-testid="containers-list">
                        {containers.map((c) => (
                            <div
                                key={c.id}
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.effectAllowed = 'move'
                                    setDraggingContainerId(c.id)
                                }}
                                onDragOver={(e) => {
                                    e.preventDefault()
                                    if (!draggingContainerId || draggingContainerId === c.id) return
                                    if (overContainerId !== c.id) {
                                        setOverContainerId(c.id)
                                        moveContainer(draggingContainerId, c.id)
                                    }
                                }}
                                onDragLeave={() => {
                                    if (overContainerId === c.id) setOverContainerId(null)
                                }}
                                onDrop={() => handleDropOn(c.id)}
                                onDragEnd={() => {
                                    setDraggingContainerId(null)
                                    setOverContainerId(null)
                                }}
                                className={`transition-all duration-150 ${draggingContainerId === c.id
                                    ? 'scale-[0.99] opacity-55 ring-1 ring-primary/40'
                                    : overContainerId === c.id
                                        ? 'translate-y-1 border-t-2 border-primary/50'
                                        : ''
                                    }`}
                            >
                                <ContainerNode
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
                            </div>
                        ))}
                    </div>
                </>
            )}
        </div>
    )
}
