"use server";

import prisma from "@/lib/prisma";

// ─── Notifications CRUD ────────────────────────────────────────────

export async function getNotifications(params: {
  userId: string;
  search?: string;
  type?: string;
  status?: string;
  page?: number;
  pageSize?: number;
}) {
  const { userId, search, type, status, page = 1, pageSize = 20 } = params;
  const skip = (page - 1) * pageSize;

  const where: Record<string, unknown> = { userId };

  if (type) where.type = type;
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { message: { contains: search, mode: "insensitive" } },
    ];
  }

  const [notifications, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize,
    }),
    prisma.notification.count({ where }),
  ]);

  return {
    data: notifications,
    pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
  };
}

export async function getUnreadCount(userId: string) {
  return prisma.notification.count({
    where: { userId, status: "UNREAD" },
  });
}

export async function getRecentNotifications(userId: string, limit = 8) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function markAsRead(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { status: "READ" },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, status: "UNREAD" },
    data: { status: "READ" },
  });
}

export async function archiveNotification(id: string) {
  return prisma.notification.update({
    where: { id },
    data: { status: "ARCHIVED" },
  });
}

export async function deleteNotification(id: string) {
  return prisma.notification.delete({ where: { id } });
}

export async function createNotification(data: {
  userId: string;
  title: string;
  message: string;
  type?: "EMAIL" | "SMS" | "WHATSAPP" | "PUSH" | "IN_APP";
  link?: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.notification.create({
    data: {
      userId: data.userId,
      title: data.title,
      message: data.message,
      type: data.type ?? "IN_APP",
      link: data.link,
      metadata: data.metadata ? JSON.parse(JSON.stringify(data.metadata)) : undefined,
    },
  });
}

// ─── Notification Stats ────────────────────────────────────────────

export async function getNotificationStats(userId: string) {
  const [total, unread, archived] = await Promise.all([
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, status: "UNREAD" } }),
    prisma.notification.count({ where: { userId, status: "ARCHIVED" } }),
  ]);

  return { total, unread, archived, read: total - unread - archived };
}
