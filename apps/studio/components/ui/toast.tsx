"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

export interface ToastProps {
    id: string
    title?: React.ReactNode
    description?: React.ReactNode
    action?: ToastActionElement
    variant?: "default" | "destructive"
    onOpenChange?: (open: boolean) => void
    open?: boolean
}

export interface ToastActionElement {
    children: React.ReactNode
    onClick?: () => void
    className?: string
}

const ToastAction: React.FC<ToastActionElement> = ({ children, onClick, className }) => (
    <button
        onClick={onClick}
        className={cn(
            "inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium ring-offset-background transition-colors hover:bg-secondary focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
            className
        )}
    >
        {children}
    </button>
)

const ToastClose: React.FC<{ onClick?: () => void }> = ({ onClick }) => (
    <button
        onClick={onClick}
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2"
    >
        <X className="h-4 w-4" />
    </button>
)

const ToastTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={cn("text-sm font-semibold", className)}>
        {children}
    </div>
)

const ToastDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div className={cn("text-sm opacity-90", className)}>
        {children}
    </div>
)

const Toast: React.FC<ToastProps> = ({
    id,
    title,
    description,
    action,
    variant = "default",
    onOpenChange
}) => {
    const [isVisible, setIsVisible] = React.useState(true)

    const handleClose = () => {
        setIsVisible(false)
        onOpenChange?.(false)
    }

    if (!isVisible) return null

    return (
        <div
            className={cn(
                "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
                variant === "destructive"
                    ? "border-red-500 bg-red-50 text-red-900 dark:border-red-400 dark:bg-red-950 dark:text-red-100"
                    : "border bg-background text-foreground"
            )}
        >
            <div className="flex flex-col space-y-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && <ToastDescription>{description}</ToastDescription>}
            </div>
            {action && <ToastAction {...action} />}
            <ToastClose onClick={handleClose} />
        </div>
    )
}

export {
    Toast,
    ToastTitle,
    ToastDescription,
    ToastClose,
    ToastAction,
}