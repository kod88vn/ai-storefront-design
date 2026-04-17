import * as React from 'react'
import { cn } from './utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'default' | 'ghost' | 'outline' | 'secondary' | 'destructive' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon' | 'icon-sm'
}

const variantCls: Record<NonNullable<ButtonProps['variant']>, string> = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    outline: 'border border-border bg-background hover:bg-accent hover:text-accent-foreground',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    destructive: 'bg-destructive text-white hover:bg-destructive/90',
    link: 'text-primary underline-offset-4 hover:underline',
}

const sizeCls: Record<NonNullable<ButtonProps['size']>, string> = {
    default: 'h-9 px-4 py-2 text-sm',
    sm: 'h-8 px-3 text-sm rounded-md',
    lg: 'h-10 px-6 text-sm rounded-md',
    icon: 'h-9 w-9',
    'icon-sm': 'h-8 w-8',
}

export function Button({ className, variant = 'default', size = 'default', ...props }: ButtonProps) {
    return (
        <button
            data-slot="button"
            className={cn(
                'inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium transition-all',
                'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                variantCls[variant],
                sizeCls[size],
                className,
            )}
            {...props}
        />
    )
}
