'use client'

import { useState } from 'react'
import {
  Palette,
  Layout,
  Type,
  GripVertical,
  Eye,
  EyeOff,
  ChevronDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { useStudioStore } from '@/lib/store'

export function RightSidebar() {
  return (
    <div className="flex w-80 flex-col border-l border-border bg-background">
      {/* Header */}
      <div className="border-b border-border p-4">
        <h2 className="text-sm font-semibold text-foreground">Live Editor</h2>
        <p className="mt-1 text-xs text-muted-foreground">
          Customize your storefront in real-time
        </p>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-4">
          <ThemePanel />
          <LayoutPanel />
          <ContentPanel />
        </div>
      </ScrollArea>
    </div>
  )
}

function ThemePanel() {
  const { config, updateTheme } = useStudioStore()
  const { theme } = config
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-between px-3 py-2"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Palette className="h-4 w-4" />
            Theme
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 px-3 pb-4">
        {/* Primary Color */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Primary Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.primaryColor}
              onChange={(e) => updateTheme({ primaryColor: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
            />
            <Input
              value={theme.primaryColor}
              onChange={(e) => updateTheme({ primaryColor: e.target.value })}
              className="h-9 flex-1 font-mono text-xs"
            />
          </div>
        </div>

        {/* Secondary Color */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Secondary Color</Label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={theme.secondaryColor}
              onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
              className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent"
            />
            <Input
              value={theme.secondaryColor}
              onChange={(e) => updateTheme({ secondaryColor: e.target.value })}
              className="h-9 flex-1 font-mono text-xs"
            />
          </div>
        </div>

        {/* Border Radius */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Border Radius</Label>
          <Select
            value={theme.borderRadius}
            onValueChange={(value: 'none' | 'md' | 'full') =>
              updateTheme({ borderRadius: value })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">None (0px)</SelectItem>
              <SelectItem value="md">Medium (8px)</SelectItem>
              <SelectItem value="full">Full (9999px)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}

function LayoutPanel() {
  const { config, reorderSections, toggleSection } = useStudioStore()
  const { sections } = config
  const [isOpen, setIsOpen] = useState(true)
  const [draggedId, setDraggedId] = useState<string | null>(null)

  const handleDragStart = (id: string) => {
    setDraggedId(id)
  }

  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault()
    if (!draggedId || draggedId === targetId) return

    const newSections = [...sections]
    const draggedIndex = newSections.findIndex((s) => s.id === draggedId)
    const targetIndex = newSections.findIndex((s) => s.id === targetId)

    const [draggedItem] = newSections.splice(draggedIndex, 1)
    newSections.splice(targetIndex, 0, draggedItem)

    // Update order numbers
    newSections.forEach((s, i) => (s.order = i))
    reorderSections(newSections)
  }

  const handleDragEnd = () => {
    setDraggedId(null)
  }

  const sortedSections = [...sections].sort((a, b) => a.order - b.order)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-between px-3 py-2"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Layout className="h-4 w-4" />
            Layout
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 px-3 pb-4">
        <p className="mb-3 text-xs text-muted-foreground">
          Drag to reorder sections
        </p>
        {sortedSections.map((section) => (
          <div
            key={section.id}
            draggable
            onDragStart={() => handleDragStart(section.id)}
            onDragOver={(e) => handleDragOver(e, section.id)}
            onDragEnd={handleDragEnd}
            className={`flex cursor-move items-center gap-2 rounded-lg border bg-card px-3 py-2 transition-opacity ${
              draggedId === section.id ? 'opacity-50' : ''
            } ${!section.enabled ? 'opacity-50' : ''}`}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
            <span className="flex-1 text-sm capitalize">
              {section.type.replace('-', ' ')}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => toggleSection(section.id)}
            >
              {section.enabled ? (
                <Eye className="h-4 w-4" />
              ) : (
                <EyeOff className="h-4 w-4" />
              )}
            </Button>
          </div>
        ))}
      </CollapsibleContent>
    </Collapsible>
  )
}

function ContentPanel() {
  const { config, updateHero, setProductGridColumns } = useStudioStore()
  const { hero, productGrid } = config
  const [isOpen, setIsOpen] = useState(true)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="flex w-full items-center justify-between px-3 py-2"
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            <Type className="h-4 w-4" />
            Content
          </span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-4 px-3 pb-4">
        {/* Hero Layout */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Hero Layout</Label>
          <Select
            value={hero.layout}
            onValueChange={(value: 'split' | 'centered' | 'minimal') =>
              updateHero({ layout: value })
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="split">Split</SelectItem>
              <SelectItem value="centered">Centered</SelectItem>
              <SelectItem value="minimal">Minimal</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Hero Title */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Hero Title</Label>
          <Input
            value={hero.title}
            onChange={(e) => updateHero({ title: e.target.value })}
            className="h-9 text-sm"
          />
        </div>

        {/* Hero Subtitle */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">Hero Subtitle</Label>
          <Input
            value={hero.subtitle}
            onChange={(e) => updateHero({ subtitle: e.target.value })}
            className="h-9 text-sm"
          />
        </div>

        {/* Product Grid Columns */}
        <div className="space-y-2">
          <Label className="text-xs text-muted-foreground">
            Product Grid Columns
          </Label>
          <Select
            value={productGrid.columns.toString()}
            onValueChange={(value) =>
              setProductGridColumns(parseInt(value) as 2 | 3 | 4)
            }
          >
            <SelectTrigger className="h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2">2 Columns</SelectItem>
              <SelectItem value="3">3 Columns</SelectItem>
              <SelectItem value="4">4 Columns</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CollapsibleContent>
    </Collapsible>
  )
}
