import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";
import { rejectUntrustedOrigin } from "@/lib/server/request-security";
import { startAptitudeAttempt } from "@/lib/server/aptitude";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const originError = rejectUntrustedOrigin(request);
  if (originError) return originError;

  try {
    let user = await getCurrentUser();
    if (!user) {
      const fallback = await db.user.findFirst({
        where: { status: "ACTIVE" },
        orderBy: { createdAt: "asc" },
      });
      if (fallback) {
        user = fallback;
      } else {
        return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);
      }
    }

    const result = await startAptitudeAttempt(user.id);
    return jsonData(result, 201);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("aptitude.start_failed", error);
    return jsonError("APTITUDE_START_FAILED", `Failed to initialize aptitude test: ${message}`, 500);
  }
}

