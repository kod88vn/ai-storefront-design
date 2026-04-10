import type { StorefrontConfig, LayoutSection, BenefitItem, TrustIcon } from '@ai-storefront/types'
import {
    Truck, Shield, RefreshCw, Award, Clock, Leaf,
    Star, Heart, Check, Zap, Globe, Tag, Lock, Phone, LucideIcon
} from 'lucide-react'

interface ExtraSectionsProps {
    section: LayoutSection
    config: StorefrontConfig
}

// Map BenefitItem.icon string to a Lucide component
const ICON_MAP: Record<BenefitItem['icon'], LucideIcon> = {
    truck: Truck, shield: Shield, refresh: RefreshCw, award: Award,
    clock: Clock, leaf: Leaf, star: Star, heart: Heart,
    check: Check, zap: Zap, globe: Globe, tag: Tag,
}

function BenefitIcon({ icon }: { icon: BenefitItem['icon'] }) {
    const Icon = ICON_MAP[icon] ?? Check
    return <Icon className="h-5 w-5 shrink-0" />
}

const TRUST_ICON_MAP: Record<TrustIcon, LucideIcon> = {
    truck: Truck, shield: Shield, refresh: RefreshCw, award: Award, lock: Lock, phone: Phone,
}

function TrustBadgeIcon({ icon }: { icon: TrustIcon }) {
    const Icon = TRUST_ICON_MAP[icon] ?? Shield
    return <Icon className="h-5 w-5 shrink-0" />
}

function StarRating({ rating }: { rating: number }) {
    return (
        <div className="flex gap-0.5">
            {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className={`h-3.5 w-3.5 ${i <= rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-300'}`} />
            ))}
        </div>
    )
}

export function ExtraSections({ section, config }: ExtraSectionsProps) {
    const { sectionData, theme } = config

    switch (section.type) {
        case 'announcement-bar': {
            const data = sectionData['announcement-bar'] ?? {
                text: '▶  ENTER YOUR ANNOUNCEMENT TEXT HERE  ◀',
                backgroundColor: theme.primaryColor,
                textColor: '#fff',
                scrolling: false,
                emoji: null,
                link: null,
                dismissible: false,
            }
            const content = data.emoji ? `${data.emoji} ${data.text}` : data.text
            return (
                <section
                    data-testid="announcement-bar"
                    className="overflow-hidden px-4 py-2 text-center text-xs font-medium"
                    style={{ backgroundColor: data.backgroundColor || theme.primaryColor, color: data.textColor || '#fff' }}
                >
                    {data.scrolling ? (
                        <div className="animate-marquee whitespace-nowrap">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <span key={i} className="mx-8">{content}</span>
                            ))}
                        </div>
                    ) : (
                        data.link ? <a href={data.link}>{content}</a> : <span>{content}</span>
                    )}
                </section>
            )
        }

        case 'benefits-bar': {
            const items = sectionData['benefits-bar']?.items ?? [
                { icon: 'truck' as const, label: '[BENEFIT 1 — Click to edit]', detail: '[Supporting detail text]' },
                { icon: 'refresh' as const, label: '[BENEFIT 2 — Click to edit]', detail: '[Supporting detail text]' },
                { icon: 'shield' as const, label: '[BENEFIT 3 — Click to edit]', detail: '[Supporting detail text]' },
                { icon: 'award' as const, label: '[BENEFIT 4 — Click to edit]', detail: '[Supporting detail text]' },
            ]
            return (
                <section data-testid="benefits-bar" className="border-y border-neutral-200 bg-neutral-50 px-4 py-4">
                    <div className="mx-auto grid max-w-7xl gap-4 text-sm text-neutral-700 sm:grid-cols-2 lg:grid-cols-4">
                        {items.slice(0, 4).map((item, idx) => (
                            <div key={`${item.label}-${idx}`} className="flex items-center gap-2.5">
                                <span style={{ color: theme.secondaryColor }}>
                                    <BenefitIcon icon={item.icon} />
                                </span>
                                <div>
                                    <p className="font-medium text-neutral-900">{item.label}</p>
                                    {item.detail && <p className="text-xs text-neutral-500">{item.detail}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )
        }

        case 'featured-collection': {
            const data = sectionData['featured-collection'] ?? {
                heading: '[FEATURED COLLECTION TITLE]',
                subheading: '[Describe what makes this collection special]',
                layout: 'grid' as const,
            }
            return (
                <section data-testid="featured-collection" className="bg-white px-4 py-12 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        <h2 className="text-2xl font-semibold" style={{ color: theme.primaryColor }}>{data.heading}</h2>
                        {data.subheading && <p className="mt-2 text-sm text-neutral-600">{data.subheading}</p>}
                        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="aspect-square rounded-lg bg-neutral-100" />
                            ))}
                        </div>
                    </div>
                </section>
            )
        }

        case 'testimonials': {
            const DEFAULT_TESTIMONIAL_ITEMS = [
                { quote: '[CUSTOMER TESTIMONIAL — Write a real quote here]', author: '[Customer Name]', location: '[City, Country]', rating: 5 },
                { quote: '[CUSTOMER TESTIMONIAL — Write a real quote here]', author: '[Customer Name]', location: '[City, Country]', rating: 5 },
                { quote: '[CUSTOMER TESTIMONIAL — Write a real quote here]', author: '[Customer Name]', location: '[City, Country]', rating: 5 },
            ]
            const data = sectionData.testimonials ?? {
                heading: '[TESTIMONIALS HEADING]',
                layout: 'grid' as const,
                showRatings: true,
                items: DEFAULT_TESTIMONIAL_ITEMS,
            }
            const items = data.items?.length ? data.items : DEFAULT_TESTIMONIAL_ITEMS
            const showRatings = data.showRatings !== false

            if (data.layout === 'featured') {
                const [first, ...rest] = items
                return (
                    <section data-testid="testimonials" className="bg-neutral-50 px-4 py-12 sm:px-6">
                        <div className="mx-auto max-w-7xl">
                            <h2 className="mb-6 text-2xl font-semibold" style={{ color: theme.primaryColor }}>{data.heading}</h2>
                            <div className="grid gap-4 lg:grid-cols-3">
                                <blockquote className="col-span-1 rounded-xl p-6 lg:col-span-2" style={{ backgroundColor: theme.primaryColor, color: '#fff' }}>
                                    {showRatings && <StarRating rating={first.rating} />}
                                    <p className="mt-3 text-lg font-light leading-relaxed">"{first.quote}"</p>
                                    <cite className="mt-4 block text-sm font-medium opacity-80">— {first.author}{first.location ? `, ${first.location}` : ''}</cite>
                                </blockquote>
                                <div className="flex flex-col gap-4">
                                    {rest.slice(0, 2).map((item, idx) => (
                                        <blockquote key={`${item.author}-${idx}`} className="rounded-xl bg-white p-4 text-sm text-neutral-700">
                                            {showRatings && <StarRating rating={item.rating} />}
                                            <p className="mt-2">"{item.quote}"</p>
                                            <cite className="mt-2 block font-medium text-neutral-900">— {item.author}</cite>
                                        </blockquote>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </section>
                )
            }

            if (data.layout === 'list') {
                return (
                    <section data-testid="testimonials" className="bg-white px-4 py-12 sm:px-6">
                        <div className="mx-auto max-w-3xl">
                            <h2 className="mb-8 text-center text-2xl font-semibold" style={{ color: theme.primaryColor }}>{data.heading}</h2>
                            <div className="space-y-6 divide-y divide-neutral-200">
                                {items.slice(0, 5).map((item, idx) => (
                                    <blockquote key={`${item.author}-${idx}`} className="pt-6 first:pt-0">
                                        {showRatings && <StarRating rating={item.rating} />}
                                        <p className="mt-2 text-base text-neutral-700">"{item.quote}"</p>
                                        <cite className="mt-2 block text-sm font-medium text-neutral-900">— {item.author}{item.location ? `, ${item.location}` : ''}</cite>
                                    </blockquote>
                                ))}
                            </div>
                        </div>
                    </section>
                )
            }

            // Default: grid
            return (
                <section data-testid="testimonials" className="bg-neutral-50 px-4 py-12 sm:px-6">
                    <div className="mx-auto max-w-7xl">
                        <h2 className="mb-5 text-2xl font-semibold" style={{ color: theme.primaryColor }}>{data.heading}</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            {items.slice(0, 3).map((item, idx) => (
                                <blockquote key={`${item.author}-${idx}`} className="rounded-xl bg-white p-5 text-sm text-neutral-700 shadow-sm">
                                    {showRatings && <StarRating rating={item.rating} />}
                                    <p className="mt-2">"{item.quote}"</p>
                                    <cite className="mt-3 block font-medium text-neutral-900">— {item.author}{item.location ? `, ${item.location}` : ''}</cite>
                                </blockquote>
                            ))}
                        </div>
                    </div>
                </section>
            )
        }

        case 'newsletter': {
            const data = sectionData.newsletter ?? {
                heading: '[YOUR NEWSLETTER TITLE]',
                subtext: '[Tell subscribers what they will get by signing up here]',
                placeholder: 'Enter your email',
                buttonText: 'Subscribe',
                backgroundColor: '#f5f5f5',
                incentive: null,
            }
            return (
                <section data-testid="newsletter" className="px-4 py-12 sm:px-6" style={{ backgroundColor: data.backgroundColor || '#f5f5f5' }}>
                    <div className="mx-auto max-w-xl text-center">
                        {data.incentive && (
                            <p className="mb-2 inline-block rounded-full px-4 py-1 text-xs font-semibold text-white" style={{ backgroundColor: theme.secondaryColor }}>
                                {data.incentive}
                            </p>
                        )}
                        <h2 className="text-2xl font-semibold" style={{ color: theme.primaryColor }}>{data.heading}</h2>
                        <p className="mt-2 text-sm text-neutral-600">{data.subtext}</p>
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                            <input
                                type="email"
                                placeholder={data.placeholder || 'Enter your email'}
                                className="w-full rounded-md border border-neutral-300 px-4 py-2.5 text-sm focus:border-neutral-500 focus:outline-none sm:w-64"
                            />
                            <button
                                className="rounded-md px-6 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-90"
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
            const items = sectionData['trust-badges']?.items ?? [
                { icon: 'shield' as const, label: '[TRUST POINT 1 — Click to edit]' },
                { icon: 'truck' as const, label: '[TRUST POINT 2 — Click to edit]' },
                { icon: 'refresh' as const, label: '[TRUST POINT 3 — Click to edit]' },
                { icon: 'award' as const, label: '[TRUST POINT 4 — Click to edit]' },
            ]
            return (
                <section data-testid="trust-badges" className="border-y border-neutral-200 bg-white px-4 py-5">
                    <div className="mx-auto grid max-w-7xl gap-4 text-sm text-neutral-700 sm:grid-cols-2 lg:grid-cols-4">
                        {items.slice(0, 4).map((item, idx) => (
                            <div key={`${item.label}-${idx}`} className="flex items-center justify-center gap-2 text-center sm:justify-start">
                                <span style={{ color: theme.secondaryColor }}>
                                    <TrustBadgeIcon icon={item.icon} />
                                </span>
                                <div>
                                    <p className="font-medium text-neutral-900">{item.label}</p>
                                    {item.detail && <p className="text-xs text-neutral-500">{item.detail}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )
        }

        case 'brand-strip': {
            const data = sectionData['brand-strip'] ?? {
                heading: 'As Featured In',
                brands: [
                    { name: '[BRAND A]', logoText: '[ BRAND A ]' },
                    { name: '[BRAND B]', logoText: '[ BRAND B ]' },
                    { name: '[BRAND C]', logoText: '[ BRAND C ]' },
                    { name: '[BRAND D]', logoText: '[ BRAND D ]' },
                ],
            }
            const brands = data.brands ?? []
            return (
                <section data-testid="brand-strip" className="bg-neutral-50 px-4 py-6">
                    {data.heading && <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest text-neutral-400">{data.heading}</p>}
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 text-sm font-semibold tracking-wide text-neutral-400">
                        {brands.slice(0, 8).map((brand) => <span key={brand.name}>{brand.logoText || brand.name}</span>)}
                    </div>
                </section>
            )
        }

        default:
            return null
    }
}

