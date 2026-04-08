import type { ThemeConfig } from '@ai-storefront/types'

interface FooterProps {
    theme: ThemeConfig
}

export function StorefrontFooter({ theme }: FooterProps) {
    return (
        <footer data-testid="storefront-footer" className="border-t border-neutral-200 bg-white px-4 py-12 sm:px-6">
            <div className="mx-auto max-w-7xl">
                <h3 className="text-lg font-semibold" style={{ color: theme.primaryColor }}>STUDIO</h3>
                <p className="mt-3 text-sm text-neutral-600">Curated pieces for modern living.</p>
            </div>
        </footer>
    )
}
