import { z } from "zod";
import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";

export const runtime = "nodejs";

const educationSchema = z.object({
  degree: z.string().trim().min(1).max(120),
  institution: z.string().trim().min(1).max(200),
  field: z.string().trim().max(160).nullable().optional(),
  graduationYear: z.number().int().min(1900).max(2200).nullable().optional(),
  position: z.number().int().min(0).max(99).optional(),
});

const replaceSchema = z.object({ entries: z.array(educationSchema).max(20) });

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);
  const entries = await db.education.findMany({ where: { userId: user.id }, orderBy: { position: "asc" } });
  return jsonData({ entries });
}

export async function PUT(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);

  const parsed = replaceSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("VALIDATION_ERROR", "Check the education entries.", 400, parsed.error.flatten());

  await db.education.deleteMany({ where: { userId: user.id } });
  if (parsed.data.entries.length > 0) {
    await db.education.createMany({
      data: parsed.data.entries.map((entry, position) => ({
        userId: user.id,
        degree: entry.degree,
        institution: entry.institution,
        field: entry.field ?? null,
        graduationYear: entry.graduationYear ?? null,
        position: entry.position ?? position,
      })),
    });
  }

  const entries = await db.education.findMany({ where: { userId: user.id }, orderBy: { position: "asc" } });
  return jsonData({ entries });
}
