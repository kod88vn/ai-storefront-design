'use client'

import { useState } from 'react'
import { ChevronDown, Navigation, Plus, GripVertical, Trash2, FileEdit } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useStudioStore } from '@/lib/store'

const labelCls = 'text-[10px] font-medium uppercase tracking-wider text-muted-foreground'

export function NavPanel() {
    const { config, customPages, updateNavBrandName, updateNavStyle, addNavLink, updateNavLink, removeNavLink } = useStudioStore()
    const nav = config.nav ?? { brandName: 'STUDIO', links: [] }
    const [open, setOpen] = useState(false)

    function addCustomPageLink(slug: string, name: string) {
        addNavLink()
        // After addNavLink, the new link is last — update it with the page details
        const state = useStudioStore.getState()
        const newLink = state.config.nav?.links.at(-1)
        if (newLink) updateNavLink(newLink.id, { label: name, href: slug })
    }

    return (
        <div data-testid="nav-panel" className="border-b border-border">
            <button
                onClick={() => setOpen((o) => !o)}
                data-testid="nav-panel-toggle"
                className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-muted/50"
            >
                <span className="flex items-center gap-2"><Navigation className="h-3.5 w-3.5" />Navigation</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div data-testid="nav-panel-body" className="space-y-4 px-3 pb-4">
                    <div className="space-y-1">
                        <span className={labelCls}>Brand Name</span>
                        <Input value={nav.brandName} onChange={(e) => updateNavBrandName(e.target.value)}
                            data-testid="nav-brand-input" className="h-8 text-xs" placeholder="STUDIO" />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <span className={labelCls}>Background</span>
                            <div className="flex items-center gap-1.5" data-testid="nav-bg-row">
                                <input type="color" value={nav.backgroundColor || '#ffffff'}
                                    onChange={(e) => updateNavStyle({ backgroundColor: e.target.value, textColor: nav.textColor, fontSize: nav.fontSize })}
                                    data-testid="nav-bg-picker" className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border bg-transparent" />
                                <Input value={nav.backgroundColor ?? ''} onChange={(e) => updateNavStyle({ backgroundColor: e.target.value || undefined, textColor: nav.textColor, fontSize: nav.fontSize })}
                                    data-testid="nav-bg-input" placeholder="auto" className="h-8 min-w-0 font-mono text-xs" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <span className={labelCls}>Text Color</span>
                            <div className="flex items-center gap-1.5" data-testid="nav-text-row">
                                <input type="color" value={nav.textColor || '#000000'}
                                    onChange={(e) => updateNavStyle({ backgroundColor: nav.backgroundColor, textColor: e.target.value, fontSize: nav.fontSize })}
                                    data-testid="nav-text-picker" className="h-8 w-8 shrink-0 cursor-pointer rounded border border-border bg-transparent" />
                                <Input value={nav.textColor ?? ''} onChange={(e) => updateNavStyle({ backgroundColor: nav.backgroundColor, textColor: e.target.value || undefined, fontSize: nav.fontSize })}
                                    data-testid="nav-text-input" placeholder="auto" className="h-8 min-w-0 font-mono text-xs" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <span className={labelCls}>Links</span>
                        <div data-testid="nav-links-list" className="space-y-1.5">
                            {nav.links.map((link) => (
                                <div key={link.id} data-testid={`nav-link-${link.id}`} className="flex items-center gap-1.5 rounded-md border border-border bg-card px-2 py-1.5">
                                    <GripVertical className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                                    <div className="flex flex-1 flex-col gap-1 min-w-0">
                                        <input value={link.label} onChange={(e) => updateNavLink(link.id, { label: e.target.value })}
                                            placeholder="Label" data-testid={`nav-link-label-${link.id}`}
                                            className="w-full rounded border-0 bg-transparent px-0 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-ring rounded px-1" />
                                        <input value={link.href} onChange={(e) => updateNavLink(link.id, { href: e.target.value })}
                                            placeholder="/page" data-testid={`nav-link-href-${link.id}`}
                                            className="w-full rounded border-0 bg-transparent px-0 text-[10px] text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring rounded px-1 font-mono" />
                                    </div>
                                    <button onClick={() => removeNavLink(link.id)} data-testid={`nav-link-remove-${link.id}`}
                                        className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-destructive">
                                        <Trash2 className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button onClick={addNavLink} data-testid="add-nav-link"
                            className="mt-1 flex items-center gap-1 rounded px-1 py-0.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                            <Plus className="h-3.5 w-3.5" />Add link
                        </button>
                    </div>

                    {customPages.length > 0 && (
                        <div className="space-y-1">
                            <span className={labelCls}>Custom Pages</span>
                            <div data-testid="custom-page-links" className="flex flex-wrap gap-1">
                                {customPages.map((page) => (
                                    <button key={page.id} data-testid={`add-custom-page-link-${page.id}`}
                                        onClick={() => addCustomPageLink(page.slug, page.name)}
                                        title={`Add nav link to ${page.name}`}
                                        className="flex items-center gap-1 rounded border border-border bg-muted/50 px-2 py-1 text-[10px] text-muted-foreground transition-colors hover:border-primary hover:text-primary">
                                        <FileEdit className="h-2.5 w-2.5" />{page.name}
                                        <span className="font-mono opacity-60">{page.slug}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    )
}
