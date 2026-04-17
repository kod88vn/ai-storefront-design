'use client'

import { useEffect, useState } from 'react'
import { Brain, Loader2, RotateCcw, MessageSquare, Wand2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { UploadedImageTokens } from '@/lib/types'
import { useStudioStore } from '@/lib/store'
import { useOrchestrator } from '@/hooks/use-orchestrator'
import type { AnalyticBaseline } from '@/lib/design-studio/analytic-recommender'
import { InlinePlanApproval } from './plan-approval'
import { AppliedSummaryPanel } from './applied-summary'
import { VisionInput } from './vision-input'
import { ExecutionTrace } from './execution-trace'
import { DesignWizard } from './design-wizard'

// ─── LeftSidebar ──────────────────────────────────────────────────────────────────
// Orchestrator shell — delegates to focused sub-components

export function LeftSidebar() {
  const {
    visionUrl,
    agentStep,
    agentPlan,
    setAgentStep,
    loadedSkills,
    setLoadedSkills,
    config,
    appliedSummary,
    setAppliedSummary,
    updateTheme,
    updateHero,
    updateProductGrid,
    reorderSections,
    updateSectionData,
    updateCategoriesConfig,
    updateFooterConfig,
    addAuditEntry,
  } = useStudioStore()

  const { startOrchestrator } = useOrchestrator()
  const [droppedImage, setDroppedImage] = useState<string | null>(null)
  const [imageTokens, setImageTokens] = useState<UploadedImageTokens | null>(null)
  const [goalText, setGoalText] = useState('')
  const [inputMode, setInputMode] = useState<'describe' | 'wizard'>('describe')

  useEffect(() => {
    fetch('/api/skills')
      .then((r) => r.json())
      .then(({ skills }) => setLoadedSkills(skills))
      .catch(() => { })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleSimulate() {
    const textGoal = goalText.trim()
    if (!textGoal && !droppedImage && !visionUrl) return

    // Validate URL — ignore visionUrl if it's not a valid http/https URL
    let effectiveVisionUrl: string | undefined
    if (visionUrl) {
      try {
        const parsed = new URL(visionUrl.trim())
        if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
          effectiveVisionUrl = visionUrl.trim()
        }
      } catch {
        // not a valid URL — ignore it, treat as text-only
      }
    }

    let goal: string
    if (effectiveVisionUrl) {
      goal = textGoal
        ? `${textGoal}. Use this storefront as visual reference: ${effectiveVisionUrl}`
        : `Analyze this storefront URL and redesign it to match its visual aesthetic: ${effectiveVisionUrl}`
    } else if (droppedImage) {
      const tokenHint = imageTokens
        ? ` Extracted screenshot tokens: primary ${imageTokens.primaryColor ?? 'n/a'}, secondary ${imageTokens.secondaryColor ?? 'n/a'}, background ${imageTokens.backgroundColor ?? 'n/a'}, color scheme ${imageTokens.colorScheme ?? 'light'}, dominant style ${imageTokens.dominantStyle ?? 'clean'}.`
        : ''
      goal = textGoal
        ? `${textGoal}. Use the attached screenshot as visual reference.${tokenHint}`
        : `Analyze the provided storefront screenshot and redesign to match its visual aesthetic.${tokenHint}`
    } else {
      goal = textGoal
    }
    startOrchestrator(goal, {
      visionUrl: effectiveVisionUrl,
      imageData: droppedImage,
      uploadedImageTokens: imageTokens,
      currentConfig: config,
      planFeedback: null,
      page: useStudioStore.getState().currentPage as import('@ai-storefront/types').PageType,
    })
  }

  function handleWizardComplete(goal: string) {
    setGoalText(goal)
    setInputMode('describe')
    // Switch to describe mode so user can review the synthesized goal before clicking Simulate
  }

  function handleWizardApplyBaseline(baseline: AnalyticBaseline) {
    const orderedTypes = new Set(baseline.sectionOrder)
    const nextSections = [
      ...baseline.sectionOrder.map((type, order) => {
        const existing = config.sections.find((section) => section.type === type || section.id === type)
        return {
          id: existing?.id ?? type,
          type,
          enabled: true,
          order,
        }
      }),
      ...config.sections
        .filter((section) => !orderedTypes.has(section.type))
        .map((section, index) => ({
          ...section,
          enabled: false,
          order: baseline.sectionOrder.length + index,
        })),
    ]

    updateTheme(baseline.theme)
    updateHero(baseline.hero)
    updateProductGrid(baseline.productGrid)
    updateCategoriesConfig(baseline.categories)
    updateFooterConfig(baseline.footer)
    updateSectionData(baseline.sectionData)
    reorderSections(nextSections)
    addAuditEntry({
      method: 'wizard/applyBaseline',
      params: {
        directives: baseline.directives,
      },
    })
    setGoalText(baseline.goal)
    setInputMode('describe')
    setAppliedSummary(null)
  }

  function handleReset() {
    setAgentStep('idle')
    setAppliedSummary(null)
  }

  const isComplete = agentStep === 'complete'
  const isAwaitingApproval = agentStep === 'awaiting-approval'
  const skillsLoaded = loadedSkills.length > 0
  const isRunning = agentStep !== 'idle' && agentStep !== 'complete' && agentStep !== 'awaiting-approval'
  const hasInput = goalText.trim().length > 0 || !!droppedImage || !!visionUrl

  return (
    <div data-testid="left-sidebar" className="flex h-full w-72 shrink-0 flex-col border-r border-border bg-background">
      <div data-testid="left-sidebar-header" className="shrink-0 border-b border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Orchestrator</h2>
        <p className="mt-1 text-xs text-muted-foreground">AI + analytic design assistant</p>
      </div>

      <div data-testid="left-sidebar-content" className="min-h-0 flex-1 overflow-y-auto">
        <div className={`p-4 ${isRunning ? 'flex h-full flex-col' : 'space-y-6'}`}>
          {isComplete && appliedSummary ? (
            <AppliedSummaryPanel summary={appliedSummary} />
          ) : isAwaitingApproval && agentPlan ? (
            <>
              <ExecutionTrace agentStep={agentStep} staticMode />
              <InlinePlanApproval plan={agentPlan} />
            </>
          ) : (
            <>
              <AnimatePresence>
                {!isRunning && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="space-y-6 overflow-hidden"
                  >
                    <div className="flex overflow-hidden rounded-md border border-border text-xs" data-testid="input-mode-toggle">
                      {(['describe', 'wizard'] as const).map((m) => (
                        <button
                          key={m}
                          onClick={() => setInputMode(m)}
                          data-testid={`input-mode-${m}`}
                          className={`flex flex-1 items-center justify-center gap-1.5 py-1.5 font-medium transition-colors ${inputMode === m ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
                            }`}
                        >
                          {m === 'describe'
                            ? <><MessageSquare className="h-3 w-3" />Describe</>
                            : <><Wand2 className="h-3 w-3" />Guide Me</>}
                        </button>
                      ))}
                    </div>

                    {inputMode === 'wizard' ? (
                      <DesignWizard onComplete={handleWizardComplete} onApplyBaseline={handleWizardApplyBaseline} />
                    ) : (
                      <>
                        <div data-testid="goal-input-section" className="space-y-2">
                          <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                            <MessageSquare className="h-3.5 w-3.5" />
                            Design Goal
                          </h3>
                          <textarea
                            data-testid="goal-text-input"
                            placeholder="Describe what you want, e.g. 'Make it feel more premium and dark'..."
                            value={goalText}
                            onChange={(e) => setGoalText(e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSimulate() }}
                            rows={3}
                            className="w-full resize-none rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                          />
                          <p className="text-[10px] text-muted-foreground">⌘ + Enter to run &nbsp;·&nbsp; URL and image below are optional</p>
                        </div>

                        <VisionInput
                          droppedImage={droppedImage}
                          onImageReady={(dataUrl, tokens) => {
                            setDroppedImage(dataUrl)
                            setImageTokens(tokens ?? null)
                          }}
                        />
                      </>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {agentStep !== 'idle' && <ExecutionTrace agentStep={agentStep} />}
            </>
          )}
        </div>
      </div>

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
            disabled={isRunning || isAwaitingApproval || !skillsLoaded || !hasInput}
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
