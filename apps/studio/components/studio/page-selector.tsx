'use client'

import { useState } from 'react'
import { Home, ShoppingBag, Package, ShoppingCart, FileEdit, Plus, X } from 'lucide-react'
import { useStudioStore } from '@/lib/store'
import type { PageType } from '@/lib/types'

const CORE_PAGES: { id: PageType; label: string; Icon: React.ElementType }[] = [
    { id: 'home', label: 'Home', Icon: Home },
    { id: 'products', label: 'Products', Icon: ShoppingBag },
    { id: 'product-detail', label: 'Product Detail', Icon: Package },
    { id: 'cart', label: 'Cart', Icon: ShoppingCart },
]

export function PageSelector() {
    const { currentPage, setCurrentPage } = useStudioStore()
    const [hasCustom, setHasCustom] = useState(false)

    function addCustomPage() {
        setHasCustom(true)
        setCurrentPage('custom')
    }

    function removeCustomPage() {
        setHasCustom(false)
        if (currentPage === 'custom') setCurrentPage('home')
    }

    return (
        <div data-testid="page-selector" className="border-b border-border bg-muted/30 px-2 py-2">
            <p className="mb-1.5 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Page</p>
            <div className="flex gap-1 overflow-x-auto pb-0.5 scrollbar-hide">
                {CORE_PAGES.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        data-testid={`page-selector-${id}`}
                        onClick={() => setCurrentPage(id)}
                        className={`flex shrink-0 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors ${currentPage === id
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                    </button>
                ))}

                {hasCustom ? (
                    <div
                        data-testid="page-selector-custom"
                        className={`group relative flex shrink-0 flex-col items-center gap-1 rounded-md px-2 py-1.5 text-[10px] font-medium transition-colors ${currentPage === 'custom'
                                ? 'bg-primary text-primary-foreground'
                                : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                            }`}
                    >
                        <button onClick={() => setCurrentPage('custom')} className="flex flex-col items-center gap-1">
                            <FileEdit className="h-3.5 w-3.5" />
                            Custom
                        </button>
                        <button
                            onClick={removeCustomPage}
                            data-testid="remove-custom-page"
                            title="Remove custom page"
                            className="absolute -right-1 -top-1 hidden h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-destructive-foreground group-hover:flex"
                        >
                            <X className="h-2.5 w-2.5" />
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={addCustomPage}
                        data-testid="add-custom-page"
                        title="Add custom page"
                        className="flex shrink-0 flex-col items-center gap-1 rounded-md border border-dashed border-border px-2 py-1.5 text-[10px] font-medium text-muted-foreground transition-colors hover:border-primary hover:text-primary"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add
                    </button>
                )}
            </div>
        </div>
    )
}
