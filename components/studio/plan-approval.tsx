'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useStudioStore } from '@/lib/store'
import { useOrchestrator } from '@/hooks/use-orchestrator'
import type { AgentPlan } from '@/lib/types'

interface PlanApprovalProps {
  plan: AgentPlan
}

export function PlanApproval({ plan }: PlanApprovalProps) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState('')
  const { setAgentStep, setAgentPlan, addAuditEntry } = useStudioStore()
  const { resumeWithFeedback } = useOrchestrator()

  function handleApprove() {
    addAuditEntry({
      method: 'agent/approvePlan',
      params: { planId: plan.id },
      result: { approved: true },
    })
    resumeWithFeedback({ approved: true })
  }

  function handleSubmitFeedback() {
    if (!feedback.trim()) return
    addAuditEntry({
      method: 'agent/rejectPlan',
      params: { planId: plan.id, feedback },
      result: { approved: false },
    })
    resumeWithFeedback({ approved: false, modifications: feedback.trim() })
    setFeedback('')
    setShowFeedback(false)
  }

  function handleCancel() {
    // User dismisses the plan entirely — reset to idle without re-running
    setAgentPlan(null)
    setAgentStep('idle')
    addAuditEntry({
      method: 'agent/cancelPlan',
      params: { planId: plan.id },
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="w-[420px] border-border bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                  <MessageSquare className="h-4 w-4 text-primary-foreground" />
                </div>
                Plan Approval Required
              </CardTitle>
              <button
                onClick={handleCancel}
                className="rounded p-1 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <CardDescription>
              The AI has proposed the following design changes. Review and approve or give feedback.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted p-4 text-sm">
              <p className="font-medium text-foreground">{plan.description}</p>
              <div className="mt-3 space-y-2 text-muted-foreground">
                <p>
                  <span className="font-medium text-foreground">Layout:</span>{' '}
                  {plan.layoutProposal}
                </p>
                <p>
                  <span className="font-medium text-foreground">Color Accent:</span>{' '}
                  <span className="inline-flex items-center gap-2">
                    {plan.colorProposal}
                    {/#[0-9a-f]{3,6}/i.test(plan.colorProposal) && (
                      <span
                        className="inline-block h-4 w-4 rounded-full border border-border"
                        style={{
                          backgroundColor:
                            plan.colorProposal.match(/#[0-9a-f]{3,6}/i)?.[0] ?? '#22c55e',
                        }}
                      />
                    )}
                  </span>
                </p>
              </div>
            </div>

            {/* Feedback input */}
            {showFeedback && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
              >
                <Textarea
                  placeholder="Describe what you'd like changed (e.g. 'Use blue instead of green, keep the split layout')..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[80px]"
                  autoFocus
                />
              </motion.div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleApprove} className="flex-1 gap-2">
                <Check className="h-4 w-4" />
                Approve
              </Button>

              {showFeedback ? (
                <Button
                  variant="outline"
                  onClick={handleSubmitFeedback}
                  disabled={!feedback.trim()}
                  className="flex-1 gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Submit Feedback
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setShowFeedback(true)}
                  className="flex-1 gap-2"
                >
                  <MessageSquare className="h-4 w-4" />
                  Give Feedback
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
