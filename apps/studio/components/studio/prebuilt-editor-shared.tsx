"use client";

import type { ReactNode } from "react";

export const inputCls =
  "h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring";
export const selectCls =
  "h-8 w-full rounded-md border border-border bg-background px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring";
export const labelCls =
  "text-[10px] font-medium uppercase tracking-wider text-muted-foreground";

export const FONT_SIZES = ["sm", "base", "lg", "xl"] as const;

export function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1">
      <span className={labelCls}>{label}</span>
      {children}
    </div>
  );
}

export function ColorRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8 w-10 cursor-pointer rounded border border-border"
      />
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  );
}
