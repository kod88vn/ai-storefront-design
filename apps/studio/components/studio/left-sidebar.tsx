'use client'

import { useEffect, useRef, useState } from 'react'
import {
  Link,
  ImagePlus,
  Brain,
  Loader2,
  Check,
  X,
  Sparkles,
  RotateCcw,
  MessageSquare,
  ArrowRight,
  Plus,
  User,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useStudioStore } from '@/lib/store'
import { useOrchestrator } from '@/hooks/use-orchestrator'
import type { AgentStep, AppliedSummary, AgentPlan, PlanChange } from '@ai-storefront/types'

// ─── Static metadata (display only) ──────────────────────────────────────────

const EXECUTION_STEPS: { step: AgentStep; label: string }[] = [
  { step: 'thinking', label: 'Thinking...' },
  { step: 'decomposing', label: 'Decomposing Goal...' },
  { step: 'executing', label: 'Executing Skills...' },
  { step: 'awaiting-approval', label: 'Awaiting Approval...' },
  { step: 'updating', label: 'Updating State...' },
  { step: 'complete', label: 'Complete!' },
]

// ─── Derive changes from plan fields when plannedChanges not provided ─────────

function getChanges(plan: AgentPlan): PlanChange[] {
  if (plan.plannedChanges?.length) return plan.plannedChanges
  // Fallback: synthesize granular items from the high-level proposal strings
  const changes: PlanChange[] = []
  if (plan.colorProposal) {
    changes.push({ id: 'primary-color', category: 'theme', label: 'Primary Color', description: plan.colorProposal })
  }
  if (plan.navStyleProposal) {
    changes.push({ id: 'nav-style', category: 'theme', label: 'Navbar Style', description: plan.navStyleProposal })
  }
  if (plan.colorSchemeProposal) {
    changes.push({ id: 'color-scheme', category: 'theme', label: 'Color Scheme', description: plan.colorSchemeProposal })
  }
  if (plan.layoutProposal) {
    changes.push({ id: 'layout', category: 'layout', label: 'Layout & Structure', description: plan.layoutProposal })
  }
  return changes
}

const CATEGORY_COLORS: Record<PlanChange['category'], string> = {
  theme: 'bg-violet-500/15 text-violet-400',
  hero: 'bg-blue-500/15 text-blue-400',
  layout: 'bg-amber-500/15 text-amber-400',
  sections: 'bg-green-500/15 text-green-400',
  content: 'bg-rose-500/15 text-rose-400',
}

// ─── Inline plan approval ──────────────────────────────────────────────────────

function InlinePlanApproval({ plan }: { plan: AgentPlan }) {
  const aiChanges = getChanges(plan)
  const [checked, setChecked] = useState<Record<string, boolean>>(
    () => Object.fromEntries(aiChanges.map((c) => [c.id, true]))
  )
  const [customChanges, setCustomChanges] = useState<PlanChange[]>([])
  const [customInput, setCustomInput] = useState('')
  const customInputRef = useRef<HTMLInputElement>(null)
  const { setAgentStep, setAgentPlan, addAuditEntry } = useStudioStore()
  const { resumeWithFeedback } = useOrchestrator()

  const allChanges = [...aiChanges, ...customChanges]

  function toggleChange(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  function addCustomChange() {
    const trimmed = customInput.trim()
    if (!trimmed) return
    const id = `custom-${Date.now()}`
    const newChange: PlanChange = { id, category: 'content', label: 'My Change', description: trimmed }
    setCustomChanges((prev) => [...prev, newChange])
    setChecked((prev) => ({ ...prev, [id]: true }))
    setCustomInput('')
    customInputRef.current?.focus()
  }

  function removeCustomChange(id: string) {
    setCustomChanges((prev) => prev.filter((c) => c.id !== id))
    setChecked((prev) => { const next = { ...prev }; delete next[id]; return next })
  }

  function handleApply() {
    const rejectedAi = aiChanges.filter((c) => !checked[c.id])
    const checkedCustom = customChanges.filter((c) => checked[c.id])
    const allAiApproved = rejectedAi.length === 0
    const hasCustom = checkedCustom.length > 0

    if (allAiApproved && !hasCustom) {
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
    const modifications = parts.join(' ')

    addAuditEntry({ method: 'agent/revisePlan', params: { planId: plan.id, modifications }, result: { approved: false } })
    resumeWithFeedback({ approved: false, modifications })
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
      {/* Header */}
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

      {/* Change checklist */}
      {allChanges.length > 0 && (
        <div data-testid="plan-changes-list" className="space-y-1">
          {allChanges.map((change) => {
            const isCustom = change.id.startsWith('custom-')
            return (
              <label
                key={change.id}
                data-testid={`plan-change-${change.id}`}
                className="flex cursor-pointer items-start gap-2 rounded-md border border-border bg-background p-2 hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={!!checked[change.id]}
                  onChange={() => toggleChange(change.id)}
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
                {isCustom && (
                  <button
                    onClick={(e) => { e.preventDefault(); removeCustomChange(change.id) }}
                    className="shrink-0 rounded p-0.5 text-muted-foreground hover:text-foreground"
                    data-testid={`plan-change-remove-${change.id}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </label>
            )
          })}
        </div>
      )}

      {/* Add custom change */}
      <div data-testid="plan-custom-change-section" className="space-y-1.5">
        <p className="text-xs font-medium text-muted-foreground">Add your own change</p>
        <div className="flex gap-1.5">
          <input
            ref={customInputRef}
            data-testid="plan-custom-change-input"
            type="text"
            placeholder="e.g. 'Use a warmer palette' or 'Move newsletter up'..."
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCustomChange() } }}
            className="h-8 flex-1 rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />
          <button
            data-testid="plan-custom-change-add"
            onClick={addCustomChange}
            disabled={!customInput.trim()}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <button
          data-testid="plan-apply-button"
          onClick={handleApply}
          disabled={allChanges.length === 0}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-md bg-primary px-3 py-2 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
        >
          {isFullApproval ? (
            <><Check className="h-3.5 w-3.5" /> Approve All</>
          ) : (
            <><ArrowRight className="h-3.5 w-3.5" /> Apply Selected</>
          )}
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

// ─── Applied summary ──────────────────────────────────────────────────────────────

function ValueRow({ label, before, after }: { label: string; before: string; after: string }) {
  return (
    <div data-testid={`value-row-${label.toLowerCase().replace(/\s+/g, '-')}`} className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5 text-xs flex-wrap">
        <span className="text-muted-foreground line-through">{before}</span>
        <ArrowRight className="h-3 w-3 shrink-0 text-muted-foreground" />
        <span className="font-medium text-foreground">{after}</span>
      </div>
    </div>
  )
}

function AppliedSummaryPanel({ summary }: { summary: AppliedSummary }) {
  return (
    <div data-testid="applied-summary" className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">Applied Changes</h3>
      </div>

      {summary.sourceUrl && (
        <div data-testid="summary-source-url" className="rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="mb-0.5 text-xs font-medium text-muted-foreground">Source</p>
          <p className="break-all text-xs text-foreground">{summary.sourceUrl}</p>
        </div>
      )}

      {summary.planDescription && (
        <div data-testid="summary-plan-description" className="rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="mb-0.5 text-xs font-medium text-muted-foreground">Plan</p>
          <p className="text-xs text-foreground">{summary.planDescription}</p>
        </div>
      )}

      {summary.theme && (
        <div data-testid="summary-theme-changes" className="space-y-2 rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">Theme</p>
          {summary.theme.primaryColor && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 shrink-0 rounded border border-border" style={{ backgroundColor: summary.theme.primaryColor.after }} />
              <ValueRow label="Primary" before={summary.theme.primaryColor.before} after={summary.theme.primaryColor.after} />
            </div>
          )}
          {summary.theme.secondaryColor && (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 shrink-0 rounded border border-border" style={{ backgroundColor: summary.theme.secondaryColor.after }} />
              <ValueRow label="Secondary" before={summary.theme.secondaryColor.before} after={summary.theme.secondaryColor.after} />
            </div>
          )}
          {summary.theme.borderRadius && (
            <ValueRow label="Border Radius" before={summary.theme.borderRadius.before} after={summary.theme.borderRadius.after} />
          )}
        </div>
      )}

      {summary.hero && (
        <div data-testid="summary-hero-changes" className="space-y-2 rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">Hero</p>
          {summary.hero.layout && <ValueRow label="Layout" before={summary.hero.layout.before} after={summary.hero.layout.after} />}
          {summary.hero.title && <ValueRow label="Title" before={summary.hero.title.before} after={summary.hero.title.after} />}
          {summary.hero.subtitle && <ValueRow label="Subtitle" before={summary.hero.subtitle.before} after={summary.hero.subtitle.after} />}
        </div>
      )}

      {summary.productGridColumns && (
        <div data-testid="summary-grid-changes" className="rounded-md border border-border bg-muted/40 px-3 py-2">
          <ValueRow label="Grid Columns" before={`${summary.productGridColumns.before}`} after={`${summary.productGridColumns.after}`} />
        </div>
      )}

      {summary.sectionOrder && (
        <div data-testid="summary-section-order" className="rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Section Order</p>
          <div className="flex gap-3 text-xs">
            <div className="flex-1">
              <p className="mb-1 text-muted-foreground line-through">Before</p>
              <ol className="list-inside list-decimal space-y-0.5">
                {summary.sectionOrder.before.map((id) => <li key={id} className="capitalize text-muted-foreground">{id.replace(/-/g, ' ')}</li>)}
              </ol>
            </div>
            <ArrowRight className="mt-5 h-3 w-3 shrink-0 text-muted-foreground" />
            <div className="flex-1">
              <p className="mb-1 font-medium text-foreground">After</p>
              <ol className="list-inside list-decimal space-y-0.5">
                {summary.sectionOrder.after.map((id) => <li key={id} className="capitalize text-foreground">{id.replace(/-/g, ' ')}</li>)}
              </ol>
            </div>
          </div>
        </div>
      )}

      {summary.sectionsEnabled && (
        <div data-testid="summary-sections-enabled" className="space-y-1.5 rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">Sections Active</p>
          <ValueRow
            label="Active"
            before={summary.sectionsEnabled.before.join(', ') || 'none'}
            after={summary.sectionsEnabled.after.join(', ') || 'none'}
          />
        </div>
      )}
    </div>
  )
}

// ─── Main component ──────────────────────────────────────────────────────────────

export function LeftSidebar() {
  const {
    visionUrl,
    setVisionUrl,
    agentStep,
    agentPlan,
    setAgentStep,
    loadedSkills,
    setLoadedSkills,
    addAuditEntry,
    config,
    appliedSummary,
    setAppliedSummary,
  } = useStudioStore()

  const { startOrchestrator } = useOrchestrator()

  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [droppedImage, setDroppedImage] = useState<string | null>(null)
  const [goalText, setGoalText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/skills')
      .then((r) => r.json())
      .then(({ skills }) => setLoadedSkills(skills))
      .catch(() => { })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function readImageFile(file: File) {
    if (!file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setDroppedImage(dataUrl)
      addAuditEntry({ method: 'vision/imageAdded', params: { filename: file.name, size: file.size } })
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDraggingOver(false)
    const file = e.dataTransfer.files[0]
    if (file) readImageFile(file)
  }

  function handleSimulate() {
    const textGoal = goalText.trim()
    let goal: string
    if (visionUrl) {
      goal = textGoal
        ? `${textGoal}. Use this storefront as visual reference: ${visionUrl}`
        : `Analyze this storefront URL and redesign it to match its visual aesthetic: ${visionUrl}`
    } else if (droppedImage) {
      goal = textGoal
        ? `${textGoal}. Use the attached screenshot as visual reference.`
        : 'Analyze the provided storefront screenshot and redesign to match its visual aesthetic'
    } else {
      goal = textGoal || 'Propose an improved minimalist design for the current storefront configuration'
    }

    startOrchestrator(goal, {
      visionUrl: visionUrl || undefined,
      imageData: droppedImage,
      currentConfig: config,
      planFeedback: null,
    })
  }

  function handleReset() {
    setAgentStep('idle')
    setAppliedSummary(null)
  }

  const isComplete = agentStep === 'complete'
  const isAwaitingApproval = agentStep === 'awaiting-approval'
  const skillsLoaded = loadedSkills.length > 0
  const isRunning = agentStep !== 'idle' && agentStep !== 'complete' && agentStep !== 'awaiting-approval'
  const currentStepIndex = EXECUTION_STEPS.findIndex((s) => s.step === agentStep)

  return (
    <div data-testid="left-sidebar" className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-background">
      {/* Header */}
      <div data-testid="left-sidebar-header" className="shrink-0 border-b border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Orchestrator</h2>
        <p className="mt-1 text-xs text-muted-foreground">AI-powered design assistant</p>
      </div>

      {/* Scrollable content */}
      <div data-testid="left-sidebar-content" className="min-h-0 flex-1 overflow-y-auto">
        <div className="space-y-6 p-4">

          {/* Complete: show summary */}
          {isComplete && appliedSummary ? (
            <AppliedSummaryPanel summary={appliedSummary} />
          ) : isAwaitingApproval && agentPlan ? (
            <>
              {/* Execution trace up to awaiting-approval */}
              <div data-testid="execution-trace" className="space-y-3">
                <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Execution Trace</h3>
                <div className="space-y-1">
                  {EXECUTION_STEPS.slice(0, currentStepIndex + 1).map((s, i) => (
                    <div
                      key={s.step}
                      data-testid={`execution-step-${s.step}`}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${i === currentStepIndex ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                        }`}
                    >
                      <MessageSquare className="h-4 w-4 shrink-0" />
                      <span className="flex-1 text-xs">{s.label}</span>
                    </div>
                  ))}
                </div>
              </div>
              {/* Inline approval card */}
              <InlinePlanApproval plan={agentPlan} />
            </>
          ) : (
            <>
              {/* Design Goal */}
              <div data-testid="goal-input-section" className="space-y-2">
                <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <MessageSquare className="h-3.5 w-3.5" />
                  Design Goal
                </h3>
                <textarea
                  data-testid="goal-text-input"
                  placeholder="Describe what you want, e.g. 'Make it feel more premium and dark' or 'Add a testimonials section with a bold color palette'..."
                  value={goalText}
                  onChange={(e) => setGoalText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSimulate()
                  }}
                  rows={3}
                  className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                />
                <p className="text-[10px] text-muted-foreground">⌘ + Enter to run &nbsp;·&nbsp; URL and image below are optional</p>
              </div>

              {/* Vision Input */}
              <div data-testid="vision-input-section" className="space-y-3">
                <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Link className="h-3.5 w-3.5" />
                  Vision Reference <span className="normal-case font-normal text-muted-foreground/60">(optional)</span>
                </h3>

                <Input
                  data-testid="vision-url-input"
                  placeholder="Enter URL to analyze..."
                  value={visionUrl}
                  onChange={(e) => setVisionUrl(e.target.value)}
                  className="h-9 text-sm"
                />

                <div
                  data-testid="image-drop-zone"
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true) }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  className={`relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${isDraggingOver ? 'border-primary bg-primary/10' : 'border-border bg-muted/50 hover:border-muted-foreground/50'
                    }`}
                >
                  {droppedImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={droppedImage} alt="Dropped design" className="h-full w-full object-cover" />
                      <button
                        onClick={(e) => { e.stopPropagation(); setDroppedImage(null) }}
                        data-testid="image-clear-button"
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-xs text-muted-foreground">Drop image or click to upload</p>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) readImageFile(file)
                    e.target.value = ''
                  }}
                />
              </div>

              {/* Execution Trace */}
              {agentStep !== 'idle' && (
                <div data-testid="execution-trace" className="space-y-3">
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Execution Trace</h3>
                  <div className="space-y-1">
                    {EXECUTION_STEPS.slice(0, currentStepIndex + 1).map((s, i) => (
                      <div
                        key={s.step}
                        data-testid={`execution-step-${s.step}`}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${i === currentStepIndex ? 'bg-primary/10 text-primary' : 'text-muted-foreground'
                          }`}
                      >
                        {i === currentStepIndex && s.step !== 'complete' ? (
                          <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
                        ) : (
                          <Check className="h-4 w-4 shrink-0" />
                        )}
                        <span className="flex-1 text-xs">{s.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Footer */}
      <div data-testid="simulate-button-wrapper" className="shrink-0 border-t border-border p-4">
        {isComplete ? (
          <button
            data-testid="reset-button"
            onClick={handleReset}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-muted"
          >
            <RotateCcw className="h-4 w-4" />
            Start New Design
          </button>
        ) : (
          <button
            data-testid="simulate-button"
            onClick={handleSimulate}
            disabled={isRunning || isAwaitingApproval || !skillsLoaded}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Running...</>
            ) : !skillsLoaded ? (
              <><Loader2 className="h-4 w-4 animate-spin" />Loading...</>
            ) : (
              <><Brain className="h-4 w-4" />Simulate AI Design</>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
