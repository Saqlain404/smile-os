"use client";

import { useState } from "react";
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
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  markAsRead,
  markAllAsRead,
  archiveNotification,
  deleteNotification,
} from "@/server/actions/notifications";
import {
  NOTIFICATION_TYPE_COLORS,
  NOTIFICATION_STATUS_COLORS,
} from "@/lib/constants";
import { formatDistanceToNow } from "date-fns";

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  status: string;
  link: string | null;
  createdAt: Date;
}

interface NotificationListProps {
  initialNotifications: NotificationItem[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  onPageChange: (page: number) => void;
  onFilterChange: (filters: { type?: string; status?: string }) => void;
  filters: { type?: string; status?: string };
}

const typeIcons: Record<string, React.ElementType> = {
  EMAIL: Mail,
  SMS: MessageSquare,
  WHATSAPP: Smartphone,
  PUSH: Bell,
  IN_APP: Monitor,
};

export function NotificationList({
  initialNotifications,
  pagination,
  onPageChange,
  onFilterChange,
  filters,
}: NotificationListProps) {
  const [notifications, setNotifications] = useState(initialNotifications);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: "READ" } : n))
    );
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead("current-user");
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, status: "READ" }))
    );
  };

  const handleArchive = async (id: string) => {
    await archiveNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === notifications.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(notifications.map((n) => n.id)));
    }
  };

  const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Select
            value={filters.type ?? "all"}
            onValueChange={(v) =>
              onFilterChange({ ...filters, type: v === "all" ? undefined : (v ?? undefined) })
            }
          >
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="EMAIL">Email</SelectItem>
              <SelectItem value="SMS">SMS</SelectItem>
              <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
              <SelectItem value="PUSH">Push</SelectItem>
              <SelectItem value="IN_APP">In-App</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.status ?? "all"}
            onValueChange={(v) =>
              onFilterChange({ ...filters, status: v === "all" ? undefined : (v ?? undefined) })
            }
          >
            <SelectTrigger className="h-9 w-[140px]">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="UNREAD">Unread</SelectItem>
              <SelectItem value="READ">Read</SelectItem>
              <SelectItem value="ARCHIVED">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5"
              onClick={handleMarkAllRead}
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </Button>
          )}
        </div>
      </div>

      {/* List */}
      <div className="rounded-lg border">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-10 w-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium">No notifications</p>
            <p className="text-xs text-muted-foreground mt-1">
              You&apos;re all caught up!
            </p>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((n) => {
              const Icon = typeIcons[n.type] ?? Bell;
              const isUnread = n.status === "UNREAD";
              const isSelected = selected.has(n.id);

              return (
                <div
                  key={n.id}
                  className={`group flex items-start gap-3 p-4 transition-colors ${
                    isUnread
                      ? "bg-primary/5"
                      : "hover:bg-muted/30"
                  } ${isSelected ? "bg-muted/50" : ""}`}
                >
                  <Checkbox
                    checked={isSelected}
                    onCheckedChange={() => toggleSelect(n.id)}
                    className="mt-1"
                  />
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium leading-tight truncate">
                        {n.title}
                      </p>
                      {isUnread && (
                        <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      )}
                      <Badge
                        variant="secondary"
                        className={`text-[10px] px-1.5 py-0 ${NOTIFICATION_TYPE_COLORS[n.type] ?? ""}`}
                      >
                        {n.type}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">
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
                        className="h-7 w-7"
                        title="Mark as read"
                        onClick={() => handleMarkRead(n.id)}
                      >
                        <Check className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      title="Archive"
                      onClick={() => handleArchive(n.id)}
                    >
                      <Archive className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      title="Delete"
                      onClick={() => handleDelete(n.id)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Showing {(pagination.page - 1) * pagination.pageSize + 1}–
            {Math.min(pagination.page * pagination.pageSize, pagination.total)} of{" "}
            {pagination.total}
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page <= 1}
              onClick={() => onPageChange(pagination.page - 1)}
            >
              Previous
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
              .filter(
                (p) =>
                  p === 1 ||
                  p === pagination.totalPages ||
                  Math.abs(p - pagination.page) <= 1
              )
              .reduce<(number | "...")[]>((acc, p, i, arr) => {
                if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
                acc.push(p);
                return acc;
              }, [])
              .map((p, i) =>
                p === "..." ? (
                  <span key={`dots-${i}`} className="px-1 text-muted-foreground">
                    ...
                  </span>
                ) : (
                  <Button
                    key={p}
                    variant={p === pagination.page ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => onPageChange(p as number)}
                  >
                    {p}
                  </Button>
                )
              )}
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => onPageChange(pagination.page + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
