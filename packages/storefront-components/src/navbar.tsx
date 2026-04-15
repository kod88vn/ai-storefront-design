'use client'

import { useState } from 'react'
import { Search, ShoppingBag, User, Menu, X } from 'lucide-react'
import type { NavConfig, ThemeConfig } from '@ai-storefront/types'
import { pickAccessibleTextColor } from './accessibility'
import { defaultNavConfig } from './data'

interface NavbarProps {
    theme: ThemeConfig
    navConfig?: NavConfig
    cartCount?: number
    onCartClick?: () => void
}

const FONT_SIZE_MAP = { sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' } as const

export function StorefrontNavbar({ theme, navConfig, cartCount = 0, onCartClick }: NavbarProps) {
    const [menuOpen, setMenuOpen] = useState(false)
    const nav = navConfig ?? defaultNavConfig

    const navStyle = theme.navStyle ?? 'bordered'

    const containerCls =
        navStyle === 'transparent'
            ? 'absolute top-0 left-0 right-0 z-20'
            : navStyle === 'filled'
                ? 'border-b border-transparent'
                : 'border-b border-neutral-200'

    // NavConfig style overrides take precedence over theme-derived defaults
    const overrideBg = nav.backgroundColor
    const overrideText = nav.textColor
    const overrideFontSize = nav.fontSize ? FONT_SIZE_MAP[nav.fontSize] : undefined

    const navBackground = overrideBg
        ?? (navStyle === 'filled'
            ? theme.primaryColor
            : navStyle === 'transparent'
                ? '#0a0a0a'
                : '#ffffff')

    const containerStyle = {
        backgroundColor: overrideBg
            ? overrideBg
            : navStyle === 'filled'
                ? theme.primaryColor
                : navStyle === 'transparent'
                    ? 'transparent'
                    : '#ffffff',
        ...(overrideFontSize ? { fontSize: overrideFontSize } : {}),
    }

    const textColor = pickAccessibleTextColor(navBackground, overrideText ?? (navStyle === 'transparent' || navStyle === 'filled' ? '#ffffff' : theme.primaryColor))
    const linkCls = 'transition-opacity hover:opacity-80'
    const iconCls = linkCls
    const badgeTextColor = pickAccessibleTextColor(theme.secondaryColor, '#ffffff')

    const mobileBorderCls =
        navStyle === 'transparent' || navStyle === 'filled'
            ? 'border-t border-white/20'
            : 'border-t border-neutral-200'

    const mobileContainerStyle = overrideBg
        ? { backgroundColor: overrideBg }
        : navStyle === 'filled'
            ? { backgroundColor: theme.primaryColor }
            : navStyle === 'transparent'
                ? { backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }
                : {}

    return (
        <nav data-testid="storefront-navbar" className={containerCls} style={containerStyle}>
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                <a href="/" className="text-lg font-semibold tracking-tight" style={{ color: textColor }}>
                    {nav.brandName}
                </a>

                {/* Desktop nav links */}
                <div className={`hidden items-center gap-6 text-sm md:flex ${linkCls}`} style={{ color: textColor }}>
                    {nav.links.map((link) => (
                        <a key={link.id} href={link.href} className={linkCls} style={{ color: textColor }}>{link.label}</a>
                    ))}
                </div>

                <div className={`flex items-center gap-3 ${iconCls}`} style={{ color: textColor }}>
                    <button data-testid="navbar-search" aria-label="Search" className={iconCls}><Search className="h-4 w-4" /></button>
                    <button data-testid="navbar-user" aria-label="Account" className={iconCls}><User className="h-4 w-4" /></button>
                    <a
                        href="/cart"
                        data-testid="navbar-cart"
                        aria-label="Cart"
                        className={`relative ${iconCls}`}
                        onClick={onCartClick ? (e) => { e.preventDefault(); onCartClick() } : undefined}
                    >
                        <ShoppingBag className="h-4 w-4" />
                        {cartCount > 0 && (
                            <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full text-[10px]" style={{ backgroundColor: theme.secondaryColor, color: badgeTextColor }}>
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </a>
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
                    <div className={`flex flex-col gap-4 px-4 py-4 text-sm ${linkCls}`} style={{ color: textColor }}>
                        {nav.links.map((link) => (
                            <a key={link.id} href={link.href} className={linkCls} style={{ color: textColor }} onClick={() => setMenuOpen(false)}>{link.label}</a>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    )
}
