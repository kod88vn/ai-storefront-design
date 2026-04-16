'use client'

import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Monitor, Tablet, Smartphone, Undo2, Redo2 } from 'lucide-react'
import { useStudioStore } from '@/lib/store'
import { viewportWidths, type Viewport, type DesignerContainer, type ComponentItem } from '@/lib/types'
import type { CartItem, StorefrontConfig, SectionType } from '@ai-storefront/types'
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

// Page-level section types that render their own navbar — ContainerCanvas skips its own nav when these are present
const FULL_PAGE_SECTIONS = new Set<SectionType>(['products-listing', 'product-detail-content', 'cart-content'])

function hasFullPageSection(containers: DesignerContainer[]): boolean {
  return containers.some((c) =>
    c.components.some((comp) => comp.kind === 'prebuilt' && FULL_PAGE_SECTIONS.has(comp.sectionType))
  )
}

function renderPrebuilt(type: SectionType, config: StorefrontConfig, cartItems: CartItem[]) {
  const section = { id: type, type, enabled: true, order: 0 }
  switch (type) {
    case 'hero': return <StorefrontHero key={config.hero.layout} config={config.hero} theme={config.theme} />
    case 'product-grid': return <StorefrontProductGrid config={config.productGrid} theme={config.theme} />
    case 'categories': return <StorefrontCategories theme={config.theme} categoriesConfig={config.categories} />
    case 'footer': return <StorefrontFooter theme={config.theme} footerConfig={config.footer} />
    case 'products-listing': return <ProductsPage theme={config.theme} navConfig={config.nav} pagesConfig={config.pages?.products} cartItems={cartItems} />
    case 'product-detail-content': return <ProductDetailPage theme={config.theme} navConfig={config.nav} pagesConfig={config.pages?.productDetail} cartItems={cartItems} />
    case 'cart-content': return <CartPage theme={config.theme} navConfig={config.nav} cartItems={cartItems} pagesConfig={config.pages?.cart} />
    default: return <ExtraSections section={section} config={config} />
  }
}

function normalizeInjectedHtml(html: string): string {
  // React warns when <script> appears in client-rendered HTML; convert to inert templates.
  return html
    .replace(/<script\b/gi, '<template data-blocked-script')
    .replace(/<\/script>/gi, '</template>')
}

function renderComponent(comp: ComponentItem, config: StorefrontConfig, cartItems: CartItem[]) {
  const cls = comp.customClasses || undefined
  switch (comp.kind) {
    case 'prebuilt':
      return <div key={comp.id} className={cls}>{renderPrebuilt(comp.sectionType, config, cartItems)}</div>
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
          {comp.components.map((c) => renderComponent(c, config, cartItems))}
        </div>
      )
    }
  }
}

function ContainerCanvas({ config, containers, cartItems }: { config: StorefrontConfig; containers: DesignerContainer[]; cartItems: CartItem[] }) {
  const { theme } = config
  const radiusVal = theme.borderRadius === 'none' ? '0px' : theme.borderRadius === 'full' ? '9999px' : '8px'
  const fontFamilyVal = theme.fontStyle === 'editorial-serif' ? 'Georgia, "Times New Roman", serif' : theme.fontStyle === 'mono-tech' ? '"Courier New", monospace' : 'system-ui, sans-serif'
  const baseBg = theme.colorScheme === 'dark' ? '#0a0a0a' : '#ffffff'
  const baseText = theme.colorScheme === 'dark' ? '#f5f5f5' : '#0a0a0a'
  const isTransparentNav = theme.navStyle === 'transparent'
  const heroBackground = config.hero.backgroundColor
    ?? (config.hero.layout === 'editorial'
      ? theme.colorScheme === 'dark' ? '#0a0a0a' : theme.primaryColor
      : config.hero.layout === 'centered'
        ? config.hero.backgroundImage ? '#0a0a0a' : '#f5f5f5'
        : '#ffffff')
  // Full-page sections (products-listing, cart-content, etc.) render their own navbar
  const showNav = !hasFullPageSection(containers)

  return (
    <div
      data-testid="storefront-preview"
      className={`min-h-screen ${isTransparentNav ? 'relative' : ''}`}
      style={{ ['--storefront-radius' as string]: radiusVal, fontFamily: fontFamilyVal, backgroundColor: baseBg, color: baseText }}
    >
      {showNav && <StorefrontNavbar theme={theme} navConfig={config.nav} heroBackground={heroBackground} />}
      {containers.map((c) => (
        <div key={c.id} className={containerClass(c)}>
          {c.components.map((comp) => renderComponent(comp, config, cartItems))}
        </div>
      ))}
    </div>
  )
}

export function CenterCanvas() {
  const { viewport, setViewport, config, pageContainers, currentPage, cartItems, undo, redo, canUndo, canRedo } = useStudioStore()
  const containers = pageContainers[currentPage] ?? []
  const width = viewportWidths[viewport]
  const previewShellRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const shell = previewShellRef.current
    if (!shell) return

    const scope = shell.querySelector('[data-testid="storefront-preview"]') as HTMLElement | null
    if (!scope) return

    const nodes = [scope as Element, ...Array.from(scope.querySelectorAll('[class]'))]
    for (const node of nodes) {
      const original =
        node.getAttribute('data-original-class') ??
        node.getAttribute('class') ??
        ''

      if (!node.getAttribute('data-original-class')) {
        node.setAttribute('data-original-class', original)
      }

      if (viewport === 'desktop') {
        node.setAttribute('class', original)
        continue
      }

      const strip = viewport === 'mobile'
        ? /^(sm:|md:|lg:|xl:|2xl:)/
        : /^(lg:|xl:|2xl:)/

      node.setAttribute(
        'class',
        original
          .split(/\s+/)
          .filter(Boolean)
          .filter((token) => !strip.test(token))
          .join(' '),
      )
    }
  }, [viewport, currentPage, config, containers, cartItems])

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-muted/30">
      <div className="flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={!canUndo}
            data-testid="undo-button"
            title="Undo (⌘Z)"
            className="flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted"
          >
            <Undo2 className="h-4 w-4" />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            data-testid="redo-button"
            title="Redo (⌘⇧Z)"
            className="flex h-8 w-8 items-center justify-center rounded-md text-sm transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-muted"
          >
            <Redo2 className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
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
        <div className="w-16" />
      </div>
      <div className="flex flex-1 items-start justify-center overflow-auto p-6">
        <motion.div
          ref={previewShellRef}
          className="relative origin-top overflow-hidden rounded-lg border border-border bg-background shadow-2xl [&_a]:pointer-events-none [&_button]:pointer-events-none"
          animate={{ width }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ minHeight: '80vh', maxWidth: '100%' }}
        >
          {/* All pages now use ContainerCanvas with per-page containers — each page's sections live in pageContainers[page] */}
          <ContainerCanvas config={config} containers={containers} cartItems={cartItems} />
        </motion.div>
      </div>
    </div>
  )
}
