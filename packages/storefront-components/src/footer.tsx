import type { ThemeConfig } from '@ai-storefront/types'

interface FooterProps {
    theme: ThemeConfig
}

export function StorefrontFooter({ theme }: FooterProps) {
    return (
        <footer data-testid="storefront-footer" className="border-t border-neutral-200 bg-white px-4 py-12 sm:px-6">
            <div className="mx-auto max-w-7xl">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="col-span-2 md:col-span-1">
                        <h3 className="text-lg font-semibold" style={{ color: theme.primaryColor }}>STUDIO</h3>
                        <p className="mt-3 text-sm text-neutral-500">Curated pieces for modern living.</p>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-neutral-900">Shop</h4>
                        <ul className="mt-3 space-y-2 text-sm text-neutral-500">
                            <li><a href="#" className="hover:text-neutral-900">New Arrivals</a></li>
                            <li><a href="#" className="hover:text-neutral-900">Collections</a></li>
                            <li><a href="#" className="hover:text-neutral-900">Sale</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-neutral-900">Support</h4>
                        <ul className="mt-3 space-y-2 text-sm text-neutral-500">
                            <li><a href="#" className="hover:text-neutral-900">FAQ</a></li>
                            <li><a href="#" className="hover:text-neutral-900">Shipping</a></li>
                            <li><a href="#" className="hover:text-neutral-900">Returns</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-neutral-900">Company</h4>
                        <ul className="mt-3 space-y-2 text-sm text-neutral-500">
                            <li><a href="#" className="hover:text-neutral-900">About</a></li>
                            <li><a href="#" className="hover:text-neutral-900">Journal</a></li>
                            <li><a href="#" className="hover:text-neutral-900">Contact</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-10 border-t border-neutral-200 pt-6 text-xs text-neutral-400">
                    © {new Date().getFullYear()} Studio. All rights reserved.
                </div>
            </div>
        </footer>
    )
}
