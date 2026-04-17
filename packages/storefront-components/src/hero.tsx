import type { HeroConfig, ThemeConfig } from '@ai-storefront/types'
import { pickAccessibleTextColor } from './accessibility'

interface HeroProps {
    config: HeroConfig
    theme: ThemeConfig
}

interface CtaActionProps {
    text: string
    href?: string
    className: string
    style: React.CSSProperties
    testId: string
}

const FONT_SIZE_MAP = { sm: '0.875rem', base: '1rem', lg: '1.125rem', xl: '1.25rem' } as const

function Badge({ text }: { text: string }) {
    return (
        <span className="mb-4 self-start inline-block rounded-full border border-current px-3 py-1 text-xs font-medium uppercase tracking-widest opacity-90">
            {text}
        </span>
    )
}

function ctaClass(variant: HeroConfig['ctaVariant'], radius: string): string {
    const base = `inline-flex items-center justify-center px-8 py-3 text-sm font-medium no-underline transition-all`
    if (variant === 'outline') return `${base} border-2 border-current bg-transparent hover:bg-white/10`
    if (variant === 'ghost') return `${base} underline underline-offset-4 hover:opacity-70`
    return base
}

function CtaAction({ text, href, className, style, testId }: CtaActionProps) {
    if (!href) {
        return (
            <button type="button" data-testid={testId} className={className} style={style}>
                {text}
            </button>
        )
    }

    return (
        <a data-testid={testId} href={href} className={className} style={style}>
            {text}
        </a>
    )
}

export function StorefrontHero({ config, theme }: HeroProps) {
    const { layout, title, subtitle, ctaText, ctaHref, ctaSecondaryText, ctaSecondaryHref, badge, textAlign = 'center', ctaVariant = 'solid' } = config
    const radius = 'var(--storefront-radius)'
    const overrideBg = config.backgroundColor
    const overrideText = config.textColor
    const overrideFontSize = config.fontSize ? FONT_SIZE_MAP[config.fontSize] : undefined
    const buttonTextColor = pickAccessibleTextColor(theme.secondaryColor, '#ffffff')
    const primaryHref = ctaHref || '/products'

    if (layout === 'editorial') {
        const isDark = theme.colorScheme === 'dark'
        const bg = overrideBg ?? (isDark ? '#0a0a0a' : theme.primaryColor)
        const fg = pickAccessibleTextColor(bg, overrideText ?? '#ffffff')
        return (
            <section data-testid="storefront-hero" style={{ backgroundColor: bg, color: fg, fontSize: overrideFontSize }}>
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-32">
                    {badge && <Badge text={badge} />}
                    <h1 className="max-w-3xl text-5xl font-black uppercase leading-none tracking-tighter sm:text-7xl lg:text-8xl">{title}</h1>
                    <div className="mt-8 flex flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
                        <p className="max-w-md text-base sm:text-lg" style={{ color: fg, opacity: 0.85 }}>{subtitle}</p>
                        <div className="flex shrink-0 gap-3">
                            {ctaText && (
                                <CtaAction
                                    text={ctaText}
                                    href={primaryHref}
                                    testId="hero-primary-cta"
                                    style={{ backgroundColor: theme.secondaryColor, borderRadius: radius, color: buttonTextColor }}
                                    className="inline-flex items-center justify-center px-8 py-3 text-sm font-medium no-underline transition-opacity hover:opacity-90"
                                />
                            )}
                            {ctaSecondaryText && (
                                <CtaAction
                                    text={ctaSecondaryText}
                                    href={ctaSecondaryHref}
                                    testId="hero-secondary-cta"
                                    className="inline-flex items-center justify-center border-2 px-8 py-3 text-sm font-medium no-underline"
                                    style={{ borderColor: `${fg}66`, color: fg, borderRadius: radius }}
                                />
                            )}
                        </div>
                    </div>
                </div>
            </section>
        )
    }

    if (layout === 'centered') {
        const hasBg = !!config.backgroundImage
        const sectionBg = overrideBg ?? (hasBg ? '#0a0a0a' : '#f5f5f5')
        const headingColor = pickAccessibleTextColor(sectionBg, overrideText ?? (hasBg ? '#ffffff' : theme.primaryColor))
        const bodyColor = pickAccessibleTextColor(sectionBg, overrideText ?? (hasBg ? '#f5f5f5' : '#525252'))
        const secondaryActionColor = pickAccessibleTextColor(sectionBg, hasBg ? '#ffffff' : theme.primaryColor)

        return (
            <section data-testid="storefront-hero" className="relative overflow-hidden px-4 py-24 sm:px-6" style={{ backgroundColor: sectionBg, fontSize: overrideFontSize }}>
                {hasBg && (
                    <>
                        <img src={config.backgroundImage} alt="" className="absolute inset-0 h-full w-full object-cover opacity-50" />
                        <div className="absolute inset-0 bg-black/30" />
                    </>
                )}
                <div className="relative mx-auto max-w-4xl text-center">
                    {badge && <Badge text={badge} />}
                    <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl" style={{ color: headingColor }}>{title}</h1>
                    <p className="mx-auto mt-6 max-w-2xl text-lg" style={{ color: bodyColor }}>{subtitle}</p>
                    <div className="mt-8 flex justify-center gap-4">
                        {ctaText && (
                            <CtaAction
                                text={ctaText}
                                href={primaryHref}
                                testId="hero-primary-cta"
                                className={ctaClass(ctaVariant, radius)}
                                style={{ backgroundColor: theme.secondaryColor, color: buttonTextColor, borderRadius: radius }}
                            />
                        )}
                        {ctaSecondaryText && (
                            <CtaAction
                                text={ctaSecondaryText}
                                href={ctaSecondaryHref}
                                testId="hero-secondary-cta"
                                className="inline-flex items-center justify-center border px-8 py-3 text-sm font-medium no-underline transition-colors"
                                style={{ borderColor: `${secondaryActionColor}66`, color: secondaryActionColor, borderRadius: radius, backgroundColor: 'transparent' }}
                            />
                        )}
                    </div>
                </div>
            </section>
        )
    }

    const isLeft = textAlign === 'left'
    const splitBg = overrideBg ?? '#ffffff'
    const titleColor = pickAccessibleTextColor(splitBg, overrideText ?? theme.primaryColor)
    const bodyColor = pickAccessibleTextColor(splitBg, overrideText ?? '#525252')
    const secondaryActionColor = pickAccessibleTextColor(splitBg, theme.primaryColor)

    return (
        <section data-testid="storefront-hero" className="bg-white" style={{ backgroundColor: splitBg, color: titleColor, fontSize: overrideFontSize }}>
            <div className="mx-auto grid max-w-7xl grid-cols-1 lg:grid-cols-2">
                <div className={`flex flex-col justify-center px-4 py-12 sm:px-6 lg:py-24 ${isLeft ? '' : 'items-center text-center'}`}>
                    {badge && <Badge text={badge} />}
                    <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl" style={{ color: titleColor }}>{title}</h1>
                    <p className="mt-6 text-lg" style={{ color: bodyColor }}>{subtitle}</p>
                    <div className={`mt-8 flex gap-3 ${isLeft ? '' : 'justify-center'}`}>
                        {ctaText && (
                            <CtaAction
                                text={ctaText}
                                href={primaryHref}
                                testId="hero-primary-cta"
                                className={ctaClass(ctaVariant, radius)}
                                style={{ backgroundColor: theme.secondaryColor, color: buttonTextColor, borderRadius: radius }}
                            />
                        )}
                        {ctaSecondaryText && (
                            <CtaAction
                                text={ctaSecondaryText}
                                href={ctaSecondaryHref}
                                testId="hero-secondary-cta"
                                className="inline-flex items-center justify-center border px-8 py-3 text-sm font-medium no-underline transition-colors hover:bg-neutral-100"
                                style={{ borderColor: `${secondaryActionColor}66`, color: secondaryActionColor, borderRadius: radius }}
                            />
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

