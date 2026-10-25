import { z } from "zod";
import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";

export const runtime = "nodejs";

const profileSchema = z.object({
  targetRole: z.string().trim().max(120).nullable().optional(),
  phone: z.string().trim().max(40).nullable().optional(),
  dateOfBirth: z.string().date().nullable().optional(),
  city: z.string().trim().max(120).nullable().optional(),
  linkedinUrl: z.string().url().max(400).nullable().optional(),
  githubUrl: z.string().url().max(400).nullable().optional(),
  portfolioUrl: z.string().url().max(400).nullable().optional(),
  bio: z.string().trim().max(2000).nullable().optional(),
  experienceLevel: z.string().trim().max(80).nullable().optional(),
  expectedSalary: z.string().trim().max(120).nullable().optional(),
  noticePeriod: z.string().trim().max(80).nullable().optional(),
  remotePreference: z.string().trim().max(80).nullable().optional(),
  shiftPreference: z.string().trim().max(80).nullable().optional(),
  preferredRoles: z.array(z.string().trim().min(1).max(120)).max(20).optional(),
  preferredLocations: z.array(z.string().trim().min(1).max(120)).max(20).optional(),
});

function calculateCompleteness(profile: Record<string, unknown>) {
  const fields = [
    "targetRole",
    "phone",
    "city",
    "linkedinUrl",
    "githubUrl",
    "bio",
    "experienceLevel",
    "remotePreference",
  ];
  return Math.round((fields.filter((field) => Boolean(profile[field])).length / fields.length) * 100);
}

async function getProfile(userId: string) {
  return db.profile.findUnique({
    where: { userId },
    include: {
      user: { select: { id: true, displayName: true, emailNormalized: true } },
    },
  });
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);
  const profile = await getProfile(user.id);
  return jsonData({ profile });
}

export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);

  const parsed = profileSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError("VALIDATION_ERROR", "Check the profile fields.", 400, parsed.error.flatten());

  const data = parsed.data;
  const normalizedData = {
    ...data,
    dateOfBirth: data.dateOfBirth ? new Date(`${data.dateOfBirth}T00:00:00.000Z`) : data.dateOfBirth,
  };
  const completeness = calculateCompleteness(data);
  const profile = await db.profile.upsert({
    where: { userId: user.id },
    create: { userId: user.id, ...normalizedData, completenessPercent: completeness },
    update: { ...normalizedData, completenessPercent: completeness },
    include: { user: { select: { id: true, displayName: true, emailNormalized: true } } },
  });

  return jsonData({ profile });
}
