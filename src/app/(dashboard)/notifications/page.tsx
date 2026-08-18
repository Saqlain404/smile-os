"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Bell, CheckCheck, Archive } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { NotificationList } from "@/components/notifications/notification-list";
import {
  getNotifications,
  getNotificationStats,
  markAllAsRead,
} from "@/server/actions/notifications";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

const DEMO_USER_ID = "current-user";

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<
    { id: string; title: string; message: string; type: string; status: string; link: string | null; createdAt: Date }[]
  >([]);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    total: 0,
    totalPages: 0,
  });
  const [stats, setStats] = useState({ total: 0, unread: 0, read: 0, archived: 0 });
  const [filters, setFilters] = useState<{ type?: string; status?: string }>({});
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const [notifs, notifStats] = await Promise.all([
        getNotifications({
          userId: DEMO_USER_ID,
          page,
          pageSize: 20,
          ...filters,
        }),
        getNotificationStats(DEMO_USER_ID),
      ]);
      setNotifications(notifs.data as typeof notifications);
      setPagination(notifs.pagination);
      setStats(notifStats);
    } catch {
      // Demo mode — use empty data
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchData(1);
  }, [fetchData]);

  const handlePageChange = (page: number) => {
    fetchData(page);
  };

  const handleFilterChange = (newFilters: { type?: string; status?: string }) => {
    setFilters(newFilters);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead(DEMO_USER_ID);
    fetchData(pagination.page);
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      <motion.div variants={item}>
        <PageHeader
          title="Notifications"
          description="View and manage all notifications."
          actions={
            stats.unread > 0 ? (
              <Button variant="outline" className="gap-1.5" onClick={handleMarkAllRead}>
                <CheckCheck className="h-4 w-4" />
                Mark all read
              </Button>
            ) : undefined
          }
        />
      </motion.div>

      {/* Stats */}
      <motion.div variants={item}>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <Bell className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.total}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 dark:bg-blue-900/20">
                  <Bell className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.unread}</p>
                  <p className="text-xs text-muted-foreground">Unread</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 dark:bg-green-900/20">
                  <CheckCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.read}</p>
                  <p className="text-xs text-muted-foreground">Read</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted">
                  <Archive className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats.archived}</p>
                  <p className="text-xs text-muted-foreground">Archived</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      {/* Notification List */}
      <motion.div variants={item}>
        {loading && notifications.length === 0 ? (
          <Card>
            <CardContent className="flex items-center justify-center py-16">
              <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </CardContent>
          </Card>
        ) : (
          <NotificationList
            initialNotifications={notifications}
            pagination={pagination}
            onPageChange={handlePageChange}
            onFilterChange={handleFilterChange}
            filters={filters}
          />
        )}
      </motion.div>
    </motion.div>
  );
}
