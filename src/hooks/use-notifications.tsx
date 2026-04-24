"use client";
import { useEffect, useState, useCallback } from "react";
import { useAppSelector } from "@/store/hooks";
import { initializeSocket } from "@/lib/socket";
import toast from "react-hot-toast";

export interface INotification {
    _id: string;
    type: "lead_assigned" | "activity_added" | "status_changed" | "general";
    title: string;
    message: string;
    lead_id?: { _id: string; first_name: string; last_name: string } | string;
    triggered_by?: { _id: string; name: string; role: string };
    is_read: boolean;
    createdAt: string;
}

const API = process.env.NEXT_PUBLIC_API_URL;

export function useNotifications() {
    const { user: authUser, token } = useAppSelector((state) => state.auth);
    const [notifications, setNotifications] = useState<INotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    // ── Fetch from REST ──────────────────────────────────────────
    const fetchNotifications = useCallback(async () => {
        if (!authUser?._id) return;
        setIsLoading(true);
        try {
            const res = await fetch(`${API}/api/v1/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const contentType = res.headers.get("content-type");

            if (!contentType?.includes("application/json")) {
                const text = await res.text();
                console.error("Expected JSON, got:", text);
                return;
            }

            const data = await res.json();
            if (data.success) {
                setNotifications(data.data);
                setUnreadCount(data.unreadCount);
            }
        } catch (err) {
            console.error("Failed to fetch notifications", err);
        } finally {
            setIsLoading(false);
        }
    }, [authUser?._id, token]);

    // ── Socket listener ──────────────────────────────────────────
    useEffect(() => {
        if (!authUser?._id) return;

        setInterval(() => {
            fetchNotifications();
        }, 5000);
        const socket = initializeSocket(authUser._id);

        socket.on("notification", (newNotif: INotification) => {
            // State mein add karo
            setNotifications((prev) => [newNotif, ...prev]);
            setUnreadCount((prev) => prev + 1);

            // Toast show karo
            toast(newNotif.message, {
                icon: notifIcon(newNotif.type),
                duration: 5000,
            });
        });

        return () => {
            socket.off("notification");
        };
    }, [authUser?._id, fetchNotifications]);

    // ── Mark single as read ──────────────────────────────────────
    const markAsRead = async (id: string) => {
        try {
            await fetch(`${API}/notifications/${id}/read`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) =>
                prev.map((n) => (n._id === id ? { ...n, is_read: true } : n))
            );
            setUnreadCount((prev) => Math.max(0, prev - 1));
        } catch (err) {
            console.error("Failed to mark as read", err);
        }
    };

    // ── Mark all as read ─────────────────────────────────────────
    const markAllAsRead = async () => {
        try {
            await fetch(`${API}/notifications/read-all`, {
                method: "PATCH",
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error("Failed to mark all as read", err);
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

// ── Helper ───────────────────────────────────────────────────
function notifIcon(type: string) {
    switch (type) {
        case "lead_assigned": return "👤";
        case "activity_added": return "📞";
        case "status_changed": return "🔄";
        default: return "🔔";
    }
}