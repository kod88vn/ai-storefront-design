import fs from "fs/promises";
import path from "path";

import type { OrchestratorContext } from "@/lib/types";
import { SKILL_TEMPLATE_VARS } from "@ai-storefront/types";

export interface LoadedSkill {
  name: string;
  content: string;
}

export async function loadSkills(): Promise<LoadedSkill[]> {
  const skillsDir = path.join(process.cwd(), "lib/skills");
  try {
    const folders = await fs.readdir(skillsDir);
    const results = await Promise.all(
      folders.map(async (folder) => {
        try {
          const raw = await fs.readFile(
            path.join(skillsDir, folder, "SKILL.md"),
            "utf-8",
          );
          const content = raw.replace(
            /\{\{(\w+)\}\}/g,
            (_, key) => SKILL_TEMPLATE_VARS[key] ?? `{{${key}}}`,
          );
          return { name: folder, content } satisfies LoadedSkill;
        } catch {
          return null;
        }
      }),
    );
    return results.filter((skill): skill is LoadedSkill => skill !== null);
  } catch {
    return [];
  }
}

export function parseTags(content: string): string[] {
  const match = content.match(/##\s+Tags\s*\n+([^\n#]+)/m);
  if (!match) return [];
  return match[1]
    .split(/[,\s]+/)
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export function getActiveTags(
  goal: string,
  context: OrchestratorContext,
): Set<string> {
  const tags = new Set<string>(["always"]);
  if (context.imageData || context.visionUrl) tags.add("vision");
  if (/\b(copy|content|messag|voice|description)\b/i.test(goal)) {
    tags.add("content");
  }
  if (/\b(convert|conversion|sale|checkout|cta|funnel)\b/i.test(goal)) {
    tags.add("conversion");
  }
  return tags;
}

export function filterSkills(
  allSkills: LoadedSkill[],
  goal: string,
  context: OrchestratorContext,
): LoadedSkill[] {
  const activeTags = getActiveTags(goal, context);
  return allSkills.filter((skill) => {
    const tags = parseTags(skill.content);
    return tags.length === 0 || tags.some((tag) => activeTags.has(tag));
  });
}
