import { describe, it, expect, vi, beforeEach } from "vitest";
import { mockPrisma } from "../../__mocks__/prisma";

vi.mock("@/lib/prisma", () => ({
  default: mockPrisma,
  prisma: mockPrisma,
}));

import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  createNotification,
  getNotificationStats,
} from "@/server/actions/notifications";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("getNotifications", () => {
  it("should return paginated notifications", async () => {
    const mockNotifications = [
      { id: "n1", title: "Test", status: "UNREAD" },
    ];
    mockPrisma.notification.findMany.mockResolvedValue(mockNotifications);
    mockPrisma.notification.count.mockResolvedValue(1);

    const result = await getNotifications({
      userId: "user-1",
      page: 1,
      pageSize: 20,
    });

    expect(result.data).toEqual(mockNotifications);
    expect(result.pagination.total).toBe(1);
  });

  it("should filter by type", async () => {
    mockPrisma.notification.findMany.mockResolvedValue([]);
    mockPrisma.notification.count.mockResolvedValue(0);

    await getNotifications({ userId: "user-1", type: "EMAIL" });

    expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ type: "EMAIL" }),
      })
    );
  });

  it("should filter by status", async () => {
    mockPrisma.notification.findMany.mockResolvedValue([]);
    mockPrisma.notification.count.mockResolvedValue(0);

    await getNotifications({ userId: "user-1", status: "UNREAD" });

    expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({ status: "UNREAD" }),
      })
    );
  });
});

describe("getUnreadCount", () => {
  it("should return unread count", async () => {
    mockPrisma.notification.count.mockResolvedValue(5);

    const result = await getUnreadCount("user-1");

    expect(result).toBe(5);
    expect(mockPrisma.notification.count).toHaveBeenCalledWith({
      where: { userId: "user-1", status: "UNREAD" },
    });
  });
});

describe("markAsRead", () => {
  it("should mark notification as read", async () => {
    mockPrisma.notification.update.mockResolvedValue({
      id: "n1",
      status: "READ",
    });

    await markAsRead("n1");

    expect(mockPrisma.notification.update).toHaveBeenCalledWith({
      where: { id: "n1" },
      data: { status: "READ" },
    });
  });
});

describe("markAllAsRead", () => {
  it("should mark all user notifications as read", async () => {
    mockPrisma.notification.updateMany.mockResolvedValue({ count: 5 });

    await markAllAsRead("user-1");

    expect(mockPrisma.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: "user-1", status: "UNREAD" },
      data: { status: "READ" },
    });
  });
});

describe("createNotification", () => {
  it("should create notification", async () => {
    mockPrisma.notification.create.mockResolvedValue({
      id: "n1",
      title: "Test Notification",
    });

    const result = await createNotification({
      userId: "user-1",
      title: "Test Notification",
      message: "This is a test",
      type: "IN_APP",
    });

    expect(result.title).toBe("Test Notification");
  });
});

describe("getNotificationStats", () => {
  it("should return notification stats", async () => {
    mockPrisma.notification.count
      .mockResolvedValueOnce(20)  // total
      .mockResolvedValueOnce(5)   // unread
      .mockResolvedValueOnce(3);  // archived

    const result = await getNotificationStats("user-1");

    expect(result.total).toBe(20);
    expect(result.unread).toBe(5);
    expect(result.archived).toBe(3);
    expect(result.read).toBe(12); // total - unread - archived
  });
});
