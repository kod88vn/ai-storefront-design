'use client'

import { ArrowRight, Brain, Sparkles } from 'lucide-react'
import type { AppliedSummary } from '@ai-storefront/types'

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

function ColorRow({ label, before, after }: { label: string; before: string; after: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className="h-4 w-4 shrink-0 rounded border border-border" style={{ backgroundColor: after }} />
            <ValueRow label={label} before={before} after={after} />
        </div>
    )
}

export function AppliedSummaryPanel({ summary }: { summary: AppliedSummary }) {
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
                <div data-testid="summary-plan-description" className="rounded-md border border-primary/20 bg-primary/5 px-3 py-3">
                    <div className="mb-2 flex items-center gap-1.5">
                        <Brain className="h-3.5 w-3.5 text-primary" />
                        <p className="text-xs font-semibold text-primary">Why these changes?</p>
                    </div>
                    <p className="text-xs leading-relaxed text-foreground">{summary.planDescription}</p>
                </div>
            )}

            {summary.theme && (
                <div data-testid="summary-theme-changes" className="space-y-2 rounded-md border border-border bg-muted/40 px-3 py-2">
                    <p className="text-xs font-medium text-muted-foreground">Theme</p>
                    {summary.theme.primaryColor && <ColorRow label="Primary" before={summary.theme.primaryColor.before} after={summary.theme.primaryColor.after} />}
                    {summary.theme.secondaryColor && <ColorRow label="Secondary" before={summary.theme.secondaryColor.before} after={summary.theme.secondaryColor.after} />}
                    {summary.theme.borderRadius && <ValueRow label="Border Radius" before={summary.theme.borderRadius.before} after={summary.theme.borderRadius.after} />}
                    {summary.theme.fontStyle && <ValueRow label="Font Style" before={summary.theme.fontStyle.before} after={summary.theme.fontStyle.after} />}
                    {summary.theme.navStyle && <ValueRow label="Nav Style" before={summary.theme.navStyle.before} after={summary.theme.navStyle.after} />}
                    {summary.theme.colorScheme && <ValueRow label="Color Scheme" before={summary.theme.colorScheme.before} after={summary.theme.colorScheme.after} />}
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
