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
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useStudioStore } from '@/lib/store'
import { useOrchestrator } from '@/hooks/use-orchestrator'
import type { AgentStep, AppliedSummary } from '@/lib/types'

// ─── Static metadata (display only) ──────────────────────────────────────────

const EXECUTION_STEPS: { step: AgentStep; label: string }[] = [
  { step: 'thinking', label: 'Thinking...' },
  { step: 'decomposing', label: 'Decomposing Goal...' },
  { step: 'executing', label: 'Executing Skills...' },
  { step: 'awaiting-approval', label: 'Awaiting Approval...' },
  { step: 'updating', label: 'Updating State...' },
  { step: 'complete', label: 'Complete!' },
]

// ─── Applied Summary Panel ────────────────────────────────────────────────────

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div data-testid={`summary-row-${label.toLowerCase().replace(/\s+/g, '-')}`} className="flex flex-col gap-0.5">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <span className="text-xs text-foreground">{value}</span>
    </div>
  )
}

function AppliedSummaryPanel({ summary }: { summary: AppliedSummary }) {
  return (
    <div data-testid="applied-summary" className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground">
          Applied Changes
        </h3>
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

      {summary.themeChanges && (
        <div data-testid="summary-theme-changes" className="space-y-2 rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">Theme</p>
          {summary.themeChanges.primaryColor && (
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 shrink-0 rounded border border-border"
                style={{ backgroundColor: summary.themeChanges.primaryColor }}
              />
              <SummaryRow label="Primary" value={summary.themeChanges.primaryColor} />
            </div>
          )}
          {summary.themeChanges.secondaryColor && (
            <div className="flex items-center gap-2">
              <div
                className="h-4 w-4 shrink-0 rounded border border-border"
                style={{ backgroundColor: summary.themeChanges.secondaryColor }}
              />
              <SummaryRow label="Secondary" value={summary.themeChanges.secondaryColor} />
            </div>
          )}
          {summary.themeChanges.borderRadius && (
            <SummaryRow label="Border Radius" value={summary.themeChanges.borderRadius} />
          )}
        </div>
      )}

      {summary.heroChanges && (
        <div data-testid="summary-hero-changes" className="space-y-2 rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="text-xs font-medium text-muted-foreground">Hero</p>
          {summary.heroChanges.layout && <SummaryRow label="Layout" value={summary.heroChanges.layout} />}
          {summary.heroChanges.title && <SummaryRow label="Title" value={summary.heroChanges.title} />}
          {summary.heroChanges.subtitle && <SummaryRow label="Subtitle" value={summary.heroChanges.subtitle} />}
        </div>
      )}

      {summary.productGridColumns && (
        <div data-testid="summary-grid-changes" className="rounded-md border border-border bg-muted/40 px-3 py-2">
          <SummaryRow label="Grid Columns" value={`${summary.productGridColumns} columns`} />
        </div>
      )}

      {summary.sectionOrder && (
        <div data-testid="summary-section-order" className="rounded-md border border-border bg-muted/40 px-3 py-2">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Section Order</p>
          <ol className="list-inside list-decimal space-y-0.5">
            {summary.sectionOrder.map((id) => (
              <li key={id} className="text-xs capitalize text-foreground">
                {id.replace('-', ' ')}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LeftSidebar() {
  const {
    visionUrl,
    setVisionUrl,
    agentStep,
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
      addAuditEntry({
        method: 'vision/imageAdded',
        params: { filename: file.name, size: file.size },
      })
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
    const goal = visionUrl
      ? `Analyze this storefront URL and redesign it to match its visual aesthetic: ${visionUrl}`
      : droppedImage
        ? 'Analyze the provided storefront screenshot and redesign to match its visual aesthetic'
        : 'Propose an improved minimalist design for the current storefront configuration'

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
  const skillsLoaded = loadedSkills.length > 0
  const isRunning =
    agentStep !== 'idle' && agentStep !== 'complete' && agentStep !== 'awaiting-approval'
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

          {/* ── Complete: show summary instead of inputs ── */}
          {isComplete && appliedSummary ? (
            <AppliedSummaryPanel summary={appliedSummary} />
          ) : (
            <>
              {/* Vision Input */}
              <div data-testid="vision-input-section" className="space-y-3">
                <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Link className="h-3.5 w-3.5" />
                  Vision Input
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
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDraggingOver(true)
                  }}
                  onDragLeave={() => setIsDraggingOver(false)}
                  className={`relative flex h-32 cursor-pointer items-center justify-center overflow-hidden rounded-lg border-2 border-dashed transition-colors ${
                    isDraggingOver
                      ? 'border-primary bg-primary/10'
                      : 'border-border bg-muted/50 hover:border-muted-foreground/50'
                  }`}
                >
                  {droppedImage ? (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={droppedImage}
                        alt="Dropped design"
                        className="h-full w-full object-cover"
                      />
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setDroppedImage(null)
                        }}
                        data-testid="image-clear-button"
                        className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white hover:bg-black/80"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </>
                  ) : (
                    <div className="text-center">
                      <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-xs text-muted-foreground">
                        Drop image or click to upload
                      </p>
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
                  <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Execution Trace
                  </h3>

                  <div className="space-y-1">
                    {EXECUTION_STEPS.slice(0, currentStepIndex + 1).map((s, i) => (
                      <div
                        key={s.step}
                        data-testid={`execution-step-${s.step}`}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                          i === currentStepIndex
                            ? 'bg-primary/10 text-primary'
                            : 'text-muted-foreground'
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

      {/* Footer button — changes based on state */}
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
            disabled={isRunning || agentStep === 'awaiting-approval' || !skillsLoaded}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isRunning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Running...
              </>
            ) : !skillsLoaded ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Brain className="h-4 w-4" />
                Simulate AI Design
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
