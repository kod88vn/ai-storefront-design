'use client'

import { useEffect } from 'react'
import { LeftSidebar } from './left-sidebar'
import { CenterCanvas } from './center-canvas'
import { RightSidebar } from './right-sidebar'
import { AuditTrail } from './audit-trail'
import { useStudioStore } from '@/lib/store'

export function StudioLayout() {
  const { undo, redo } = useStudioStore()

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (!(e.metaKey || e.ctrlKey)) return
      if (e.key === 'z' && !e.shiftKey) {
        e.preventDefault()
        undo()
      } else if (e.key === 'z' && e.shiftKey) {
        e.preventDefault()
        redo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo])

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
