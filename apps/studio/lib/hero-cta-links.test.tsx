import { render, screen } from '@testing-library/react'
import { StorefrontPreview } from '@ai-storefront/storefront-components'
import { defaultConfig } from './store/defaults'

describe('hero CTA links', () => {
    it('renders the configured hero CTA destinations as links', () => {
        render(
            <StorefrontPreview
                config={{
                    ...defaultConfig,
                    hero: {
                        ...defaultConfig.hero,
                        ctaText: 'Shop now',
                        ctaHref: '/products',
                        ctaSecondaryText: 'Learn more',
                        ctaSecondaryHref: '/about',
                    },
                }}
            />,
        )

        expect(screen.getByTestId('hero-primary-cta')).toHaveAttribute('href', '/products')
        expect(screen.getByTestId('hero-secondary-cta')).toHaveAttribute('href', '/about')
    })

    it('falls back to the product listing page when no primary CTA link is configured', () => {
        render(
            <StorefrontPreview
                config={{
                    ...defaultConfig,
                    hero: {
                        ...defaultConfig.hero,
                        ctaText: 'Shop now',
                    },
                }}
            />,
        )

        expect(screen.getByTestId('hero-primary-cta')).toHaveAttribute('href', '/products')
    })
})
