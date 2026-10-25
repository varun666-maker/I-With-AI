import { z } from "zod";
import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";

export const runtime = "nodejs";

export async function PATCH(
  _request: Request,
  { params }: { params: Promise<{ notificationId: string }> },
) {
  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);

  const notificationId = z.string().uuid().safeParse((await params).notificationId);
  if (!notificationId.success) return jsonError("INVALID_NOTIFICATION_ID", "The notification identifier is invalid.", 400);

  const updated = await db.notification.updateMany({
    where: { id: notificationId.data, userId: user.id },
    data: { readAt: new Date() },
  });
  if (updated.count === 0) return jsonError("NOTIFICATION_NOT_FOUND", "Notification not found.", 404);
  return jsonData({ markedRead: true });
}
