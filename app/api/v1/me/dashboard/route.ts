import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser, publicUser } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);

  const [profile, resumeCount, aptitudeCount, codingCount, interviewCount, latestInterview] = await Promise.all([
    db.profile.findUnique({ where: { userId: user.id } }),
    db.resume.count({ where: { ownerUserId: user.id, deletedAt: null } }),
    db.assessmentAttempt.count({ where: { userId: user.id, mode: "PREP", roundType: "APTITUDE" } }),
    db.assessmentAttempt.count({ where: { userId: user.id, mode: "PREP", roundType: "CODING" } }),
    db.interviewSession.count({ where: { userId: user.id, mode: "PREP" } }),
    db.interviewSession.findFirst({ where: { userId: user.id, mode: "PREP" }, orderBy: { createdAt: "desc" }, select: { id: true, status: true, completedAt: true, createdAt: true } }),
  ]);

  return jsonData({
    user: publicUser(user),
    profile: {
      completenessPercent: profile?.completenessPercent ?? 0,
      targetRole: profile?.targetRole ?? null,
    },
    activity: {
      resumeCount,
      aptitudeAttemptCount: aptitudeCount,
      codingAttemptCount: codingCount,
      interviewCount,
      latestInterview,
    },
  });
}
