import type { Prisma, PrismaClient } from "@prisma/client";

type DatabaseClient = PrismaClient | Prisma.TransactionClient;

export type InAppNotificationPayload = {
  title: string;
  message: string;
  href?: string;
  screen?: string;
  resumeId?: string;
};

export async function createInAppNotification(
  client: DatabaseClient,
  input: {
    userId: string;
    type: string;
    payload: InAppNotificationPayload;
  },
) {
  return client.notification.create({
    data: {
      userId: input.userId,
      type: input.type,
      payload: input.payload,
      deliveryStatus: "delivered",
    },
  });
}

export function serializeNotification(notification: {
  id: string;
  type: string;
  payload: Prisma.JsonValue;
  readAt: Date | null;
  createdAt: Date;
}) {
  return {
    id: notification.id,
    type: notification.type,
    payload: notification.payload,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
  };
}
