'use client'

import { Check, Loader2, MessageSquare } from 'lucide-react'
import { useEffect, useRef } from 'react'
import type { AgentStep } from '@ai-storefront/types'
import { useStudioStore } from '@/lib/store'

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

function ThinkingStream() {
    const thinkingText = useStudioStore((s) => s.thinkingText)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [thinkingText])

    if (!thinkingText) return null

    return (
        <div
            data-testid="thinking-stream"
            className="flex-1 overflow-y-auto rounded-md border border-border bg-muted/40 p-2"
        >
            <p className="mb-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                AI Activity
            </p>
            <p className="whitespace-pre-wrap font-mono text-[10px] leading-relaxed text-foreground/70">
                {thinkingText}
            </p>
            <div ref={bottomRef} />
        </div>
    )
}

export function ExecutionTrace({ agentStep, staticMode }: ExecutionTraceProps) {
    const currentStepIndex = EXECUTION_STEPS.findIndex((s) => s.step === agentStep)
    const isActive = agentStep !== 'idle' && agentStep !== 'complete'
    return (
        <div data-testid="execution-trace" className="flex h-full flex-col space-y-3">
            <div>
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Execution Trace</h3>
                <div className="space-y-1">
                    {EXECUTION_STEPS.slice(0, currentStepIndex + 1).map((s, i) => {
                        const isCurrentStep = i === currentStepIndex
                        const showSpinner = isCurrentStep && !staticMode && s.step !== 'complete'
                        return (
                            <div
                                key={s.step}
                                data-testid={`execution-step-${s.step}`}
                                className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${isCurrentStep ? 'bg-primary/10 text-primary' : 'text-muted-foreground'}`}
                            >
                                {showSpinner
                                    ? <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                                    : isCurrentStep
                                        ? <MessageSquare className="h-4 w-4 shrink-0" />
                                        : <Check className="h-4 w-4 shrink-0" />
                                }
                                <span className="flex-1 text-xs">{s.label}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
            {isActive && !staticMode && <div className="flex-1"><ThinkingStream /></div>}
        </div>
    )
}
