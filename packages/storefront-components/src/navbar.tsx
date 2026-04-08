import { Search, ShoppingBag, User } from 'lucide-react'
import type { ThemeConfig } from '@ai-storefront/types'

interface NavbarProps {
    theme: ThemeConfig
}

export function StorefrontNavbar({ theme }: NavbarProps) {
    return (
        <nav data-testid="storefront-navbar" className="border-b border-neutral-200 bg-white">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
                <a href="#" className="text-lg font-semibold tracking-tight" style={{ color: theme.primaryColor }}>
                    STUDIO
                </a>
                <div className="hidden items-center gap-6 text-sm text-neutral-600 md:flex">
                    <a href="#">Shop</a>
                    <a href="#">Collections</a>
                    <a href="#">Journal</a>
                </div>
                <div className="flex items-center gap-3 text-neutral-600">
                    <button data-testid="navbar-search"><Search className="h-4 w-4" /></button>
                    <button data-testid="navbar-user"><User className="h-4 w-4" /></button>
                    <button data-testid="navbar-cart" className="relative"><ShoppingBag className="h-4 w-4" /><span className="absolute -right-2 -top-2 h-4 w-4 rounded-full text-[10px] text-white" style={{ backgroundColor: theme.secondaryColor }} /></button>
                </div>
            </div>
        </nav>
    )
}
