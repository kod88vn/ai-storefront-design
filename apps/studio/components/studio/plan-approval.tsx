'use client'

import { useRef, useState } from 'react'
import { MessageSquare, Check, ArrowRight, X, Plus, User } from 'lucide-react'
import { useStudioStore } from '@/lib/store'
import { useOrchestrator } from '@/hooks/use-orchestrator'
import type { AgentPlan, PlanChange } from '@ai-storefront/types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function getChanges(plan: AgentPlan): PlanChange[] {
    if (plan.plannedChanges?.length) return plan.plannedChanges
    const changes: PlanChange[] = []
    if (plan.colorProposal) changes.push({ id: 'primary-color', category: 'theme', label: 'Primary Color', description: plan.colorProposal })
    if (plan.navStyleProposal) changes.push({ id: 'nav-style', category: 'theme', label: 'Navbar Style', description: plan.navStyleProposal })
    if (plan.colorSchemeProposal) changes.push({ id: 'color-scheme', category: 'theme', label: 'Color Scheme', description: plan.colorSchemeProposal })
    if (plan.layoutProposal) changes.push({ id: 'layout', category: 'layout', label: 'Layout & Structure', description: plan.layoutProposal })
    return changes
}

const CATEGORY_COLORS: Record<PlanChange['category'], string> = {
    theme: 'bg-violet-500/15 text-violet-400',
    hero: 'bg-blue-500/15 text-blue-400',
    layout: 'bg-amber-500/15 text-amber-400',
    sections: 'bg-green-500/15 text-green-400',
    content: 'bg-rose-500/15 text-rose-400',
}

// ─── ChangeItem ───────────────────────────────────────────────────────────────

function ChangeItem({ change, checked, onToggle, onRemove }: {
    change: PlanChange; checked: boolean
    onToggle: () => void; onRemove?: () => void
}) {
    const isCustom = change.id.startsWith('custom-')
    return (
        <label
            data-testid={`plan-change-${change.id}`}
            className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-background p-2 hover:bg-muted/50"
        >
            <input
                type="checkbox"
                checked={checked}
                onChange={onToggle}
                className="mt-0.5 h-3.5 w-3.5 shrink-0 accent-primary"
                data-testid={`plan-change-checkbox-${change.id}`}
            />
            <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                    <span className={`inline-block rounded px-1 py-0.5 text-[10px] font-medium ${CATEGORY_COLORS[change.category]}`}>
                        {change.category}
                    </span>
                    {isCustom && (
                        <span className="inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[10px] font-medium bg-muted text-muted-foreground">
                            <User className="h-2.5 w-2.5" /> mine
                        </span>
                    )}
                    <p className="text-xs font-medium text-foreground">{change.label}</p>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{change.description}</p>
            </div>
            {isCustom && onRemove && (
                <button
                    onClick={(e) => { e.preventDefault(); onRemove() }}
                    className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                    data-testid={`plan-change-remove-${change.id}`}
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </label>
    )
}

// ─── CustomChangeInput ────────────────────────────────────────────────────────

function CustomChangeInput({ onAdd }: { onAdd: (description: string) => void }) {
    const [value, setValue] = useState('')
    const ref = useRef<HTMLInputElement>(null)
    function submit() {
        if (!value.trim()) return
        onAdd(value.trim())
        setValue('')
        ref.current?.focus()
    }
    return (
        <div data-testid="plan-custom-change-section" className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">Add your own change</p>
            <div className="flex gap-1.5">
                <input
                    ref={ref}
                    data-testid="plan-custom-change-input"
                    type="text"
                    placeholder="e.g. 'Use a warmer palette' or 'Move newsletter up'..."
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit() } }}
                    className="h-8 flex-1 rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <button
                    data-testid="plan-custom-change-add"
                    onClick={submit}
                    disabled={!value.trim()}
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
                >
                    <Plus className="h-3.5 w-3.5" />
                </button>
            </div>
        </div>
    )
}

// ─── InlinePlanApproval ───────────────────────────────────────────────────────

export function InlinePlanApproval({ plan }: { plan: AgentPlan }) {
    const aiChanges = getChanges(plan)
    const [checked, setChecked] = useState<Record<string, boolean>>(
        () => Object.fromEntries(aiChanges.map((c) => [c.id, true]))
    )
    const [customChanges, setCustomChanges] = useState<PlanChange[]>([])
    const { setAgentStep, setAgentPlan, addAuditEntry } = useStudioStore()
    const { resumeWithFeedback } = useOrchestrator()

    const allChanges = [...aiChanges, ...customChanges]

    function toggleChange(id: string) { setChecked((prev) => ({ ...prev, [id]: !prev[id] })) }

    function addCustomChange(description: string) {
        const id = `custom-${Date.now()}`
        setCustomChanges((prev) => [...prev, { id, category: 'content', label: 'My Change', description }])
        setChecked((prev) => ({ ...prev, [id]: true }))
    }

    function removeCustomChange(id: string) {
        setCustomChanges((prev) => prev.filter((c) => c.id !== id))
        setChecked((prev) => { const next = { ...prev }; delete next[id]; return next })
    }

    function handleApply() {
        const rejectedAi = aiChanges.filter((c) => !checked[c.id])
        const checkedCustom = customChanges.filter((c) => checked[c.id])
        const allAiApproved = rejectedAi.length === 0 && checkedCustom.length === 0

        if (allAiApproved) {
            addAuditEntry({ method: 'agent/approvePlan', params: { planId: plan.id }, result: { approved: true } })
            resumeWithFeedback({ approved: true })
            return
        }

        const parts: string[] = []
        const approvedLabels = aiChanges.filter((c) => checked[c.id]).map((c) => c.label)
        const rejectedLabels = rejectedAi.map((c) => c.label)
        if (approvedLabels.length) parts.push(`Approved: ${approvedLabels.join(', ')}.`)
        if (rejectedLabels.length) parts.push(`Rejected: ${rejectedLabels.join(', ')}.`)
        if (checkedCustom.length) parts.push(`Also please: ${checkedCustom.map((c) => c.description).join('. ')}.`)

        addAuditEntry({ method: 'agent/revisePlan', params: { planId: plan.id, modifications: parts.join(' ') }, result: { approved: false } })
        resumeWithFeedback({ approved: false, modifications: parts.join(' ') })
    }

    function handleCancel() {
        setAgentPlan(null)
        setAgentStep('idle')
        addAuditEntry({ method: 'agent/cancelPlan', params: { planId: plan.id } })
    }

    const allAiChecked = aiChanges.every((c) => checked[c.id])
    const hasCustom = customChanges.filter((c) => checked[c.id]).length > 0
    const isFullApproval = allAiChecked && !hasCustom

    return (
        <div data-testid="inline-plan-approval" className="space-y-3 rounded-lg border border-border bg-muted/40 p-3">
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <MessageSquare className="h-3 w-3 text-primary-foreground" />
                    </div>
                    <span className="text-xs font-semibold text-foreground">Review Proposed Changes</span>
                </div>
                <button onClick={handleCancel} data-testid="plan-cancel-button" className="rounded p-0.5 text-muted-foreground hover:text-foreground">
                    <X className="h-3.5 w-3.5" />
                </button>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed">{plan.description}</p>

            {allChanges.length > 0 && (
                <div data-testid="plan-changes-list" className="space-y-1">
                    {allChanges.map((change) => (
                        <ChangeItem
                            key={change.id}
                            change={change}
                            checked={!!checked[change.id]}
                            onToggle={() => toggleChange(change.id)}
                            onRemove={change.id.startsWith('custom-') ? () => removeCustomChange(change.id) : undefined}
                        />
                    ))}
                </div>
            )}

            <CustomChangeInput onAdd={addCustomChange} />

            <div className="flex gap-2">
                <button
                    data-testid="plan-apply-button"
                    onClick={handleApply}
                    disabled={allChanges.length === 0}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                >
                    {isFullApproval ? <><Check className="h-3.5 w-3.5" />Approve All</> : <><ArrowRight className="h-3.5 w-3.5" />Apply Selected</>}
                </button>
                <button
                    data-testid="plan-cancel-all-button"
                    onClick={handleCancel}
                    className="flex items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-xs font-medium text-foreground hover:bg-muted"
                >
                    Cancel
                </button>
            </div>
        </div>
    )
}
