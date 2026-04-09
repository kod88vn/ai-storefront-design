'use client'

import { useEffect, useRef } from 'react'
import { Bold, Italic, Underline, List, Link2, Code, RotateCcw } from 'lucide-react'

function ToolBtn({ icon: Icon, cmd, arg, label, editorRef, onChange }: {
    icon: React.ElementType; cmd: string; arg?: string; label: string
    editorRef: React.RefObject<HTMLDivElement | null>; onChange: (v: string) => void
}) {
    function run(e: React.MouseEvent) {
        e.preventDefault()
        const val = cmd === 'createLink' ? window.prompt('Enter URL:') : arg
        if (cmd === 'createLink' && !val) return
        document.execCommand(cmd, false, val ?? undefined)
        if (editorRef.current) onChange(editorRef.current.innerHTML)
    }
    return (
        <button onMouseDown={run} className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground" title={label}>
            <Icon className="h-3.5 w-3.5" />
        </button>
    )
}

export function WysiwygEditor({ html, onChange }: { html: string; onChange: (v: string) => void }) {
    const ref = useRef<HTMLDivElement>(null)
    const focused = useRef(false)
    useEffect(() => { if (ref.current) ref.current.innerHTML = html }, [])
    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => { if (ref.current && !focused.current) ref.current.innerHTML = html }, [html])

    return (
        <div className="overflow-hidden rounded-md border border-border">
            <div className="flex flex-wrap gap-0.5 border-b border-border bg-muted/40 p-1">
                <ToolBtn icon={Bold} cmd="bold" label="Bold (Ctrl+B)" editorRef={ref} onChange={onChange} />
                <ToolBtn icon={Italic} cmd="italic" label="Italic (Ctrl+I)" editorRef={ref} onChange={onChange} />
                <ToolBtn icon={Underline} cmd="underline" label="Underline (Ctrl+U)" editorRef={ref} onChange={onChange} />
                <ToolBtn icon={List} cmd="insertUnorderedList" label="Bullet List" editorRef={ref} onChange={onChange} />
                <ToolBtn icon={Link2} cmd="createLink" label="Insert Link" editorRef={ref} onChange={onChange} />
                <ToolBtn icon={Code} cmd="formatBlock" arg="pre" label="Code Block" editorRef={ref} onChange={onChange} />
                <button
                    onMouseDown={(e) => { e.preventDefault(); document.execCommand('removeFormat'); if (ref.current) onChange(ref.current.innerHTML) }}
                    title="Clear Formatting"
                    className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground hover:bg-muted hover:text-foreground"
                >
                    <RotateCcw className="h-3.5 w-3.5" />
                </button>
            </div>
            <div
                ref={ref}
                contentEditable
                suppressContentEditableWarning
                onFocus={() => { focused.current = true }}
                onBlur={() => { focused.current = false; if (ref.current) onChange(ref.current.innerHTML) }}
                onInput={() => { if (ref.current) onChange(ref.current.innerHTML) }}
                className="min-h-24 px-3 py-2 text-sm focus:outline-none"
            />
        </div>
    )
}
