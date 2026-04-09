'use client'

import { useState } from 'react'
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react'
import type { ThemeConfig } from '@ai-storefront/types'

interface NavbarProps {
    theme: ThemeConfig
}

export function StorefrontNavbar({ theme }: NavbarProps) {
    const [menuOpen, setMenuOpen] = useState(false)

    return (
        <nav data-testid="storefront-navbar" className="border-b border-neutral-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                <a href="#" className="text-lg font-semibold tracking-tight" style={{ color: theme.primaryColor }}>STUDIO</a>

                {/* Desktop nav links */}
                <div className="hidden items-center gap-6 text-sm text-neutral-600 md:flex">
                    <a href="#" className="hover:text-neutral-900">Shop</a>
                    <a href="#" className="hover:text-neutral-900">Collections</a>
                    <a href="#" className="hover:text-neutral-900">Journal</a>
                </div>

                <div className="flex items-center gap-3 text-neutral-600">
                    <button data-testid="navbar-search" aria-label="Search"><Search className="h-4 w-4" /></button>
                    <button data-testid="navbar-user" aria-label="Account"><User className="h-4 w-4" /></button>
                    <button data-testid="navbar-cart" aria-label="Cart" className="relative">
                        <ShoppingBag className="h-4 w-4" />
                        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white" style={{ backgroundColor: theme.secondaryColor }}>0</span>
                    </button>
                    {/* Mobile menu toggle */}
                    <button
                        data-testid="navbar-menu-toggle"
                        aria-label="Menu"
                        className="md:hidden"
                        onClick={() => setMenuOpen((o) => !o)}
                    >
                        {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div data-testid="navbar-mobile-menu" className="border-t border-neutral-200 md:hidden">
                    <div className="flex flex-col gap-4 px-4 py-4 text-sm text-neutral-600">
                        <a href="#" className="hover:text-neutral-900" onClick={() => setMenuOpen(false)}>Shop</a>
                        <a href="#" className="hover:text-neutral-900" onClick={() => setMenuOpen(false)}>Collections</a>
                        <a href="#" className="hover:text-neutral-900" onClick={() => setMenuOpen(false)}>Journal</a>
                    </div>
                </div>
            )}
        </nav>
    )
}
