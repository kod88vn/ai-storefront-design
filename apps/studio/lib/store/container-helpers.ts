import type { LayoutSection } from "@ai-storefront/types";
import type { ComponentItem, DesignerContainer } from "@/lib/types";

export function patchItemInTree(
  items: ComponentItem[],
  containerId: string,
  componentId: string,
  patch: Record<string, unknown>,
): ComponentItem[] {
  return items.map((item) => {
    if (item.kind !== "container") return item;
    if (item.id === containerId) {
      return {
        ...item,
        components: item.components.map((c) =>
          c.id === componentId ? ({ ...c, ...patch } as ComponentItem) : c,
        ),
      };
    }
    return {
      ...item,
      components: patchItemInTree(item.components, containerId, componentId, patch),
    };
  });
}

export function syncSectionsFromContainers(
  containers: DesignerContainer[],
): LayoutSection[] {
  const sections: LayoutSection[] = [];
  let order = 0;
  for (const container of containers) {
    for (const comp of container.components) {
      if (comp.kind === "prebuilt") {
        sections.push({
          id: comp.sectionType,
          type: comp.sectionType,
          enabled: true,
          order: order++,
        });
      }
    }
  }
  return sections;
}
