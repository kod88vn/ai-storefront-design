"use client";

import { Plus, Trash2 } from "lucide-react";

import { useStudioStore } from "@/lib/store";
import { BENEFIT_ICONS, COLLECTION_LAYOUTS, TESTIMONIAL_LAYOUTS } from "@ai-storefront/types";

import { ColorRow, Field, inputCls, selectCls } from "./prebuilt-editor-shared";

export const SECTION_DATA_TYPES = new Set([
  "announcement-bar",
  "benefits-bar",
  "featured-collection",
  "testimonials",
  "newsletter",
  "trust-badges",
  "brand-strip",
]);

export function SectionDataEditor({ sectionKey }: { sectionKey: string }) {
  const { config, updateSectionData } = useStudioStore();
  const data = (config.sectionData as Record<string, unknown>)[sectionKey] ?? {};

  function patch(key: string, value: unknown) {
    updateSectionData({ [sectionKey]: { ...(data as object), [key]: value } } as never);
  }

  if (sectionKey === "announcement-bar") {
    const d = data as {
      text?: string;
      link?: string;
      backgroundColor?: string;
      textColor?: string;
      scrolling?: boolean;
    };
    return (
      <div className="space-y-3">
        <Field label="Text"><input className={inputCls} value={d.text ?? ""} onChange={(e) => patch("text", e.target.value)} /></Field>
        <Field label="Link URL"><input className={inputCls} value={d.link ?? ""} onChange={(e) => patch("link", e.target.value)} placeholder="https://..." /></Field>
        <ColorRow label="Background Color" value={d.backgroundColor ?? "#000000"} onChange={(v) => patch("backgroundColor", v)} />
        <ColorRow label="Text Color" value={d.textColor ?? "#ffffff"} onChange={(v) => patch("textColor", v)} />
        <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={d.scrolling ?? false} onChange={(e) => patch("scrolling", e.target.checked)} className="accent-primary h-3.5 w-3.5" />Scrolling Marquee</label>
      </div>
    );
  }

  if (sectionKey === "benefits-bar") {
    const d = data as { items?: Array<{ icon: string; label: string; detail?: string }>; backgroundColor?: string; textColor?: string };
    const items = d.items ?? [
      { icon: "truck", label: "[BENEFIT 1 — Click to edit]", detail: "[Supporting detail text]" },
      { icon: "refresh", label: "[BENEFIT 2 — Click to edit]", detail: "[Supporting detail text]" },
      { icon: "shield", label: "[BENEFIT 3 — Click to edit]", detail: "[Supporting detail text]" },
      { icon: "award", label: "[BENEFIT 4 — Click to edit]", detail: "[Supporting detail text]" },
    ];
    return (
      <div className="space-y-2">
        <ColorRow label="Background Color" value={d.backgroundColor ?? "#f5f5f5"} onChange={(v) => patch("backgroundColor", v)} />
        <ColorRow label="Text Color" value={d.textColor ?? "#171717"} onChange={(v) => patch("textColor", v)} />
        {items.map((item, i) => (
          <div key={i} className="flex gap-1.5 rounded-md border border-border p-2">
            <select value={item.icon} onChange={(e) => { const next = [...items]; next[i] = { ...item, icon: e.target.value }; patch("items", next); }} className="h-7 rounded border border-border bg-background px-1 text-xs">
              {BENEFIT_ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
            </select>
            <input className={`${inputCls} flex-1`} value={item.label} onChange={(e) => { const next = [...items]; next[i] = { ...item, label: e.target.value }; patch("items", next); }} placeholder="Label" />
            <input className={`${inputCls} flex-1`} value={item.detail ?? ""} onChange={(e) => { const next = [...items]; next[i] = { ...item, detail: e.target.value }; patch("items", next); }} placeholder="Detail" />
            <button onClick={() => patch("items", items.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        <button onClick={() => patch("items", [...items, { icon: "truck", label: "[New Benefit]", detail: "" }])} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="h-3.5 w-3.5" />Add item</button>
      </div>
    );
  }

  if (sectionKey === "testimonials") {
    const d = data as { heading?: string; layout?: string; showRatings?: boolean; backgroundColor?: string; textColor?: string; items?: Array<{ quote: string; author: string; location?: string; rating: number }> };
    const items = d.items ?? [];
    return (
      <div className="space-y-3">
        <Field label="Heading"><input className={inputCls} value={d.heading ?? ""} onChange={(e) => patch("heading", e.target.value)} /></Field>
        <Field label="Layout">
          <select value={d.layout ?? "grid"} onChange={(e) => patch("layout", e.target.value)} className={selectCls}>
            {TESTIMONIAL_LAYOUTS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>
        <label className="flex items-center gap-2 text-xs cursor-pointer"><input type="checkbox" checked={d.showRatings ?? true} onChange={(e) => patch("showRatings", e.target.checked)} className="accent-primary h-3.5 w-3.5" />Show Star Ratings</label>
        <ColorRow label="Background Color" value={d.backgroundColor ?? "#ffffff"} onChange={(v) => patch("backgroundColor", v)} />
        <ColorRow label="Text Color" value={d.textColor ?? "#171717"} onChange={(v) => patch("textColor", v)} />
        <div className="space-y-2">
          {items.map((item, i) => (
            <div key={i} className="space-y-1 rounded-md border border-border p-2">
              <textarea value={item.quote} onChange={(e) => { const next = [...items]; next[i] = { ...item, quote: e.target.value }; patch("items", next); }} rows={2} className="w-full resize-none rounded border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-ring" placeholder="Quote" />
              <div className="flex gap-1.5">
                <input className={`${inputCls} flex-1`} value={item.author} onChange={(e) => { const next = [...items]; next[i] = { ...item, author: e.target.value }; patch("items", next); }} placeholder="Author" />
                <input className={`${inputCls} flex-1`} value={item.location ?? ""} onChange={(e) => { const next = [...items]; next[i] = { ...item, location: e.target.value }; patch("items", next); }} placeholder="Location" />
                <select value={item.rating} onChange={(e) => { const next = [...items]; next[i] = { ...item, rating: parseInt(e.target.value) }; patch("items", next); }} className="h-8 w-14 rounded border border-border bg-background px-1 text-xs">
                  {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{"★".repeat(n)}</option>)}
                </select>
                <button onClick={() => patch("items", items.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>
          ))}
          <button onClick={() => patch("items", [...items, { quote: "[New testimonial]", author: "[Name]", location: "", rating: 5 }])} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="h-3.5 w-3.5" />Add testimonial</button>
        </div>
      </div>
    );
  }

  if (sectionKey === "newsletter") {
    const d = data as { heading?: string; subtext?: string; buttonText?: string; incentive?: string; backgroundColor?: string; textColor?: string };
    return (
      <div className="space-y-3">
        <Field label="Heading"><input className={inputCls} value={d.heading ?? ""} onChange={(e) => patch("heading", e.target.value)} /></Field>
        <Field label="Subtext"><input className={inputCls} value={d.subtext ?? ""} onChange={(e) => patch("subtext", e.target.value)} /></Field>
        <Field label="Button Label"><input className={inputCls} value={d.buttonText ?? "Subscribe"} onChange={(e) => patch("buttonText", e.target.value)} /></Field>
        <Field label="Incentive Text (optional)"><input className={inputCls} value={d.incentive ?? ""} onChange={(e) => patch("incentive", e.target.value || null)} placeholder="e.g. Get 10% off" /></Field>
        <ColorRow label="Background Color" value={d.backgroundColor ?? "#f5f5f5"} onChange={(v) => patch("backgroundColor", v)} />
        <ColorRow label="Text Color" value={d.textColor ?? "#171717"} onChange={(v) => patch("textColor", v)} />
      </div>
    );
  }

  if (sectionKey === "trust-badges") {
    const d = data as { items?: Array<{ icon: string; label: string }>; backgroundColor?: string; textColor?: string };
    const items = d.items ?? [];
    return (
      <div className="space-y-2">
        <ColorRow label="Background Color" value={d.backgroundColor ?? "#ffffff"} onChange={(v) => patch("backgroundColor", v)} />
        <ColorRow label="Text Color" value={d.textColor ?? "#171717"} onChange={(v) => patch("textColor", v)} />
        {items.map((item, i) => (
          <div key={i} className="flex gap-1.5 items-center">
            <select value={item.icon} onChange={(e) => { const next = [...items]; next[i] = { ...item, icon: e.target.value }; patch("items", next); }} className="h-7 rounded border border-border bg-background px-1 text-xs">
              {BENEFIT_ICONS.map((ic) => <option key={ic} value={ic}>{ic}</option>)}
            </select>
            <input className={`${inputCls} flex-1`} value={item.label} onChange={(e) => { const next = [...items]; next[i] = { ...item, label: e.target.value }; patch("items", next); }} placeholder="Label" />
            <button onClick={() => patch("items", items.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
          </div>
        ))}
        <button onClick={() => patch("items", [...items, { icon: "shield", label: "[Trust point]" }])} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="h-3.5 w-3.5" />Add item</button>
      </div>
    );
  }

  if (sectionKey === "brand-strip") {
    const d = data as { heading?: string; brands?: Array<{ name: string; logoText?: string }>; backgroundColor?: string; textColor?: string };
    const brands = d.brands ?? [];
    return (
      <div className="space-y-3">
        <Field label="Heading"><input className={inputCls} value={d.heading ?? ""} onChange={(e) => patch("heading", e.target.value)} /></Field>
        <ColorRow label="Background Color" value={d.backgroundColor ?? "#ffffff"} onChange={(v) => patch("backgroundColor", v)} />
        <ColorRow label="Text Color" value={d.textColor ?? "#171717"} onChange={(v) => patch("textColor", v)} />
        <div className="space-y-1.5">
          {brands.map((b, i) => (
            <div key={i} className="flex gap-1.5 items-center">
              <input className={`${inputCls} flex-1`} value={b.name} onChange={(e) => { const next = [...brands]; next[i] = { ...b, name: e.target.value }; patch("brands", next); }} placeholder="Name" />
              <input className={`${inputCls} flex-1`} value={b.logoText ?? ""} onChange={(e) => { const next = [...brands]; next[i] = { ...b, logoText: e.target.value }; patch("brands", next); }} placeholder="Display text" />
              <button onClick={() => patch("brands", brands.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          <button onClick={() => patch("brands", [...brands, { name: "[Brand]", logoText: "[BRAND]" }])} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><Plus className="h-3.5 w-3.5" />Add brand</button>
        </div>
      </div>
    );
  }

  if (sectionKey === "featured-collection") {
    const d = data as { heading?: string; subheading?: string; layout?: string; backgroundColor?: string; textColor?: string };
    return (
      <div className="space-y-3">
        <Field label="Heading"><input className={inputCls} value={d.heading ?? ""} onChange={(e) => patch("heading", e.target.value)} /></Field>
        <Field label="Subheading"><input className={inputCls} value={d.subheading ?? ""} onChange={(e) => patch("subheading", e.target.value)} /></Field>
        <Field label="Layout">
          <select value={d.layout ?? "grid"} onChange={(e) => patch("layout", e.target.value)} className={selectCls}>
            {COLLECTION_LAYOUTS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
        </Field>
        <ColorRow label="Background Color" value={d.backgroundColor ?? "#ffffff"} onChange={(v) => patch("backgroundColor", v)} />
        <ColorRow label="Text Color" value={d.textColor ?? "#171717"} onChange={(v) => patch("textColor", v)} />
      </div>
    );
  }

  return <p className="text-xs text-muted-foreground">No editable fields for this component.</p>;
}
