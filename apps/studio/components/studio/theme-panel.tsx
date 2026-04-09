'use client'

import { useState } from 'react'
import { Palette, ChevronDown } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useStudioStore } from '@/lib/store'

const selectCls = 'h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring'
const labelCls = 'text-[10px] font-medium uppercase tracking-wider text-muted-foreground'

export function ThemePanel() {
    const { config, updateTheme } = useStudioStore()
    const { theme } = config
    const [open, setOpen] = useState(true)
    return (
        <div data-testid="theme-panel" className="border-b border-border">
            <button onClick={() => setOpen((o) => !o)} data-testid="theme-panel-toggle" className="flex w-full items-center justify-between px-3 py-2 text-xs font-semibold hover:bg-muted/50">
                <span className="flex items-center gap-2"><Palette className="h-3.5 w-3.5" />Theme</span>
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div data-testid="theme-panel-body" className="space-y-3 px-3 pb-3">
                    {([['Primary', 'primaryColor', theme.primaryColor], ['Secondary', 'secondaryColor', theme.secondaryColor]] as const).map(([label, key, val]) => (
                        <div key={key} className="space-y-1">
                            <span className={labelCls}>{label} Color</span>
                            <div className="flex items-center gap-2" data-testid={`${key}-row`}>
                                <input type="color" value={val} onChange={(e) => updateTheme({ [key]: e.target.value })} data-testid={`${key}-picker`} className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent" />
                                <Input value={val} onChange={(e) => updateTheme({ [key]: e.target.value })} data-testid={`${key}-input`} className="h-8 flex-1 font-mono text-xs" />
                            </div>
                        </div>
                    ))}
                    <div className="space-y-1">
                        <span className={labelCls}>Border Radius</span>
                        <select value={theme.borderRadius} onChange={(e) => updateTheme({ borderRadius: e.target.value as 'none' | 'md' | 'full' })} data-testid="border-radius-select" className={selectCls}>
                            <option value="none">None (0px)</option>
                            <option value="md">Medium (8px)</option>
                            <option value="full">Full (9999px)</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <span className={labelCls}>Nav Style</span>
                        <select value={theme.navStyle ?? 'bordered'} onChange={(e) => updateTheme({ navStyle: e.target.value as 'bordered' | 'transparent' | 'filled' })} data-testid="nav-style-select" className={selectCls}>
                            <option value="bordered">Bordered (white + border)</option>
                            <option value="transparent">Transparent (overlay on hero)</option>
                            <option value="filled">Filled (solid brand color)</option>
                        </select>
                    </div>
                    <div className="space-y-1">
                        <span className={labelCls}>Color Scheme</span>
                        <div className="flex gap-1">
                            {([['light', '☀️ Light'], ['dark', '🌙 Dark']] as const).map(([val, lbl]) => (
                                <button key={val} onClick={() => updateTheme({ colorScheme: val })} data-testid={`color-scheme-${val}`}
                                    className={`flex-1 rounded py-1.5 text-xs font-medium transition-colors ${(theme.colorScheme ?? 'light') === val ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>
                                    {lbl}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-1">
                        <span className={labelCls}>Font Style</span>
                        <select value={theme.fontStyle ?? 'modern-sans'} onChange={(e) => updateTheme({ fontStyle: e.target.value as 'modern-sans' | 'editorial-serif' | 'mono-tech' })} data-testid="font-style-select" className={selectCls}>
                            <option value="modern-sans">Modern Sans</option>
                            <option value="editorial-serif">Editorial Serif</option>
                            <option value="mono-tech">Mono Tech</option>
                        </select>
                    </div>
                </div>
            )}
        </div>
    )
}
