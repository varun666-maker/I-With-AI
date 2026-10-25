import { z } from "zod";
import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";

export const runtime = "nodejs";

const skillSchema = z.object({
  name: z.string().trim().min(1).max(100),
  proficiency: z.string().trim().max(60).nullable().optional(),
  years: z.number().min(0).max(80).nullable().optional(),
  position: z.number().int().min(0).max(999).optional(),
});

const replaceSchema = z.object({ skills: z.array(skillSchema).max(100) });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);
  const skills = await db.userSkill.findMany({ where: { userId: user.id }, include: { skill: true }, orderBy: { position: "asc" } });
  return jsonData({ skills });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);

  const parsed = replaceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("VALIDATION_ERROR", "Check the skill entries.", 400, parsed.error.flatten());

  await db.userSkill.deleteMany({ where: { userId: user.id } });
  for (const [position, entry] of parsed.data.skills.entries()) {
    const normalizedName = entry.name.trim().toLowerCase();
    const skill = await db.skill.upsert({
      where: { normalizedName },
      create: { normalizedName },
      update: {},
    });
    await db.userSkill.create({
      data: {
        userId: user.id,
        skillId: skill.id,
        proficiency: entry.proficiency ?? null,
        years: entry.years ?? null,
        position: entry.position ?? position,
      },
    });
  }

  const skills = await db.userSkill.findMany({ where: { userId: user.id }, include: { skill: true }, orderBy: { position: "asc" } });
  return jsonData({ skills });
}
