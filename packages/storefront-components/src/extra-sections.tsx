import type { StorefrontConfig, LayoutSection, BenefitItem, TrustIcon, TestimonialsConfig, NewsletterConfig } from '@ai-storefront/types'
import { pickAccessibleAccentColor, pickAccessibleTextColor } from './accessibility'
import { sampleProducts } from './data'
import {
    Truck, Shield, RefreshCw, Award, Clock, Leaf,
    Star, Heart, Check, Zap, Globe, Tag, Lock, Phone, LucideIcon
} from 'lucide-react'

interface ExtraSectionsProps {
    section: LayoutSection
    config: StorefrontConfig
}

// Map BenefitItem.icon string to a Lucide component
// Add entries here automatically by adding to BENEFIT_ICONS in packages/types/src/schema.ts
const ICON_MAP: Record<BenefitItem['icon'], LucideIcon> = {
    truck: Truck, shield: Shield, refresh: RefreshCw, award: Award,
    clock: Clock, leaf: Leaf, star: Star, heart: Heart,
    check: Check, zap: Zap, globe: Globe, tag: Tag,
    lock: Lock, phone: Phone,
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
            const bg = data.backgroundColor || theme.primaryColor
            const textColor = pickAccessibleTextColor(bg, data.textColor || '#fff')
            return (
                <section
                    data-testid="announcement-bar"
                    className="overflow-hidden px-4 py-2 text-center text-xs font-medium"
                    style={{ backgroundColor: bg, color: textColor }}
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
            const data = sectionData['benefits-bar']
            const items = data?.items ?? [
                { icon: 'truck' as const, label: '[BENEFIT 1 — Click to edit]', detail: '[Supporting detail text]' },
                { icon: 'refresh' as const, label: '[BENEFIT 2 — Click to edit]', detail: '[Supporting detail text]' },
                { icon: 'shield' as const, label: '[BENEFIT 3 — Click to edit]', detail: '[Supporting detail text]' },
                { icon: 'award' as const, label: '[BENEFIT 4 — Click to edit]', detail: '[Supporting detail text]' },
            ]
            const isDark = (theme.colorScheme ?? 'light') === 'dark'
            const bg = data?.backgroundColor ?? (isDark ? '#1a1a1a' : '#f5f5f5')
            const text = pickAccessibleTextColor(bg, data?.textColor ?? (isDark ? '#e5e5e5' : '#404040'))
            const accent = pickAccessibleAccentColor(bg, theme.secondaryColor)
            const borderColor = isDark ? '#2a2a2a' : '#e5e5e5'
            return (
                <section data-testid="benefits-bar" className="border-y px-4 py-4" style={{ backgroundColor: bg, color: text, borderColor }}>
                    <div className="mx-auto grid max-w-7xl gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        {items.slice(0, 4).map((item, idx) => (
                            <div key={`${item.label}-${idx}`} className="flex items-center gap-2.5">
                                <span style={{ color: accent }}>
                                    <BenefitIcon icon={item.icon} />
                                </span>
                                <div>
                                    <p className="font-medium">{item.label}</p>
                                    {item.detail && <p className="text-xs" style={{ color: text }}>{item.detail}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )
        }

        case 'featured-collection': {
            const data = sectionData['featured-collection'] ?? {
                heading: 'Featured Collection',
                subheading: 'Handpicked pieces for every space',
                layout: 'grid' as const,
                productIds: ['p1', 'p2', 'p3', 'p4'],
            }
            const isDark = (theme.colorScheme ?? 'light') === 'dark'
            const bg = data.backgroundColor ?? (isDark ? '#111111' : '#ffffff')
            const text = pickAccessibleTextColor(bg, data.textColor ?? (isDark ? '#e5e5e5' : '#404040'))
            const headingColor = pickAccessibleTextColor(bg, theme.primaryColor)
            const cardBg = isDark ? '#1a1a1a' : '#f5f5f5'
            const cardText = pickAccessibleTextColor(cardBg, text)
            const featured = data.productIds?.length
                ? data.productIds.map((id) => sampleProducts.find((p) => p.id === id)).filter(Boolean)
                : sampleProducts.slice(0, 4)
            return (
                <section data-testid="featured-collection" className="px-4 py-12 sm:px-6" style={{ backgroundColor: bg, color: text }}>
                    <div className="mx-auto max-w-7xl">
                        <h2 className="text-2xl font-semibold" style={{ color: headingColor }}>{data.heading}</h2>
                        {data.subheading && <p className="mt-2 text-sm" style={{ color: text }}>{data.subheading}</p>}
                        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                            {featured.map((product) => product && (
                                <div key={product.id} data-testid="featured-collection-item" className="group overflow-hidden rounded-lg" style={{ backgroundColor: cardBg, color: cardText }}>
                                    <div className="aspect-square overflow-hidden">
                                        <img src={product.image} alt={product.title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                                    </div>
                                    <div className="p-3">
                                        <p className="text-sm font-medium leading-snug">{product.title}</p>
                                        <p className="mt-1 text-sm" style={{ color: cardText }}>${product.price}</p>
                                    </div>
                                </div>
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
            const data = (sectionData.testimonials ?? {
                heading: '[TESTIMONIALS HEADING]',
                layout: 'grid' as const,
                showRatings: true,
                items: DEFAULT_TESTIMONIAL_ITEMS,
            }) as TestimonialsConfig
            const items = data.items?.length ? data.items : DEFAULT_TESTIMONIAL_ITEMS
            const showRatings = data.showRatings !== false
            const isDark = (theme.colorScheme ?? 'light') === 'dark'
            const sectionBg = data.backgroundColor ?? (isDark ? '#1a1a1a' : '#f5f5f5')
            const baseBg = data.backgroundColor ?? (isDark ? '#111111' : '#ffffff')
            const cardBg = isDark ? '#2a2a2a' : '#ffffff'
            const text = pickAccessibleTextColor(sectionBg, data.textColor ?? (isDark ? '#e5e5e5' : '#404040'))
            const headingColor = pickAccessibleTextColor(sectionBg, theme.primaryColor)
            const cardText = pickAccessibleTextColor(cardBg, text)
            const featuredQuoteText = pickAccessibleTextColor(theme.primaryColor, '#ffffff')
            const borderColor = isDark ? '#2a2a2a' : '#e5e5e5'

            if (data.layout === 'featured') {
                const [first, ...rest] = items
                return (
                    <section data-testid="testimonials" className="px-4 py-12 sm:px-6" style={{ backgroundColor: sectionBg, color: text }}>
                        <div className="mx-auto max-w-7xl">
                            <h2 className="mb-6 text-2xl font-semibold" style={{ color: headingColor }}>{data.heading}</h2>
                            <div className="grid gap-4 lg:grid-cols-3">
                                <blockquote className="col-span-1 rounded-xl p-6 lg:col-span-2" style={{ backgroundColor: theme.primaryColor, color: featuredQuoteText }}>
                                    {showRatings && <StarRating rating={first.rating} />}
                                    <p className="mt-3 text-lg font-light leading-relaxed">"{first.quote}"</p>
                                    <cite className="mt-4 block text-sm font-medium opacity-80">— {first.author}{first.location ? `, ${first.location}` : ''}</cite>
                                </blockquote>
                                <div className="flex flex-col gap-4">
                                    {rest.slice(0, 2).map((item, idx) => (
                                        <blockquote key={`${item.author}-${idx}`} className="rounded-xl p-4 text-sm" style={{ backgroundColor: cardBg, color: cardText }}>
                                            {showRatings && <StarRating rating={item.rating} />}
                                            <p className="mt-2">"{item.quote}"</p>
                                            <cite className="mt-2 block font-medium">— {item.author}</cite>
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
                    <section data-testid="testimonials" className="px-4 py-12 sm:px-6" style={{ backgroundColor: baseBg, color: text }}>
                        <div className="mx-auto max-w-3xl">
                            <h2 className="mb-8 text-center text-2xl font-semibold" style={{ color: headingColor }}>{data.heading}</h2>
                            <div className="space-y-6 divide-y" style={{ borderColor }}>
                                {items.slice(0, 5).map((item, idx) => (
                                    <blockquote key={`${item.author}-${idx}`} className="pt-6 first:pt-0">
                                        {showRatings && <StarRating rating={item.rating} />}
                                        <p className="mt-2 text-base">"{item.quote}"</p>
                                        <cite className="mt-2 block text-sm font-medium">— {item.author}{item.location ? `, ${item.location}` : ''}</cite>
                                    </blockquote>
                                ))}
                            </div>
                        </div>
                    </section>
                )
            }

            // Default: grid
            return (
                <section data-testid="testimonials" className="px-4 py-12 sm:px-6" style={{ backgroundColor: sectionBg, color: text }}>
                    <div className="mx-auto max-w-7xl">
                        <h2 className="mb-5 text-2xl font-semibold" style={{ color: headingColor }}>{data.heading}</h2>
                        <div className="grid gap-4 md:grid-cols-3">
                            {items.slice(0, 3).map((item, idx) => (
                                <blockquote key={`${item.author}-${idx}`} className="rounded-xl p-5 text-sm shadow-sm" style={{ backgroundColor: cardBg, color: cardText }}>
                                    {showRatings && <StarRating rating={item.rating} />}
                                    <p className="mt-2">"{item.quote}"</p>
                                    <cite className="mt-3 block font-medium">— {item.author}{item.location ? `, ${item.location}` : ''}</cite>
                                </blockquote>
                            ))}
                        </div>
                    </div>
                </section>
            )
        }

        case 'newsletter': {
            const isDark = (theme.colorScheme ?? 'light') === 'dark'
            const data = (sectionData.newsletter ?? {
                heading: '[YOUR NEWSLETTER TITLE]',
                subtext: '[Tell subscribers what they will get by signing up here]',
                placeholder: 'Enter your email',
                buttonText: 'Subscribe',
                backgroundColor: isDark ? '#1a1a1a' : '#f5f5f5',
                incentive: null,
            }) as NewsletterConfig
            const bg = data.backgroundColor ?? (isDark ? '#1a1a1a' : '#f5f5f5')
            const text = pickAccessibleTextColor(bg, data.textColor ?? (isDark ? '#e5e5e5' : '#404040'))
            const headingColor = pickAccessibleTextColor(bg, theme.primaryColor)
            const accentText = pickAccessibleTextColor(theme.secondaryColor, '#ffffff')
            const buttonText = pickAccessibleTextColor(theme.primaryColor, '#ffffff')
            return (
                <section data-testid="newsletter" className="px-4 py-12 sm:px-6" style={{ backgroundColor: bg, color: text }}>
                    <div className="mx-auto max-w-xl text-center">
                        {data.incentive && (
                            <p className="mb-2 inline-block rounded-full px-4 py-1 text-xs font-semibold" style={{ backgroundColor: theme.secondaryColor, color: accentText }}>
                                {data.incentive}
                            </p>
                        )}
                        <h2 className="text-2xl font-semibold" style={{ color: headingColor }}>{data.heading}</h2>
                        <p className="mt-2 text-sm" style={{ color: text }}>{data.subtext}</p>
                        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
                            <input
                                type="email"
                                placeholder={data.placeholder || 'Enter your email'}
                                className="w-full rounded-md border border-neutral-300 px-4 py-2.5 text-sm focus:border-neutral-500 focus:outline-none sm:w-64"
                            />
                            <button
                                className="rounded-md px-6 py-2.5 text-sm font-medium transition-opacity hover:opacity-90"
                                style={{ backgroundColor: theme.primaryColor, color: buttonText }}
                            >
                                {data.buttonText}
                            </button>
                        </div>
                    </div>
                </section>
            )
        }

        case 'trust-badges': {
            const data = sectionData['trust-badges']
            const items = data?.items ?? [
                { icon: 'shield' as const, label: '[TRUST POINT 1 — Click to edit]' },
                { icon: 'truck' as const, label: '[TRUST POINT 2 — Click to edit]' },
                { icon: 'refresh' as const, label: '[TRUST POINT 3 — Click to edit]' },
                { icon: 'award' as const, label: '[TRUST POINT 4 — Click to edit]' },
            ]
            const isDark = (theme.colorScheme ?? 'light') === 'dark'
            const bg = data?.backgroundColor ?? (isDark ? '#111111' : '#ffffff')
            const text = pickAccessibleTextColor(bg, data?.textColor ?? (isDark ? '#e5e5e5' : '#404040'))
            const accent = pickAccessibleAccentColor(bg, theme.secondaryColor)
            const borderColor = isDark ? '#2a2a2a' : '#e5e5e5'
            return (
                <section data-testid="trust-badges" className="border-y px-4 py-5" style={{ backgroundColor: bg, color: text, borderColor }}>
                    <div className="mx-auto grid max-w-7xl gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        {items.slice(0, 4).map((item, idx) => (
                            <div key={`${item.label}-${idx}`} className="flex items-center justify-center gap-2 text-center sm:justify-start">
                                <span style={{ color: accent }}>
                                    <TrustBadgeIcon icon={item.icon} />
                                </span>
                                <div>
                                    <p className="font-medium">{item.label}</p>
                                    {item.detail && <p className="text-xs" style={{ color: text }}>{item.detail}</p>}
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
            const isDark = (theme.colorScheme ?? 'light') === 'dark'
            const bg = data.backgroundColor ?? (isDark ? '#1a1a1a' : '#f5f5f5')
            const text = pickAccessibleTextColor(bg, data.textColor ?? (isDark ? '#d4d4d4' : '#525252'))
            const headingColor = pickAccessibleTextColor(bg, theme.primaryColor)
            return (
                <section data-testid="brand-strip" className="px-4 py-6" style={{ backgroundColor: bg }}>
                    {data.heading && <p className="mb-4 text-center text-xs font-semibold uppercase tracking-widest" style={{ color: headingColor }}>{data.heading}</p>}
                    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-6 text-sm font-semibold tracking-wide" style={{ color: text }}>
                        {brands.slice(0, 8).map((brand) => <span key={brand.name}>{brand.logoText || brand.name}</span>)}
                    </div>
                </section>
            )
        }

        default:
            return null
    }
}

