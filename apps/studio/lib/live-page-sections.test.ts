import { createElement } from 'react'
import { render, screen } from '@testing-library/react'
import { StorefrontPreview } from '@ai-storefront/storefront-components'
import type { LayoutSection } from '@ai-storefront/types'
import { defaultConfig } from './store/defaults'
import { buildLivePageSections } from '../../web/lib/live-page-sections'

describe('buildLivePageSections', () => {
  it('preserves the global announcement bar when rendering page-specific live routes', () => {
    const globalSections: LayoutSection[] = [
      { id: 'announcement-bar', type: 'announcement-bar', enabled: true, order: 0 },
      { id: 'hero', type: 'hero', enabled: true, order: 1 },
      { id: 'product-grid', type: 'product-grid', enabled: true, order: 2 },
      { id: 'footer', type: 'footer', enabled: true, order: 3 },
    ]

    const productPageSections: LayoutSection[] = [
      { id: 'products-listing', type: 'products-listing', enabled: true, order: 0 },
      { id: 'footer', type: 'footer', enabled: true, order: 1 },
    ]

    expect(buildLivePageSections(globalSections, productPageSections)).toEqual([
      { id: 'announcement-bar', type: 'announcement-bar', enabled: true, order: 0 },
      { id: 'products-listing', type: 'products-listing', enabled: true, order: 1 },
      { id: 'footer', type: 'footer', enabled: true, order: 2 },
    ])
  })

  it('does not duplicate the announcement bar if the page sections already include it', () => {
    const globalSections: LayoutSection[] = [
      { id: 'announcement-bar', type: 'announcement-bar', enabled: true, order: 0 },
      { id: 'footer', type: 'footer', enabled: true, order: 1 },
    ]

    const customPageSections: LayoutSection[] = [
      { id: 'announcement-bar', type: 'announcement-bar', enabled: true, order: 0 },
      { id: 'footer', type: 'footer', enabled: true, order: 1 },
    ]

    const result = buildLivePageSections(globalSections, customPageSections)

    expect(result.filter((section) => section.type === 'announcement-bar')).toHaveLength(1)
    expect(result[0].type).toBe('announcement-bar')
  })

  it('renders the announcement bar on the live storefront when page routes use merged sections', () => {
    const globalSections: LayoutSection[] = [
      { id: 'announcement-bar', type: 'announcement-bar', enabled: true, order: 0 },
      { id: 'hero', type: 'hero', enabled: true, order: 1 },
      { id: 'footer', type: 'footer', enabled: true, order: 2 },
    ]

    const productPageSections: LayoutSection[] = [
      { id: 'products-listing', type: 'products-listing', enabled: true, order: 0 },
      { id: 'footer', type: 'footer', enabled: true, order: 1 },
    ]

    const config = {
      ...defaultConfig,
      sections: buildLivePageSections(globalSections, productPageSections),
      sectionData: {
        ...defaultConfig.sectionData,
        'announcement-bar': {
          text: 'Free shipping this week',
          backgroundColor: '#111111',
          textColor: '#ffffff',
        },
      },
    }

    render(createElement(StorefrontPreview, { config }))

    expect(screen.getByTestId('announcement-bar')).toHaveTextContent('Free shipping this week')
  })
})
