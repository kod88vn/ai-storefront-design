'use client'

import { motion } from 'framer-motion'
import { Monitor, Tablet, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useStudioStore } from '@/lib/store'
import { viewportWidths, type Viewport } from '@/lib/types'
import { StorefrontPreview } from '../storefront/storefront-preview'
import { PlanApproval } from './plan-approval'

const viewportButtons: { viewport: Viewport; icon: React.ReactNode; label: string }[] = [
  { viewport: 'desktop', icon: <Monitor className="h-4 w-4" />, label: 'Desktop' },
  { viewport: 'tablet', icon: <Tablet className="h-4 w-4" />, label: 'Tablet' },
  { viewport: 'mobile', icon: <Smartphone className="h-4 w-4" />, label: 'Mobile' },
]

export function CenterCanvas() {
  const { viewport, setViewport, agentStep, agentPlan } = useStudioStore()
  const width = viewportWidths[viewport]

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-muted/30">
      {/* Viewport Switcher Header */}
      <div className="flex items-center justify-center gap-2 border-b border-border bg-background px-4 py-3">
        {viewportButtons.map(({ viewport: vp, icon, label }) => (
          <Button
            key={vp}
            variant={viewport === vp ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewport(vp)}
            className="gap-2"
          >
            {icon}
            <span className="hidden sm:inline">{label}</span>
            <span className="text-xs text-muted-foreground">
              {viewportWidths[vp]}px
            </span>
          </Button>
        ))}
      </div>

      {/* Canvas Area */}
      <div className="flex flex-1 items-start justify-center overflow-auto p-6">
        <motion.div
          className="relative origin-top overflow-hidden rounded-lg border border-border bg-background shadow-2xl"
          animate={{ width }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ 
            minHeight: '80vh',
            maxWidth: '100%',
          }}
        >
          {/* Plan Approval Overlay */}
          {agentStep === 'awaiting-approval' && agentPlan && (
            <PlanApproval plan={agentPlan} />
          )}
          
          {/* Storefront Preview */}
          <StorefrontPreview />
        </motion.div>
      </div>
    </div>
  )
}
