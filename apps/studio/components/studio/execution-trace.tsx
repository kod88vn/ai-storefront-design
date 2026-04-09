'use client'

import { Check, Loader2, MessageSquare } from 'lucide-react'
import type { AgentStep } from '@ai-storefront/types'

const EXECUTION_STEPS: { step: AgentStep; label: string }[] = [
    { step: 'thinking', label: 'Thinking...' },
    { step: 'decomposing', label: 'Decomposing Goal...' },
    { step: 'executing', label: 'Executing Skills...' },
    { step: 'awaiting-approval', label: 'Awaiting Approval...' },
    { step: 'updating', label: 'Updating State...' },
    { step: 'complete', label: 'Complete!' },
]

interface ExecutionTraceProps {
    agentStep: AgentStep
    /** When true, the spinner is suppressed on the current step (used in approval view) */
    staticMode?: boolean
}

export function ExecutionTrace({ agentStep, staticMode }: ExecutionTraceProps) {
    const currentStepIndex = EXECUTION_STEPS.findIndex((s) => s.step === agentStep)
    return (
        <div data-testid="execution-trace" className="space-y-3">
            <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Execution Trace</h3>
            <div className="space-y-1">
                {EXECUTION_STEPS.slice(0, currentStepIndex + 1).map((s, i) => {
                    const isActive = i === currentStepIndex
                    const showSpinner = isActive && !staticMode && s.step !== 'complete'
                    return (
                        <div
                            key={s.step}
                            data-testid={`execution-step-${s.step}`}
                            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                        >
                            {showSpinner
                                ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                                : isActive
                                    ? <MessageSquare className="h-4 w-4 shrink-0" />
                                    : <Check className="h-4 w-4 shrink-0" />
                            }
                            <span className="flex-1 text-xs">{s.label}</span>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
