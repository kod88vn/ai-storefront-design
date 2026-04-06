'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronUp, Terminal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStudioStore } from '@/lib/store'

export function AuditTrail() {
  const { auditLog, clearAuditLog } = useStudioStore()
  const [isExpanded, setIsExpanded] = useState(false)

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      fractionalSecondDigits: 3,
    })
  }

  return (
    <div className="border-t border-border bg-background">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-2 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">
            Audit Trail
          </span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {auditLog.length} entries
          </span>
        </div>
        <ChevronUp
          className={`h-4 w-4 text-muted-foreground transition-transform ${
            isExpanded ? '' : 'rotate-180'
          }`}
        />
      </button>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 200 }}
            exit={{ height: 0 }}
            className="overflow-hidden"
          >
            <div className="flex h-full flex-col border-t border-border">
              {/* Toolbar */}
              <div className="flex items-center justify-end border-b border-border px-4 py-1.5">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearAuditLog}
                  className="h-7 gap-1 text-xs text-muted-foreground"
                >
                  <Trash2 className="h-3 w-3" />
                  Clear
                </Button>
              </div>

              {/* Log Entries */}
              <ScrollArea className="flex-1 bg-zinc-950">
                <div className="space-y-1 p-3 font-mono text-xs">
                  {auditLog.length === 0 ? (
                    <div className="py-8 text-center text-zinc-500">
                      No audit entries yet. Interact with the studio to see logs.
                    </div>
                  ) : (
                    auditLog.map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-start gap-3 text-zinc-400"
                      >
                        <span className="shrink-0 text-zinc-600">
                          [{formatTimestamp(entry.timestamp)}]
                        </span>
                        <span className="text-emerald-400">{entry.method}</span>
                        <span className="text-zinc-500">
                          {JSON.stringify(entry.params)}
                        </span>
                        {entry.result && (
                          <span className="text-amber-400">
                            {'->'} {JSON.stringify(entry.result)}
                          </span>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
