'use client'

import { ArrowRight, ArrowDown } from 'lucide-react'
import type { ContainerLayoutMode, FlexContainerConfig, GridContainerConfig } from '@/lib/types'

export const selectCls = 'h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
export const labelCls = 'text-[10px] font-medium uppercase tracking-wider text-muted-foreground'

const POS_VALS = ['start', 'center', 'end'] as const
const CELL_GLYPHS = ['↖', '↑', '↗', '←', '·', '→', '↙', '↓', '↘']

export function ContainerLayoutConfig({ id, layoutMode, flexConfig, gridConfig, onMode, onFlex, onGrid }: {
    id: string; layoutMode: ContainerLayoutMode; flexConfig: FlexContainerConfig; gridConfig: GridContainerConfig
    onMode: (m: ContainerLayoutMode) => void; onFlex: (p: Partial<FlexContainerConfig>) => void; onGrid: (p: Partial<GridContainerConfig>) => void
}) {
    const { direction, justify, align, gap, wrap } = flexConfig

    const hVal = direction === 'row' ? justify : align
    const vVal = direction === 'row' ? align : justify
    const selCol = POS_VALS.indexOf(hVal as typeof POS_VALS[number])
    const selRow = POS_VALS.indexOf(vVal as typeof POS_VALS[number])

    function handleCellClick(col: number, row: number) {
        const h = POS_VALS[col]
        const v = POS_VALS[row]
        onFlex(direction === 'row' ? { justify: h, align: v } : { align: h, justify: v })
    }

    const gapVal = layoutMode === 'grid' ? gridConfig.gap : gap
    function setGap(v: number) { layoutMode === 'grid' ? onGrid({ gap: v }) : onFlex({ gap: v }) }

    return (
        <div data-testid={`layout-config-${id}`} className="space-y-3 rounded-md border border-border bg-muted/20 p-3">
            <div className="space-y-1.5">
                <span className={labelCls}>Layout</span>
                <div className="flex gap-1">
                    {([['block', 'Stack'], ['flex', 'Flex'], ['grid', 'Grid']] as const).map(([val, lbl]) => (
                        <button key={val} onClick={() => onMode(val)}
                            className={`flex-1 rounded py-1 text-xs font-medium transition-colors ${layoutMode === val ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{lbl}</button>
                    ))}
                </div>
            </div>

            {layoutMode === 'block' && (
                <p className="text-[10px] text-muted-foreground">Items stack top to bottom, each taking full width.</p>
            )}

            {layoutMode === 'flex' && (
                <>
                    <div className="space-y-1.5">
                        <span className={labelCls}>Direction</span>
                        <div className="flex gap-1">
                            {([['row', 'Row →', ArrowRight], ['column', 'Column ↓', ArrowDown]] as const).map(([val, lbl, Icon]) => (
                                <button key={val} onClick={() => onFlex({ direction: val })}
                                    className={`flex flex-1 items-center justify-center gap-1.5 rounded px-2 py-1.5 text-xs font-medium transition-colors ${direction === val ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                                    <Icon className="h-3.5 w-3.5" />{lbl}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <div className="space-y-1.5">
                            <span className={labelCls}>Alignment</span>
                            <div className="grid grid-cols-3 gap-0.5 rounded-md border border-border bg-background p-1" data-testid={`align-grid-${id}`}>
                                {[0, 1, 2].map((row) =>
                                    [0, 1, 2].map((col) => {
                                        const active = col === selCol && row === selRow
                                        return (
                                            <button key={`${row}-${col}`} onClick={() => handleCellClick(col, row)}
                                                title={`${['Top', 'Middle', 'Bottom'][row]} ${['Left', 'Center', 'Right'][col]}`}
                                                className={`flex h-7 w-7 items-center justify-center rounded text-xs transition-colors ${active ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                                                {CELL_GLYPHS[row * 3 + col]}
                                            </button>
                                        )
                                    })
                                )}
                            </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-2">
                            <div className="space-y-1.5">
                                <span className={labelCls}>Gap</span>
                                <div className="flex items-center overflow-hidden rounded-md border border-border">
                                    <button onClick={() => setGap(Math.max(0, gapVal - 1))} className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-muted">−</button>
                                    <span className="flex-1 text-center text-xs font-mono">{gapVal}</span>
                                    <button onClick={() => setGap(Math.min(16, gapVal + 1))} className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-muted">+</button>
                                </div>
                            </div>
                            {direction === 'row' && (
                                <label className="flex cursor-pointer items-center gap-1.5 text-[10px] text-muted-foreground">
                                    <input type="checkbox" checked={wrap} onChange={(e) => onFlex({ wrap: e.target.checked })} className="h-3 w-3 accent-primary" />
                                    Wrap
                                </label>
                            )}
                        </div>
                    </div>
                </>
            )}

            {layoutMode === 'grid' && (
                <div className="flex gap-3">
                    <div className="space-y-1.5">
                        <span className={labelCls}>Columns</span>
                        <div className="flex gap-1">
                            {[2, 3, 4, 6].map((n) => (
                                <button key={n} onClick={() => onGrid({ cols: n })}
                                    className={`flex-1 rounded border py-1 text-xs font-medium transition-colors ${gridConfig.cols === n ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted-foreground hover:text-foreground'}`}>{n}</button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1.5">
                        <span className={labelCls}>Gap</span>
                        <div className="flex items-center overflow-hidden rounded-md border border-border">
                            <button onClick={() => setGap(Math.max(0, gapVal - 1))} className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-muted">−</button>
                            <span className="flex-1 text-center text-xs font-mono">{gapVal}</span>
                            <button onClick={() => setGap(Math.min(16, gapVal + 1))} className="flex h-7 w-7 items-center justify-center text-muted-foreground hover:bg-muted">+</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
