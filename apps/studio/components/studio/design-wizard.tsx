'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'

const QUESTIONS = [
    {
        id: 'category',
        q: 'What type of store is this?',
        opts: ['Fashion & Apparel', 'Beauty & Skincare', 'Food & Beverage', 'Home & Living', 'Electronics & Tech', 'Jewelry & Accessories', 'Sports & Outdoor', 'Health & Wellness'],
    },
    {
        id: 'personality',
        q: "What's the brand personality?",
        opts: ['Luxury & High-end', 'Natural & Organic', 'Bold & Energetic', 'Clean & Minimal', 'Playful & Fun', 'Professional & Clinical'],
    },
    {
        id: 'mood',
        q: 'What visual mood fits best?',
        opts: ['Dark & Moody', 'Light & Airy', 'Warm & Earthy', 'Cool & Professional', 'Vibrant & Colorful', 'Classic & Timeless'],
    },
    {
        id: 'typography',
        q: 'How should the text feel?',
        opts: ['Modern & Sharp', 'Editorial & Refined', 'Friendly & Approachable', 'Technical & Precise', 'Creative & Expressive'],
    },
    {
        id: 'customer',
        q: "Who's your target customer?",
        opts: ['Young adults 18–30', 'Professionals 25–45', 'Luxury shoppers', 'Outdoor enthusiasts', 'Health-conscious buyers', 'Families'],
    },
    {
        id: 'focus',
        q: 'What should the design prioritize?',
        opts: ['Conversions & Sales', 'Brand storytelling', 'Product discovery', 'Trust & Credibility', 'Community & Lifestyle'],
    },
] as const

type QuestionId = typeof QUESTIONS[number]['id']
type Answers = Partial<Record<QuestionId, string>>

function synthesizeGoal(answers: Answers): string {
    const parts: string[] = []
    if (answers.category) parts.push(`This is a ${answers.category} store`)
    if (answers.personality) parts.push(`with a "${answers.personality}" brand personality`)
    if (answers.mood) parts.push(`The visual mood should be "${answers.mood}"`)
    if (answers.typography) parts.push(`Typography should feel "${answers.typography}"`)
    if (answers.customer) parts.push(`targeting ${answers.customer}`)
    if (answers.focus) parts.push(`Primary focus: ${answers.focus}`)
    return parts.join('. ') + '. Create a cohesive storefront design that captures all these qualities.'
}

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

export function DesignWizard({ onComplete }: { onComplete: (goal: string) => void }) {
    const [step, setStep] = useState(0)
    const [answers, setAnswers] = useState<Answers>({})

    const q = QUESTIONS[step]
    const selected = answers[q.id] ?? ''
    const isLast = step === QUESTIONS.length - 1

    function select(v: string) { setAnswers((a) => ({ ...a, [q.id]: v })) }

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

            <div className="flex gap-2">
                {step > 0 && (
                    <button onClick={() => setStep((s) => s - 1)} data-testid="wizard-back"
                        className="flex items-center gap-1 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted">
                        <ChevronLeft className="h-3.5 w-3.5" />Back
                    </button>
                )}
                <button
                    onClick={() => isLast ? onComplete(synthesizeGoal(answers)) : setStep((s) => s + 1)}
                    disabled={!selected.trim()}
                    data-testid="wizard-next"
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground disabled:opacity-40"
                >
                    {isLast ? <><Sparkles className="h-3.5 w-3.5" />Generate Design</> : <>Next<ChevronRight className="h-3.5 w-3.5" /></>}
                </button>
            </div>
        </div>
    )
}
