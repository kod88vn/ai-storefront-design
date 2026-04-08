'use client'

import { LeftSidebar } from './left-sidebar'
import { CenterCanvas } from './center-canvas'
import { RightSidebar } from './right-sidebar'
import { AuditTrail } from './audit-trail'

export function StudioLayout() {
  return (
    <div className="flex h-screen flex-col bg-background">
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - The Orchestrator */}
        <LeftSidebar />
        
        {/* Center Canvas - The Preview */}
        <CenterCanvas />
        
        {/* Right Sidebar - The CMS */}
        <RightSidebar />
      </div>
      
      {/* Audit Trail - Bottom Panel */}
      <AuditTrail />
    </div>
  )
}
