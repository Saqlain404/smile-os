"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Monitor,
  Check,
  CheckCheck,
  Archive,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  getRecentNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  archiveNotification,
} from "@/server/actions/notifications";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  link: string | null;
  createdAt: Date;
}

const typeIcons: Record<string, React.ElementType> = {
  EMAIL: Mail,
  SMS: MessageSquare,
  WHATSAPP: Smartphone,
  PUSH: Bell,
  IN_APP: Monitor,
};

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const [notifs, count] = await Promise.all([
        getRecentNotifications("current-user", 8),
        getUnreadCount("current-user"),
      ]);
      setNotifications(notifs as Notification[]);
      setUnreadCount(count);
    } catch {
      // Silently fail — notifications are non-critical
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30_000);
    return () => clearInterval(interval);
  }, []);

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead("current-user");
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: "READ" }))
    );
    setUnreadCount(0);
  };

  const handleArchive = async (id: string) => {
    await archiveNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setUnreadCount((c) => Math.max(0, c - 1));
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative h-9 w-9"
        onClick={() => {
          setOpen(!open);
          if (!open) fetchNotifications();
        }}
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge
            variant="destructive"
            className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full p-0 text-[9px] flex items-center justify-center"
          >
            {unreadCount > 99 ? "99+" : unreadCount}
          </Badge>
        )}
      </Button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-full z-50 mt-2 w-[380px] rounded-xl border bg-card shadow-xl">
            <div className="flex items-center justify-between p-4 pb-2">
              <h3 className="text-sm font-semibold">Notifications</h3>
              <div className="flex items-center gap-1">
                {unreadCount > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={handleMarkAllRead}
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Mark all read
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    setOpen(false);
                    router.push("/notifications");
                  }}
                >
                  View all
                </Button>
              </div>
            </div>

            <Separator />

            <ScrollArea className="h-[400px]">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                </div>
              ) : notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    You&apos;re all caught up!
                  </p>
                </div>
              ) : (
                <div className="divide-y">
                  {notifications.map((n) => {
                    const Icon = typeIcons[n.type] ?? Bell;
                    const isUnread = n.status === "UNREAD";
                    return (
                      <div
                        key={n.id}
                        className={`group flex items-start gap-3 p-4 transition-colors ${
                          isUnread
                            ? "bg-primary/5"
                            : "hover:bg-muted/50"
                        }`}
                      >
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium leading-tight truncate">
                              {n.title}
                            </p>
                            {isUnread && (
                              <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                          <p className="text-[11px] text-muted-foreground/60 mt-1">
                            {formatDistanceToNow(new Date(n.createdAt), {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <div className="flex shrink-0 gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isUnread && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-6 w-6"
                              onClick={() => handleMarkRead(n.id)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => handleArchive(n.id)}
                          >
                            <Archive className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </ScrollArea>
          </div>
        </>
      )}
    </div>
  );
}
