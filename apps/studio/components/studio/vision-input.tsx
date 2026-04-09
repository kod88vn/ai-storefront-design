'use client'

import { useRef, useState } from 'react'
import { Link, ImagePlus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useStudioStore } from '@/lib/store'

interface VisionInputProps {
    onImageReady: (dataUrl: string | null) => void
    droppedImage: string | null
}

export function VisionInput({ onImageReady, droppedImage }: VisionInputProps) {
    const { visionUrl, setVisionUrl, addAuditEntry } = useStudioStore()
    const [isDraggingOver, setIsDraggingOver] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    function readImageFile(file: File) {
        if (!file.type.startsWith('image/')) return
        const reader = new FileReader()
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string
            onImageReady(dataUrl)
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

    return (
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
                            onClick={(e) => { e.stopPropagation(); onImageReady(null) }}
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
    )
}
