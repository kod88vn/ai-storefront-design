'use client'

import { motion } from 'framer-motion'
import { Monitor, Tablet, Smartphone } from 'lucide-react'
import { useStudioStore } from '@/lib/store'
import { viewportWidths, type Viewport, type DesignerContainer, type ComponentItem } from '@/lib/types'
import type { StorefrontConfig, SectionType } from '@ai-storefront/types'
import {
  StorefrontNavbar,
  StorefrontHero,
  StorefrontProductGrid,
  StorefrontCategories,
  StorefrontFooter,
  ExtraSections,
  ProductsPage,
  ProductDetailPage,
  CartPage,
} from '@ai-storefront/storefront-components'

const viewportButtons: { viewport: Viewport; icon: React.ReactNode; label: string }[] = [
  { viewport: 'desktop', icon: <Monitor className="h-4 w-4" />, label: 'Desktop' },
  { viewport: 'tablet', icon: <Tablet className="h-4 w-4" />, label: 'Tablet' },
  { viewport: 'mobile', icon: <Smartphone className="h-4 w-4" />, label: 'Mobile' },
]

const JUSTIFY_MAP: Record<string, string> = {
  start: 'justify-start', center: 'justify-center', end: 'justify-end',
  between: 'justify-between', around: 'justify-around', evenly: 'justify-evenly',
}
const ALIGN_MAP: Record<string, string> = {
  start: 'items-start', center: 'items-center', end: 'items-end',
  stretch: 'items-stretch', baseline: 'items-baseline',
}

type LayoutLike = Pick<DesignerContainer, 'layoutMode' | 'flexConfig' | 'gridConfig'>

function containerClass(c: LayoutLike): string {
  if (c.layoutMode === 'flex') {
    const { direction, wrap, justify, align, gap } = c.flexConfig
    return [
      'flex',
      direction === 'column' ? 'flex-col' : 'flex-row',
      wrap ? 'flex-wrap' : '',
      JUSTIFY_MAP[justify] ?? 'justify-start',
      ALIGN_MAP[align] ?? 'items-start',
      `gap-${gap}`,
    ].filter(Boolean).join(' ')
  }
  if (c.layoutMode === 'grid') {
    return `grid grid-cols-${c.gridConfig.cols} gap-${c.gridConfig.gap}`
  }
  return ''
}

function renderPrebuilt(type: SectionType, config: StorefrontConfig) {
  const section = { id: type, type, enabled: true, order: 0 }
  switch (type) {
    case 'hero': return <StorefrontHero config={config.hero} theme={config.theme} />
    case 'product-grid': return <StorefrontProductGrid config={config.productGrid} theme={config.theme} />
    case 'categories': return <StorefrontCategories theme={config.theme} />
    case 'footer': return <StorefrontFooter theme={config.theme} />
    default: return <ExtraSections section={section} config={config} />
  }
}

function normalizeInjectedHtml(html: string): string {
  // React warns when <script> appears in client-rendered HTML; convert to inert templates.
  return html
    .replace(/<script\b/gi, '<template data-blocked-script')
    .replace(/<\/script>/gi, '</template>')
}

function renderComponent(comp: ComponentItem, config: StorefrontConfig) {
  const cls = comp.customClasses || undefined
  switch (comp.kind) {
    case 'prebuilt':
      return <div key={comp.id} className={cls}>{renderPrebuilt(comp.sectionType, config)}</div>
    case 'custom-text':
      return <div key={comp.id} className={cls} dangerouslySetInnerHTML={{ __html: normalizeInjectedHtml(comp.html || '<p style="padding:2rem;color:#aaa;text-align:center">[Custom text block — click to edit]</p>') }} />
    case 'custom-image':
      return (
        <div key={comp.id} className={cls}>
          {comp.src
            ? <img src={comp.src} alt={comp.alt || ''} style={{ width: comp.width || '100%', height: comp.height || 'auto', objectFit: comp.objectFit !== 'auto' ? comp.objectFit : undefined }} />
            : <div style={{ padding: '2rem', textAlign: 'center', color: '#aaa', border: '2px dashed #ddd' }}>[Image block — add URL to display]</div>
          }
        </div>
      )
    case 'container': {
      const combinedCls = [containerClass(comp), comp.customClasses].filter(Boolean).join(' ') || undefined
      return (
        <div key={comp.id} className={combinedCls}>
          {comp.components.map((c) => renderComponent(c, config))}
        </div>
      )
    }
  }
}

function ContainerCanvas({ config, containers }: { config: StorefrontConfig; containers: DesignerContainer[] }) {
  const { theme } = config
  const radiusVal = theme.borderRadius === 'none' ? '0px' : theme.borderRadius === 'full' ? '9999px' : '8px'
  const fontFamilyVal = theme.fontStyle === 'editorial-serif' ? 'Georgia, "Times New Roman", serif' : theme.fontStyle === 'mono-tech' ? '"Courier New", monospace' : 'system-ui, sans-serif'
  const baseBg = theme.colorScheme === 'dark' ? '#0a0a0a' : '#ffffff'
  const baseText = theme.colorScheme === 'dark' ? '#f5f5f5' : '#0a0a0a'
  const isTransparentNav = theme.navStyle === 'transparent'

  return (
    <div
      data-testid="storefront-preview"
      className={`min-h-screen ${isTransparentNav ? 'relative' : ''}`}
      style={{ ['--storefront-radius' as string]: radiusVal, fontFamily: fontFamilyVal, backgroundColor: baseBg, color: baseText }}
    >
      <StorefrontNavbar theme={theme} navConfig={config.nav} />
      {containers.map((c) => (
        <div key={c.id} className={containerClass(c)}>
          {c.components.map((comp) => renderComponent(comp, config))}
        </div>
      ))}
    </div>
  )
}

export function CenterCanvas() {
  const { viewport, setViewport, config, containers, currentPage, cartItems } = useStudioStore()
  const width = viewportWidths[viewport]

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-muted/30">
      <div className="flex items-center justify-center gap-2 border-b border-border bg-background px-4 py-3">
        {viewportButtons.map(({ viewport: vp, icon, label }) => (
          <button
            key={vp}
            onClick={() => setViewport(vp)}
            data-testid={`viewport-${vp}`}
            className={`flex h-8 items-center gap-2 rounded-md px-3 text-sm transition-colors ${viewport === vp ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-muted'}`}
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
            <span className="text-xs text-muted-foreground">{viewportWidths[vp]}px</span>
          </button>
        ))}
      </div>
      <div className="flex flex-1 items-start justify-center overflow-auto p-6">
        <motion.div
          className="relative origin-top overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
          animate={{ width }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ minHeight: '80vh', maxWidth: '100%' }}
        >
          {currentPage === 'home' && <ContainerCanvas config={config} containers={containers} />}
          {currentPage === 'products' && (
            <ProductsPage
              theme={config.theme}
              navConfig={config.nav}
              cartItems={cartItems}
              pagesConfig={config.pages?.products}
            />
          )}
          {currentPage === 'product-detail' && (
            <ProductDetailPage
              theme={config.theme}
              navConfig={config.nav}
              cartItems={cartItems}
              pagesConfig={config.pages?.productDetail}
            />
          )}
          {currentPage === 'cart' && (
            <CartPage
              theme={config.theme}
              navConfig={config.nav}
              cartItems={cartItems}
              pagesConfig={config.pages?.cart}
            />
          )}
          {currentPage === 'custom' && (
            <div className="flex min-h-[60vh] items-center justify-center p-12 text-center text-muted-foreground">
              <div>
                <p className="text-4xl mb-4">✏️</p>
                <p className="font-medium">Custom page</p>
                <p className="text-sm mt-1">Custom page editor coming soon</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
