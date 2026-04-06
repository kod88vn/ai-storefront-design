'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useStudioStore } from '@/lib/store'
import type { AgentPlan } from '@/lib/types'

interface PlanApprovalProps {
  plan: AgentPlan
}

export function PlanApproval({ plan }: PlanApprovalProps) {
  const [showFeedback, setShowFeedback] = useState(false)
  const [feedback, setFeedback] = useState('')
  const { approvePlan, rejectPlan, setAgentStep, updateTheme, updateHero } = useStudioStore()

  const handleApprove = () => {
    approvePlan()
    // Apply the proposed changes
    updateTheme({ secondaryColor: '#22c55e' }) // Forest Green
    updateHero({ layout: 'minimal' })
    setAgentStep('updating')
    setTimeout(() => setAgentStep('complete'), 1500)
    setTimeout(() => setAgentStep('idle'), 3000)
  }

  const handleReject = () => {
    if (showFeedback && feedback) {
      rejectPlan(feedback)
      setAgentStep('idle')
    } else {
      setShowFeedback(true)
    }
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
        <Card className="w-[400px] border-border bg-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary">
                <MessageSquare className="h-4 w-4 text-primary-foreground" />
              </div>
              Plan Approval Required
            </CardTitle>
            <CardDescription>
              The AI has analyzed your input and proposes the following changes:
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
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-border"
                      style={{ backgroundColor: '#22c55e' }}
                    />
                  </span>
                </p>
              </div>
            </div>

            {showFeedback && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
              >
                <Textarea
                  placeholder="Provide feedback for the AI..."
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="min-h-[80px]"
                />
              </motion.div>
            )}

            <div className="flex gap-2">
              <Button onClick={handleApprove} className="flex-1 gap-2">
                <Check className="h-4 w-4" />
                Approve
              </Button>
              <Button
                variant="outline"
                onClick={handleReject}
                className="flex-1 gap-2"
              >
                <X className="h-4 w-4" />
                {showFeedback ? 'Submit Feedback' : 'Give Feedback'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  )
}
