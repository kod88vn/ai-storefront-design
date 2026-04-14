import type { HeroConfig, ThemeConfig } from '@ai-storefront/types'

interface HeroProps {
    config: HeroConfig
    theme: ThemeConfig
}

const FONT_SIZE_MAP = { sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' } as const

// Renders the eyebrow badge above the title (used in all layouts)
function Badge({ text }: { text: string }) {
    return (
        <span className="mb-4 self-start inline-block rounded-full border border-current px-3 py-1 text-xs font-medium uppercase tracking-widest opacity-70">
            {text}
        </span>
    )
}

// Returns button class string based on ctaVariant
function ctaClass(variant: HeroConfig['ctaVariant'], radius: string): string {
    const base = `px-8 py-3 text-sm font-medium transition-all`
    if (variant === 'outline') return `${base} border-2 border-current bg-transparent hover:bg-white/10`
    if (variant === 'ghost') return `${base} underline underline-offset-4 hover:opacity-70`
    return base // solid (default)
}

export function StorefrontHero({ config, theme }: HeroProps) {
    const { layout, title, subtitle, ctaText, ctaSecondaryText, badge, textAlign = 'center', overlayOpacity = 0.45, ctaVariant = 'solid' } = config
    const radius = 'var(--storefront-radius)'

    // Style overrides from per-component config
    const overrideBg = config.backgroundColor
    const overrideText = config.textColor
    const overrideFontSize = config.fontSize ? FONT_SIZE_MAP[config.fontSize] : undefined
    // Applied to each layout's outer section element
    const styleOverride = {
        ...(overrideBg ? { backgroundColor: overrideBg } : {}),
        ...(overrideText ? { color: overrideText } : {}),
        ...(overrideFontSize ? { fontSize: overrideFontSize } : {}),
    }

    // ── Editorial: massive dark-background typography, no image ──────────────
    if (layout === 'editorial') {
        const isDark = theme.colorScheme === 'dark'
        const bg = overrideBg ?? (isDark ? '#0a0a0a' : theme.primaryColor)
        const fg = overrideText ?? '#ffffff'
        return (
            <section data-testid="storefront-hero" style={{ backgroundColor: bg, color: fg, fontSize: overrideFontSize }}>
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-32">
                    {badge && <Badge text={badge} />}
                    <h1 className="max-w-3xl text-5xl font-black uppercase leading-none tracking-tighter sm:text-7xl lg:text-8xl">{title}</h1>
                    <div className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <p className="max-w-md text-base opacity-70 sm:text-lg">{subtitle}</p>
                        <div className="flex gap-3 shrink-0">
                            <button
                                style={{ backgroundColor: theme.secondaryColor, borderRadius: radius, color: '#fff' }}
                                className="px-8 py-3 text-sm font-medium transition-opacity hover:opacity-90"
                            >
                                {ctaText}
                            </button>
                            {ctaSecondaryText && (
                                <button className="border-2 border-white/40 px-8 py-3 text-sm font-medium text-white hover:border-white" style={{ borderRadius: radius }}>
                                    {ctaSecondaryText}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (layout === 'centered') {
        const hasBg = !!config.backgroundImage
        const textOnImage = hasBg && !overrideText
        return (
            <section data-testid="storefront-hero" className="relative overflow-hidden px-4 py-24 sm:px-6" style={{ backgroundColor: overrideBg ?? (hasBg ? '#000' : '#f5f5f5'), fontSize: overrideFontSize }}>
                {hasBg && (
                    <>
                        <img src={config.backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
                        <div className="absolute inset-0 bg-black/30" />
                    </>
                )}
                <div className="relative mx-auto max-w-4xl text-center">
                    {badge && <Badge text={badge} />}
                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: overrideText ?? (textOnImage ? '#fff' : theme.primaryColor) }}>{title}</h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg" style={{ color: overrideText ?? (textOnImage ? 'rgba(255,255,255,0.85)' : '#525252') }}>{subtitle}</p>
                    <div className="mt-8 flex justify-center gap-4">
                        <button
                            className="px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: theme.secondaryColor, borderRadius: radius }}
                        >
                            {ctaText}
                        </button>
                        {ctaSecondaryText && (
                            <button
                                className="border px-8 py-3 text-sm font-medium transition-colors"
                                style={textOnImage
                                    ? { borderColor: 'rgba(255,255,255,0.6)', color: '#fff', borderRadius: radius }
                                    : { borderColor: theme.primaryColor, color: theme.primaryColor, borderRadius: radius, backgroundColor: 'transparent' }
                                }
                            >
                                {ctaSecondaryText}
                            </button>
                        )}
                    </div>
                </div>
            </section>
        )
    }

    // Split layout (default)
    const isLeft = textAlign === 'left'
    return (
        <section data-testid="storefront-hero" className="bg-white" style={{ ...styleOverride }}>
            <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
                <div className={`flex flex-col justify-center px-4 py-12 sm:px-6 lg:py-24 ${isLeft ? '' : 'items-center text-center'}`}>
                    {badge && <Badge text={badge} />}
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl" style={{ color: overrideText ?? theme.primaryColor }}>{title}</h1>
                    <p className="mt-6 text-lg text-neutral-600">{subtitle}</p>
                    <div className={`mt-8 flex gap-3 ${isLeft ? '' : 'justify-center'}`}>
                        <button
                            className="px-8 py-3 text-sm font-medium text-white transition-opacity hover:opacity-90"
                            style={{ backgroundColor: theme.secondaryColor, borderRadius: radius }}
                        >
                            {ctaText}
                        </button>
                        {ctaSecondaryText && (
                            <button
                                className="border px-8 py-3 text-sm font-medium transition-colors hover:bg-neutral-100"
                                style={{ borderColor: theme.primaryColor, color: theme.primaryColor, borderRadius: radius }}
                            >
                                {ctaSecondaryText}
                            </button>
                        )}
                    </div>
                </div>
                <div className="aspect-video lg:aspect-auto">
                    <img
                        src={config.backgroundImage || 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=800&h=800&fit=crop'}
                        alt="Hero"
                        className="h-full w-full object-cover"
                    />
                </div>
            </div>
        </section>
    )
}

