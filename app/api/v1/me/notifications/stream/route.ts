import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/server/auth";
import { serializeNotification } from "@/lib/server/notifications";

export const runtime = "nodejs";

const encoder = new TextEncoder();

function event(name: string, data: unknown) {
  return encoder.encode(`event: ${name}\ndata: ${JSON.stringify(data)}\n\n`);
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user) return new Response("Unauthorized", { status: 401 });

  let closed = false;
  let timer: ReturnType<typeof setInterval> | undefined;
  let lastCreatedAt = new Date();
  let streamController: ReadableStreamDefaultController<Uint8Array> | undefined;

  const close = () => {
    closed = true;
    if (timer) clearInterval(timer);
    try {
      streamController?.close();
    } catch {
      // The client may have already closed the stream.
    }
  };

  request.signal.addEventListener("abort", close, { once: true });

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      streamController = controller;
      lastCreatedAt = new Date();
      controller.enqueue(encoder.encode(": connected\n\n"));

      const sendNewNotifications = async () => {
        if (closed) return;
        try {
          const notifications = await db.notification.findMany({
            where: { userId: user.id, createdAt: { gt: lastCreatedAt } },
            orderBy: { createdAt: "asc" },
            take: 50,
            select: { id: true, type: true, payload: true, readAt: true, createdAt: true },
          });
          for (const notification of notifications) {
            lastCreatedAt = notification.createdAt;
            controller.enqueue(event("notification", serializeNotification(notification)));
          }
        } catch (error) {
          console.error("notifications.stream.poll_failed", error);
          controller.enqueue(event("error", { message: "Notification updates are temporarily unavailable." }));
        }
      };

      await sendNewNotifications();
      timer = setInterval(() => void sendNewNotifications(), 5_000);
    },
    cancel() {
      close();
    },
  });

  return new Response(stream, {
    headers: {
      "cache-control": "no-cache, no-transform",
      connection: "keep-alive",
      "content-type": "text/event-stream; charset=utf-8",
      "x-accel-buffering": "no",
    },
  });
}
