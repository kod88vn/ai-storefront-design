'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

const labelCls = 'text-[10px] font-medium uppercase tracking-wider text-muted-foreground'

export function AdvancedSection({ value, onChange }: { value: string; onChange: (v: string) => void }) {
    const [open, setOpen] = useState(false)
    const classes = value.trim().split(/\s+/).filter(Boolean)

    return (
        <div className="border-t border-border pt-2">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground"
            >
                <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
                Advanced {classes.length > 0 && <span className="ml-1 rounded bg-muted px-1 py-0.5 font-mono">{classes.length}</span>}
            </button>
            {open && (
                <div className="mt-2 space-y-2">
                    {classes.length > 0 && (
                        <div className="space-y-1">
                            <span className={labelCls}>Applied Classes</span>
                            <div className="flex flex-wrap gap-1">
                                {classes.map((cls) => (
                                    <span key={cls} className="flex items-center gap-0.5 rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-foreground">
                                        {cls}
                                        <button
                                            onClick={() => onChange(classes.filter((c) => c !== cls).join(' '))}
                                            className="ml-0.5 text-muted-foreground hover:text-destructive"
                                            title={`Remove ${cls}`}
                                        >✕</button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}
                    <div className="space-y-1">
                        <span className={labelCls}>Add / Edit Classes</span>
                        <textarea
                            value={value}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder="e.g. rounded-lg shadow-md p-4"
                            rows={2}
                            className="w-full resize-none rounded-md border border-border bg-background px-2.5 py-1.5 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
