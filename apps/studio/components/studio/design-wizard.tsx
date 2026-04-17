'use client'

import { useState } from 'react'
import { CheckCircle2, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import { buildAnalyticBaseline, QUESTIONS, type AnalyticBaseline, type Answers } from '@/lib/design-studio/analytic-recommender'

function WizardStep({ q, selected, onSelect }: {
    q: typeof QUESTIONS[number]; selected: string; onSelect: (v: string) => void
}) {
    const isCustom = selected !== '' && !(q.opts as readonly string[]).includes(selected)
    const [custom, setCustom] = useState(isCustom ? selected : '')
    return (
        <div data-testid={`wizard-step-${q.id}`} className="space-y-3">
            <p className="text-xs font-medium leading-relaxed text-foreground">{q.q}</p>
            <div className="flex flex-wrap gap-1.5">
                {q.opts.map((opt) => (
                    <button
                        key={opt}
                        onClick={() => { setCustom(''); onSelect(opt) }}
                        data-testid={`wizard-pill-${q.id}`}
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${selected === opt ? 'border-primary bg-primary text-primary-foreground' : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'}`}
                    >{opt}</button>
                ))}
            </div>
            <input
                value={custom}
                onChange={(e) => { setCustom(e.target.value); onSelect(e.target.value) }}
                placeholder="Or type your own…"
                className="h-7 w-full rounded-md border border-border bg-background px-2.5 text-xs placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
            />
        </div>
    )
}

function BaselinePreview({ baseline }: { baseline: AnalyticBaseline }) {
    return (
        <div data-testid="wizard-baseline-preview" className="space-y-2 rounded-md border border-border bg-muted/30 p-3">
            <div className="flex items-start gap-2">
                <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
                <div>
                    <p className="text-xs font-semibold text-foreground">{baseline.summary.title}</p>
                    <p className="text-[11px] text-muted-foreground">Rule-based recommendation ready to apply without AI.</p>
                </div>
            </div>
            <ul className="space-y-1 text-[11px] text-muted-foreground">
                {baseline.summary.bullets.map((bullet) => (
                    <li key={bullet}>• {bullet}</li>
                ))}
            </ul>
        </div>
    )
}

export function DesignWizard({ onComplete, onApplyBaseline }: { onComplete: (goal: string) => void; onApplyBaseline: (baseline: AnalyticBaseline) => void }) {
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState<Answers>({})
    const [reviewing, setReviewing] = useState(false)

    const q = QUESTIONS[step]
    const selected = answers[q.id] ?? ''
    const isLast = step === QUESTIONS.length - 1
    const baseline = buildAnalyticBaseline(answers)

    function select(v: string) {
        setReviewing(false)
        setAnswers((a) => ({ ...a, [q.id]: v }))
    }

    return (
        <div data-testid="design-wizard" className="space-y-4">
            <div className="flex items-center justify-between">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Question {step + 1} of {QUESTIONS.length}
                </span>
                <div className="flex gap-1">
                    {QUESTIONS.map((_, i) => (
                        <div key={i} className={`h-1 w-4 rounded-full transition-colors ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
                    ))}
                </div>
            </div>

            <WizardStep key={q.id} q={q} selected={selected} onSelect={select} />
            {isLast && reviewing && <BaselinePreview baseline={baseline} />}

            <div className="flex flex-wrap gap-2">
                {step > 0 && (
                    <button onClick={() => { setReviewing(false); setStep((s) => s - 1) }} data-testid="wizard-back"
                        className="flex min-w-[88px] items-center justify-center gap-1 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted sm:flex-none">
                        <ChevronLeft className="h-3.5 w-3.5" />Back
                    </button>
                )}

                {isLast && reviewing ? (
                    <>
                        <button
                            onClick={() => onApplyBaseline(baseline)}
                            data-testid="wizard-apply-baseline"
                            className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-md border border-border bg-background px-3 py-2 text-center text-xs font-medium text-foreground hover:bg-muted sm:min-w-[140px]"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                            <span>Apply Baseline</span>
                        </button>
                        <button
                            onClick={() => onComplete(baseline.goal)}
                            data-testid="wizard-use-ai-prompt"
                            className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-center text-xs font-medium text-primary-foreground sm:min-w-[140px]"
                        >
                            <Sparkles className="h-3.5 w-3.5 shrink-0" />
                            <span>Use as AI Prompt</span>
                        </button>
                    </>
                ) : (
                    <button
                        onClick={() => isLast ? setReviewing(true) : setStep((s) => s + 1)}
                        disabled={!selected.trim()}
                        data-testid="wizard-next"
                        className="flex min-h-10 flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground disabled:opacity-40"
                    >
                        {isLast ? <>Review Recommendation<ChevronRight className="h-3.5 w-3.5" /></> : <>Next<ChevronRight className="h-3.5 w-3.5" /></>}
                    </button>
                )}
            </div>
        </div>
    )
}
