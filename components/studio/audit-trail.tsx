'use client'

import { useEffect, useRef, useState } from 'react'
import { ChevronUp, Terminal, Trash2 } from 'lucide-react'
import { useStudioStore } from '@/lib/store'
import type { AuditLogEntry } from '@/lib/types'

function formatTimestamp(date: Date): string {
  return date.toLocaleTimeString('en-US', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    fractionalSecondDigits: 3,
  })
}

// ── Sub-component: single log row ─────────────────────────────────────────────

function AuditEntry({ entry }: { entry: AuditLogEntry }) {
  return (
    <div
      data-testid="audit-trail-entry"
      className="flex flex-wrap items-start gap-x-3 gap-y-0.5 text-zinc-400"
    >
      <span className="shrink-0 text-zinc-600">
        [{formatTimestamp(entry.timestamp)}]
      </span>
      <span className="shrink-0 text-emerald-400">{entry.method}</span>
      <span className="break-all text-zinc-500">
        {JSON.stringify(entry.params)}
      </span>
      {entry.result !== undefined && (
        <span className="text-amber-400">
          {'-> '}{JSON.stringify(entry.result)}
        </span>
      )}
    </div>
  )
}

// ── Sub-component: scrollable log list ───────────────────────────────────────

function AuditLogList({ entries }: { entries: AuditLogEntry[] }) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [entries.length])

  if (entries.length === 0) {
    return (
      <div
        data-testid="audit-trail-empty"
        className="py-8 text-center text-zinc-500"
      >
        No audit entries yet. Interact with the studio to see logs.
      </div>
    )
  }

  return (
    <div
      data-testid="audit-trail-log"
      className="space-y-1 p-3 font-mono text-xs"
    >
      {entries.map((entry) => (
        <AuditEntry key={entry.id} entry={entry} />
      ))}
      <div ref={bottomRef} />
    </div>
  )
}

// ── Sub-component: toolbar ────────────────────────────────────────────────────

function AuditToolbar({ onClear }: { onClear: () => void }) {
  return (
    <div
      data-testid="audit-trail-toolbar"
      className="flex items-center justify-end border-b border-border px-4 py-1.5"
    >
      <button
        onClick={onClear}
        data-testid="audit-trail-clear-button"
        className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <Trash2 className="h-3 w-3" />
        Clear
      </button>
    </div>
  )
}

// ── Root component ────────────────────────────────────────────────────────────

export function AuditTrail() {
  const { auditLog, clearAuditLog } = useStudioStore()
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div data-testid="audit-trail" className="shrink-0 border-t border-border bg-background">
      <button
        onClick={() => setIsExpanded((v) => !v)}
        data-testid="audit-trail-header"
        className="flex w-full items-center justify-between px-4 py-2 transition-colors hover:bg-muted/50"
      >
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-foreground">Audit Trail</span>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            {auditLog.length} entries
          </span>
        </div>
        <ChevronUp
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${
            isExpanded ? '' : 'rotate-180'
          }`}
        />
      </button>

      {isExpanded && (
        <div
          data-testid="audit-trail-panel"
          className="flex h-48 flex-col border-t border-border"
        >
          <AuditToolbar onClear={clearAuditLog} />
          <div className="min-h-0 flex-1 overflow-y-auto bg-zinc-950">
            <AuditLogList entries={auditLog} />
          </div>
        </div>
      )}
    </div>
  )
}
