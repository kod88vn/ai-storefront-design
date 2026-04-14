'use client'

import { useEffect, useRef, useState } from 'react'
import { Home, ShoppingBag, Package, ShoppingCart, FileEdit, Plus, X, Check } from 'lucide-react'
import { useStudioStore } from '@/lib/store'

const CORE_PAGES = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'products', label: 'Products', Icon: ShoppingBag },
    { id: 'product-detail', label: 'Product Detail', Icon: Package },
    { id: 'cart', label: 'Cart', Icon: ShoppingCart },
] as const

function CorePageTab({ id, label, Icon }: { id: string; label: string; Icon: React.ElementType }) {
    const { currentPage, setCurrentPage } = useStudioStore()
    return (
        <button
            key={id}
            data-testid={`page-selector-${id}`}
            onClick={() => setCurrentPage(id)}
            className={`flex shrink-0 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors ${currentPage === id
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
            <Icon className="h-3.5 w-3.5" />
            {label}
        </button>
    )
}

function CustomPageTab({ page }: { page: { id: string; name: string; slug: string } }) {
    const { currentPage, setCurrentPage, removeCustomPage, updateCustomPage } = useStudioStore()
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(page.name)
    const inputRef = useRef<HTMLInputElement>(null)
    const active = currentPage === page.id

    function commitRename() {
        const trimmed = draft.trim()
        if (trimmed && trimmed !== page.name) {
            const slug = '/' + trimmed.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            updateCustomPage(page.id, { name: trimmed, slug })
        } else {
            setDraft(page.name)
        }
        setEditing(false)
    }

    useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

    return (
        <div
            data-testid={`page-selector-${page.id}`}
            className={`group relative flex shrink-0 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors ${active
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}
        >
            {editing ? (
                <div className="flex items-center gap-1">
                    <input
                        ref={inputRef}
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
                        onBlur={commitRename}
                        onKeyDown={(e) => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setDraft(page.name); setEditing(false) } }}
                        className="w-16 rounded border border-border bg-background px-1 py-0 text-[10px] text-foreground focus:outline-none"
                    />
                    <button onClick={commitRename}><Check className="h-2.5 w-2.5" /></button>
                </div>
            ) : (
                <button onClick={() => setCurrentPage(page.id)} onDoubleClick={() => setEditing(true)} className="flex flex-col items-center gap-1">
                    <FileEdit className="h-3.5 w-3.5" />
                    <span className="max-w-[52px] truncate">{page.name}</span>
                </button>
            )}
            <button
                onClick={() => removeCustomPage(page.id)}
                data-testid={`remove-custom-page-${page.id}`}
                title="Remove page"
                className="absolute -right-1 -top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-destructive-foreground group-hover:flex"
            >
                <X className="h-2.5 w-2.5" />
            </button>
        </div>
    )
}

export function PageSelector() {
    const { customPages, addCustomPage } = useStudioStore()
    const [mounted, setMounted] = useState(false)
    useEffect(() => { setMounted(true) }, [])

    if (!mounted) return (
        <div data-testid="page-selector" className="border-b border-border bg-muted/30 px-2 py-2">
            <p className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Page</p>
            <div className="h-8" />
        </div>
    )

    return (
        <div data-testid="page-selector" className="border-b border-border bg-muted/30 px-2 py-2">
            <p className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Page</p>
            <div className="flex gap-1 overflow-x-auto pb-0.5">
                {CORE_PAGES.map((p) => <CorePageTab key={p.id} {...p} />)}
                {customPages.map((p) => <CustomPageTab key={p.id} page={p} />)}
                <button
                    onClick={addCustomPage}
                    data-testid="add-custom-page"
                    title="Add custom page"
                    className="flex shrink-0 flex-col items-center gap-1 rounded-md border border-dashed border-border px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                >
                    <Plus className="h-3.5 w-3.5" />
                    Add
                </button>
            </div>
        </div>
    )
}
