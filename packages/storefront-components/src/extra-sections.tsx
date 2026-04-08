import type { StorefrontConfig, ThemeConfig, LayoutSection } from '@ai-storefront/types'

interface ExtraSectionsProps {
    section: LayoutSection
    config: StorefrontConfig
}

export function ExtraSections({ section, config }: ExtraSectionsProps) {
    const { sectionData, theme } = config

    switch (section.type) {
        case 'announcement-bar': {
            const data = sectionData['announcement-bar']
            return data ? (
                <section data-testid="announcement-bar" className="px-4 py-2 text-center text-xs font-medium" style={{ backgroundColor: data.backgroundColor || theme.primaryColor, color: data.textColor || '#fff' }}>
                    {data.link ? <a href={data.link}>{data.text}</a> : data.text}
                </section>
            ) : null
        }

        case 'benefits-bar': {
            const items = sectionData['benefits-bar']?.items || []
            if (items.length === 0) return null
            return (
                <section data-testid="benefits-bar" className="border-y border-neutral-200 bg-neutral-50 px-4 py-3">
                    <div className="mx-auto grid max-w-7xl gap-3 text-center text-xs text-neutral-700 sm:grid-cols-2 lg:grid-cols-4">
                        {items.slice(0, 4).map((item, idx) => <div key={`${item.label}-${idx}`}>{item.label}</div>)}
                    </div>
                </section>
            )
        }

        case 'featured-collection': {
            const data = sectionData['featured-collection']
            if (!data) return null
            return (
                <section data-testid="featured-collection" className="bg-white px-4 py-12 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        <h2 className="text-2xl font-semibold" style={{ color: theme.primaryColor }}>{data.heading}</h2>
                        {data.subheading && <p className="mt-2 text-sm text-neutral-600">{data.subheading}</p>}
                    </div>
                </section>
            )
        }

        case 'testimonials': {
            const data = sectionData.testimonials
            if (!data?.items?.length) return null
            return (
                <section data-testid="testimonials" className="bg-neutral-50 px-4 py-12 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        <h2 className="mb-5 text-2xl font-semibold" style={{ color: theme.primaryColor }}>{data.heading}</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            {data.items.slice(0, 3).map((item, idx) => (
                                <blockquote key={`${item.author}-${idx}`} className="rounded-md bg-white p-4 text-sm text-neutral-700">
                                    "{item.quote}"
                                    <cite className="mt-2 block font-medium text-neutral-900">— {item.author}</cite>
                                </blockquote>
                            ))}
                        </div>
                    </div>
                </section>
            )
        }

        case 'newsletter': {
            const data = sectionData.newsletter
            if (!data) return null
            return (
                <section data-testid="newsletter" className="px-4 py-12 text-center sm:px-6" style={{ backgroundColor: data.backgroundColor || '#f5f5f5' }}>
                    <div className="mx-auto max-w-7xl">
                        <h2 className="text-2xl font-semibold" style={{ color: theme.primaryColor }}>{data.heading}</h2>
                        <p className="mt-2 text-sm text-neutral-600">{data.subtext}</p>
                        <div className="mt-6 flex justify-center">
                            <input
                                type="email"
                                placeholder={data.placeholder || "Enter your email"}
                                className="rounded-l-md border border-r-0 border-neutral-300 px-4 py-2 focus:border-neutral-500 focus:outline-none"
                            />
                            <button
                                className="rounded-r-md border border-l-0 border-neutral-300 bg-neutral-900 px-6 py-2 text-white hover:bg-neutral-800"
                                style={{ backgroundColor: theme.primaryColor }}
                            >
                                {data.buttonText}
                            </button>
                        </div>
                    </div>
                </section>
            )
        }

        case 'trust-badges': {
            const items = sectionData['trust-badges']?.items || []
            if (items.length === 0) return null
            return (
                <section data-testid="trust-badges" className="border-y border-neutral-200 bg-white px-4 py-4">
                    <div className="mx-auto grid max-w-7xl gap-3 text-center text-xs text-neutral-700 sm:grid-cols-2 lg:grid-cols-4">
                        {items.slice(0, 4).map((item, idx) => <div key={`${item.label}-${idx}`}>{item.label}</div>)}
                    </div>
                </section>
            )
        }

        case 'brand-strip': {
            const brands = sectionData['brand-strip']?.brands || []
            if (brands.length === 0) return null
            return (
                <section data-testid="brand-strip" className="bg-neutral-50 px-4 py-6">
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 text-sm font-semibold tracking-wide text-neutral-500">
                        {brands.slice(0, 8).map((brand) => <span key={brand.name}>{brand.logoText || brand.name}</span>)}
                    </div>
                </section>
            )
        }

        default:
            return null
    }
}
