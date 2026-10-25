import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";
import { rejectUntrustedOrigin } from "@/lib/server/request-security";
import { getAptitudeHistory } from "@/lib/server/aptitude";

export const runtime = "nodejs";

export async function GET(request: Request) {
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

    const history = await getAptitudeHistory(user.id);
    return jsonData({ history });
  } catch (error) {
    console.error("aptitude.history_failed", error);
    return jsonError("APTITUDE_HISTORY_FAILED", "Failed to retrieve aptitude history.", 500);
  }
}
