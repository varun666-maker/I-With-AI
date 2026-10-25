import { db } from "@/lib/db";
import { jsonData, jsonError } from "@/lib/server/api";
import { getCurrentUser } from "@/lib/server/auth";
import { serializeNotification } from "@/lib/server/notifications";

export const runtime = "nodejs";

function limitFrom(request: Request) {
  const value = Number(new URL(request.url).searchParams.get("limit") ?? 20);
  return Number.isInteger(value) && value >= 1 && value <= 50 ? value : 20;
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);

  const notifications = await db.notification.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: limitFrom(request),
    select: { id: true, type: true, payload: true, readAt: true, createdAt: true },
  });
  const unreadCount = await db.notification.count({ where: { userId: user.id, readAt: null } });

  return jsonData({
    notifications: notifications.map(serializeNotification),
    unreadCount,
  });
}

export async function POST() {
  const user = await getCurrentUser();
  if (!user) return jsonError("UNAUTHENTICATED", "Sign in to continue.", 401);

  await db.notification.updateMany({
    where: { userId: user.id, readAt: null },
    data: { readAt: new Date() },
  });
  return jsonData({ markedRead: true });
}
