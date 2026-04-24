"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import { useAppSelector } from "@/store/hooks";
import toast from "react-hot-toast";
import API from "@/utils/api";

export interface INotification {
  _id: string;
  type: "lead_assigned" | "activity_added" | "status_changed" | "general";
  title: string;
  message: string;
  lead_id?: { _id: string; first_name: string; last_name: string };
  triggered_by?: { _id: string; name: string; role: string };
  is_read: boolean;
  createdAt: string;
}

const POLL_INTERVAL = 30_000; // 30 seconds

export function useNotifications() {
  const { user: authUser } = useAppSelector((state) => state.auth);
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Previous unread count track karne ke liye — nayi notifications toast dikhane ke liye
  const prevUnreadRef = useRef<number>(0);
  const isFirstFetch = useRef(true);

  // ── Fetch ────────────────────────────────────────────────────
  const fetchNotifications = useCallback(async () => {
    if (!authUser?._id) return;
    try {
      const res = await API.get("/api/v1/notifications");
      const newNotifs: INotification[] = res.data.data;
      const newUnread: number = res.data.unreadCount;

      setNotifications(newNotifs);
      setUnreadCount(newUnread);

      // Pehli fetch ke baad — nayi notifications pe toast dikhao
      if (!isFirstFetch.current && newUnread > prevUnreadRef.current) {
        const diff = newUnread - prevUnreadRef.current;
        const latest = newNotifs.slice(0, diff);

        latest.forEach((n) => {
          const icons: Record<string, string> = {
            lead_assigned: "👤",
            activity_added: "📞",
            status_changed: "🔄",
            general: "🔔",
          };
          toast(n.message, {
            icon: icons[n.type] || "🔔",
            duration: 5000,
          });
        });
      }

      prevUnreadRef.current = newUnread;
      isFirstFetch.current = false;
    } catch (err) {
      // Silent fail — polling mein errors ignore karo
    }
  }, [authUser?._id]);

  // ── Polling setup ────────────────────────────────────────────
  useEffect(() => {
    if (!authUser?._id) return;

    // Pehli baar turant fetch karo
    setIsLoading(true);
    fetchNotifications().finally(() => setIsLoading(false));

    // Phir har 30s pe
    const interval = setInterval(fetchNotifications, POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [authUser?._id, fetchNotifications]);

  // ── Mark single as read ──────────────────────────────────────
  const markAsRead = async (id: string) => {
    try {
      await API.patch(`/api/v1/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, is_read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      prevUnreadRef.current = Math.max(0, prevUnreadRef.current - 1);
    } catch (err) {
      console.error(err);
    }
  };

  // ── Mark all as read ─────────────────────────────────────────
  const markAllAsRead = async () => {
    try {
      await API.patch("/api/v1/notifications/read-all");
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
      setUnreadCount(0);
      prevUnreadRef.current = 0;
    } catch (err) {
      console.error(err);
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
}