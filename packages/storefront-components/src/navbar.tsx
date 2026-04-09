'use client'

import { useState } from 'react'
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react'
import type { ThemeConfig } from '@ai-storefront/types'

interface NavbarProps {
    theme: ThemeConfig
}

export function StorefrontNavbar({ theme }: NavbarProps) {
    const [menuOpen, setMenuOpen] = useState(false)

    const navStyle = theme.navStyle ?? 'bordered'

    // Compute container classes + inline styles based on navStyle
    const containerCls =
        navStyle === 'transparent'
            ? 'absolute top-0 left-0 right-0 z-20'
            : navStyle === 'filled'
                ? 'border-b border-transparent'
                : 'border-b border-neutral-200 bg-white'

    const containerStyle =
        navStyle === 'filled'
            ? { backgroundColor: theme.primaryColor }
            : navStyle === 'transparent'
                ? { backgroundColor: 'transparent' }
                : {}

    const textColor =
        navStyle === 'transparent' || navStyle === 'filled'
            ? '#ffffff'
            : theme.primaryColor

    const linkCls =
        navStyle === 'transparent' || navStyle === 'filled'
            ? 'text-white/80 hover:text-white'
            : 'text-neutral-600 hover:text-neutral-900'

    const iconCls =
        navStyle === 'transparent' || navStyle === 'filled'
            ? 'text-white/80 hover:text-white'
            : 'text-neutral-600 hover:text-neutral-900'

    const mobileBorderCls =
        navStyle === 'transparent' || navStyle === 'filled'
            ? 'border-t border-white/20'
            : 'border-t border-neutral-200'

    const mobileContainerStyle =
        navStyle === 'filled'
            ? { backgroundColor: theme.primaryColor }
            : navStyle === 'transparent'
                ? { backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }
                : {}

    return (
        <nav data-testid="storefront-navbar" className={containerCls} style={containerStyle}>
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                <a href="#" className="text-lg font-semibold tracking-tight" style={{ color: textColor }}>STUDIO</a>

                {/* Desktop nav links */}
                <div className={`hidden items-center gap-6 text-sm md:flex ${linkCls}`}>
                    <a href="#" className={linkCls}>Shop</a>
                    <a href="#" className={linkCls}>Collections</a>
                    <a href="#" className={linkCls}>Journal</a>
                </div>

                <div className={`flex items-center gap-3 ${iconCls}`}>
                    <button data-testid="navbar-search" aria-label="Search" className={iconCls}><Search className="h-4 w-4" /></button>
                    <button data-testid="navbar-user" aria-label="Account" className={iconCls}><User className="h-4 w-4" /></button>
                    <button data-testid="navbar-cart" aria-label="Cart" className={`relative ${iconCls}`}>
                        <ShoppingBag className="h-4 w-4" />
                        <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px] text-white" style={{ backgroundColor: theme.secondaryColor }}>0</span>
                    </button>
                    {/* Mobile menu toggle */}
                    <button
                        data-testid="navbar-menu-toggle"
                        aria-label="Menu"
                        className={`md:hidden ${iconCls}`}
                        onClick={() => setMenuOpen((o) => !o)}
                    >
                        {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                    </button>
                </div>
            </div>

            {/* Mobile menu */}
            {menuOpen && (
                <div data-testid="navbar-mobile-menu" className={`md:hidden ${mobileBorderCls}`} style={mobileContainerStyle}>
                    <div className={`flex flex-col gap-4 px-4 py-4 text-sm ${linkCls}`}>
                        <a href="#" className={linkCls} onClick={() => setMenuOpen(false)}>Shop</a>
                        <a href="#" className={linkCls} onClick={() => setMenuOpen(false)}>Collections</a>
                        <a href="#" className={linkCls} onClick={() => setMenuOpen(false)}>Journal</a>
                    </div>
                </div>
            )}
        </nav>
    )
}

