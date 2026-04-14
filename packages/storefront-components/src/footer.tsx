import type { FooterConfig, ThemeConfig } from '@ai-storefront/types'

interface FooterProps {
    theme: ThemeConfig
    footerConfig?: FooterConfig
}

const FONT_SIZE_MAP = { sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' } as const

export function StorefrontFooter({ theme, footerConfig }: FooterProps) {
    const isDark = (theme.colorScheme ?? 'light') === 'dark'
    const effectiveBg = footerConfig?.backgroundColor ?? (isDark ? '#0d0d0d' : '#ffffff')
    const borderColor = isDark ? '#2a2a2a' : '#e5e5e5'
    const headingColor = footerConfig?.textColor ?? (isDark ? '#f5f5f5' : '#171717')
    const mutedColor = footerConfig?.textColor ?? '#737373'
    const effectiveFontSize = footerConfig?.fontSize ? FONT_SIZE_MAP[footerConfig.fontSize] : undefined
    return (
        <footer data-testid="storefront-footer" className="border-t px-4 py-12 sm:px-6" style={{ backgroundColor: effectiveBg, borderColor, fontSize: effectiveFontSize }}>
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="col-span-2 md:col-span-1">
                        <h3 className="text-lg font-semibold" style={{ color: theme.primaryColor }}>STUDIO</h3>
                        <p className="mt-3 text-sm" style={{ color: mutedColor }}>{footerConfig?.tagline ?? 'Curated pieces for modern living.'}</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold" style={{ color: headingColor }}>Shop</h4>
                        <ul className="mt-3 space-y-2 text-sm" style={{ color: mutedColor }}>
                            <li><a href="#">New Arrivals</a></li>
                            <li><a href="#">Collections</a></li>
                            <li><a href="#">Sale</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold" style={{ color: headingColor }}>Support</h4>
                        <ul className="mt-3 space-y-2 text-sm" style={{ color: mutedColor }}>
                            <li><a href="#">FAQ</a></li>
                            <li><a href="#">Shipping</a></li>
                            <li><a href="#">Returns</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold" style={{ color: headingColor }}>Company</h4>
                        <ul className="mt-3 space-y-2 text-sm" style={{ color: mutedColor }}>
                            <li><a href="#">About</a></li>
                            <li><a href="#">Journal</a></li>
                            <li><a href="#">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 border-t pt-6 text-xs" style={{ borderColor, color: mutedColor }}>
                    © {new Date().getFullYear()} Studio. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
