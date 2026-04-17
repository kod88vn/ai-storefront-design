import type { LayoutSection } from '@ai-storefront/types'

const PERSISTENT_SECTION_TYPES = new Set<LayoutSection['type']>([
  'announcement-bar',
])

export function buildLivePageSections(
  globalSections: LayoutSection[] = [],
  pageSections: LayoutSection[] = [],
) {
  const pinnedTypes = new Set(
    pageSections
      .filter((section) => PERSISTENT_SECTION_TYPES.has(section.type))
      .map((section) => section.type),
  )

  const pinnedSections = globalSections.filter(
    (section) =>
      PERSISTENT_SECTION_TYPES.has(section.type) &&
      section.enabled &&
      !pinnedTypes.has(section.type),
  )

  return [...pinnedSections, ...pageSections].map((section, order) => ({
    ...section,
    order,
  }))
}
