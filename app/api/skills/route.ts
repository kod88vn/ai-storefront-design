import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export interface LoadedSkill {
  name: string;
  content: string;
}

export async function GET() {
  try {
    const skillsDir = path.join(process.cwd(), "lib/skills");
    const skillFolders = await fs.readdir(skillsDir);
    const skills: LoadedSkill[] = [];

    for (const folder of skillFolders) {
      const skillPath = path.join(skillsDir, folder, "SKILL.md");
      try {
        const content = await fs.readFile(skillPath, "utf-8");
        skills.push({ name: folder, content });
      } catch {
        // Skill file missing — skip
      }
    }

    return NextResponse.json({ skills });
  } catch {
    return NextResponse.json({ skills: [] });
  }
}
