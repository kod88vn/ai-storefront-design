'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, ImagePlus, Zap, Brain, Layout, Palette, Loader2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useStudioStore } from '@/lib/store'
import type { AgentStep } from '@/lib/types'

const skills = [
  { id: 'ui_extractor', name: 'UI Extractor', icon: Layout },
  { id: 'theme_generator', name: 'Theme Generator', icon: Palette },
  { id: 'layout_planner', name: 'Layout Planner', icon: Brain },
]

const agentSteps: { step: AgentStep; label: string }[] = [
  { step: 'thinking', label: 'Thinking...' },
  { step: 'decomposing', label: 'Decomposing Goal...' },
  { step: 'executing', label: 'Executing Vision Skill...' },
  { step: 'awaiting-approval', label: 'Awaiting Approval...' },
  { step: 'updating', label: 'Updating State...' },
  { step: 'complete', label: 'Complete!' },
]

export function LeftSidebar() {
  const {
    visionUrl,
    setVisionUrl,
    activeSkills,
    toggleSkill,
    agentStep,
    setAgentStep,
    setAgentPlan,
    addAuditEntry,
  } = useStudioStore()

  const [isSimulating, setIsSimulating] = useState(false)

  const simulateAgentLoop = async () => {
    if (isSimulating) return
    setIsSimulating(true)

    // Step 1: Thinking
    setAgentStep('thinking')
    addAuditEntry({
      method: 'agent/start',
      params: { input: visionUrl || 'design analysis' },
    })
    await delay(1200)

    // Step 2: Decomposing
    setAgentStep('decomposing')
    addAuditEntry({
      method: 'tools/call',
      params: { name: 'analyze_layout', input: 'current_state' },
    })
    await delay(1500)

    // Step 3: Executing
    setAgentStep('executing')
    addAuditEntry({
      method: 'tools/call',
      params: { name: 'generate_theme', style: 'minimalist' },
    })
    await delay(1800)

    // Step 4: Awaiting Approval (HITL)
    setAgentStep('awaiting-approval')
    setAgentPlan({
      id: crypto.randomUUID(),
      description: 'AI proposes a Minimalist Layout with Forest Green accents.',
      layoutProposal: 'Minimal Hero with centered text',
      colorProposal: 'Forest Green (#22c55e)',
      approved: null,
    })
    addAuditEntry({
      method: 'agent/propose',
      params: {
        layout: 'minimal',
        accent: '#22c55e',
      },
    })

    setIsSimulating(false)
  }

  const currentStepIndex = agentSteps.findIndex((s) => s.step === agentStep)

  return (
    <div className="flex w-72 flex-col border-r border-border bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Orchestrator</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          AI-powered design assistant
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-6 p-4">
          {/* Vision/URL Extraction */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Link className="h-3.5 w-3.5" />
              Vision Input
            </h3>
            <Input
              placeholder="Enter URL to analyze..."
              value={visionUrl}
              onChange={(e) => setVisionUrl(e.target.value)}
              className="h-9 text-sm"
            />
            <div className="flex aspect-video cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/50 transition-colors hover:border-muted-foreground/50">
              <div className="text-center">
                <ImagePlus className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Drop image here
                </p>
              </div>
            </div>
          </div>

          {/* Skill Loader */}
          <div className="space-y-3">
            <h3 className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Zap className="h-3.5 w-3.5" />
              Active Skills
            </h3>
            <div className="space-y-2">
              {skills.map((skill) => {
                const Icon = skill.icon
                const isActive = activeSkills.includes(skill.id)
                return (
                  <button
                    key={skill.id}
                    onClick={() => toggleSkill(skill.id)}
                    className={`flex w-full items-center gap-3 rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                      isActive
                        ? 'border-primary/50 bg-primary/10 text-foreground'
                        : 'border-transparent bg-muted/50 text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="flex-1">{skill.name}</span>
                    {isActive && (
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Execution Trace */}
          {agentStep !== 'idle' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Execution Trace
              </h3>
              <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                  {agentSteps.slice(0, currentStepIndex + 1).map((s, i) => (
                    <motion.div
                      key={s.step}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                        i === currentStepIndex
                          ? 'bg-primary/10 text-primary'
                          : 'text-muted-foreground'
                      }`}
                    >
                      {i === currentStepIndex && s.step !== 'complete' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Check className="h-4 w-4" />
                      )}
                      {s.label}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </div>
      </ScrollArea>

      {/* Simulate Button */}
      <div className="border-t border-border p-4">
        <Button
          onClick={simulateAgentLoop}
          disabled={isSimulating || agentStep === 'awaiting-approval'}
          className="w-full gap-2"
        >
          {isSimulating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Running...
            </>
          ) : (
            <>
              <Brain className="h-4 w-4" />
              Simulate AI Design
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}
