import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Bell, AlertTriangle, Clock, CheckCircle2, Info, X } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: "overdue" | "warning" | "incomplete" | "info" | "success" | "alert";
  read: boolean;
}

// ── Task-derived notifications ──────────────────────────────────────────────
function buildTaskNotifications(tasks: any[]): Notification[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const notifications: Notification[] = [];

  tasks.forEach((task) => {
    if (task.done) return;

    if (task.due_date) {
      const due = new Date(task.due_date);
      due.setHours(0, 0, 0, 0);
      const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        notifications.push({
          id: `overdue-${task.id}`,
          title: "Overdue Task",
          description: `"${task.title}" was due ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} ago`,
          type: "overdue",
          read: false,
        });
      } else if (diffDays <= 2) {
        notifications.push({
          id: `warning-${task.id}`,
          title: diffDays === 0 ? "Due Today" : `Due in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
          description: `"${task.title}" is due ${diffDays === 0 ? "today" : `in ${diffDays} day${diffDays > 1 ? "s" : ""}`}`,
          type: "warning",
          read: false,
        });
      }
    } else {
      notifications.push({
        id: `incomplete-${task.id}`,
        title: "Incomplete Task",
        description: `"${task.title}" is still pending`,
        type: "incomplete",
        read: false,
      });
    }
  });

  return notifications;
}

// ── Style map ────────────────────────────────────────────────────────────────
const TYPE_STYLES: Record<string, { icon: React.ElementType; dot: string; bg: string; iconColor: string }> = {
  overdue:    { icon: AlertTriangle, dot: "bg-red-500",     bg: "bg-red-50/40 dark:bg-red-900/10",       iconColor: "text-red-500" },
  warning:    { icon: Clock,         dot: "bg-yellow-500",  bg: "bg-yellow-50/40 dark:bg-yellow-900/10", iconColor: "text-yellow-500" },
  incomplete: { icon: CheckCircle2,  dot: "bg-blue-400",    bg: "",                                      iconColor: "text-blue-400" },
  info:       { icon: Info,          dot: "bg-blue-400",    bg: "bg-blue-50/40 dark:bg-blue-900/10",     iconColor: "text-blue-400" },
  success:    { icon: CheckCircle2,  dot: "bg-emerald-500", bg: "bg-emerald-50/40 dark:bg-emerald-900/10", iconColor: "text-emerald-500" },
  alert:      { icon: AlertTriangle, dot: "bg-red-500",     bg: "bg-red-50/40 dark:bg-red-900/10",       iconColor: "text-red-500" },
};

const READ_STORAGE_KEY    = "notif_read_ids";
const CLEARED_STORAGE_KEY = "notif_cleared_ids";

function loadReadIds(): Set<string> {
  try {
    const raw = localStorage.getItem(READ_STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function persistReadIds(ids: Set<string>) {
  try {
    localStorage.setItem(READ_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {}
}

function loadClearedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(CLEARED_STORAGE_KEY);
    if (raw) return new Set(JSON.parse(raw));
  } catch {}
  return new Set();
}

function persistClearedIds(ids: Set<string>) {
  try {
    localStorage.setItem(CLEARED_STORAGE_KEY, JSON.stringify([...ids]));
  } catch {}
}

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(loadReadIds);
  const [shake, setShake] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [selectedNotif, setSelectedNotif] = useState<Notification | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // ── Load tasks only (announcements go to email, not bell) ────────────────
  const loadNotifications = useCallback(async () => {
    if (!user) return;

    const { data: tasks } = await supabase
      .from("tasks")
      .select("id, title, done, due_date")
      .eq("user_id", user.id)
      .eq("done", false);

    const taskNotifs = buildTaskNotifications(tasks ?? []);

    // Filter out any notifications the user has already cleared
    const clearedIds = loadClearedIds();
    const filtered = taskNotifs.filter((n) => !clearedIds.has(n.id));

    setNotifications(filtered);

    // Shake bell if there are new unread items
    const currentReadIds = loadReadIds();
    const hasNew = filtered.some((n) => !currentReadIds.has(n.id));
    if (hasNew) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  }, [user]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  // ── Derived state ──────────────────────────────────────────────────────────
  const displayed     = notifications.map((n) => ({ ...n, read: readIds.has(n.id) }));
  const unreadCount   = displayed.filter((n) => !n.read).length;

  // ── Handlers ──────────────────────────────────────────────────────────────
  const updatePos = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  };

  const handleOpen = () => { updatePos(); setOpen((v) => !v); };

  const markAllRead = () => {
    const allIds = new Set(notifications.map((n) => n.id));
    setReadIds(allIds);
    persistReadIds(allIds);
  };

  const clearAll = () => {
    // Only remove read notifications — keep unread ones
    const readNotifIds = notifications.filter((n) => readIds.has(n.id)).map((n) => n.id);

    // Persist cleared IDs so they stay gone after refresh
    const existing = loadClearedIds();
    const updated  = new Set([...existing, ...readNotifIds]);
    persistClearedIds(updated);

    // Remove read ones from current state
    setNotifications((prev) => prev.filter((n) => !readIds.has(n.id)));
  };

  const markOneRead = (id: string) => {
    setReadIds((prev) => {
      const next = new Set([...prev, id]);
      persistReadIds(next);
      return next;
    });
  };

  // Close on outside click — ignore clicks inside the portal dropdown too
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const insideBell     = ref.current?.contains(target);
      const insideDropdown = dropdownRef.current?.contains(target);
      if (!insideBell && !insideDropdown) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // ── Dropdown ──────────────────────────────────────────────────────────────
  const dropdown = open && createPortal(
    <div
      ref={dropdownRef}
      style={{ top: dropdownPos.top, right: dropdownPos.right }}
      className="fixed w-[320px] z-[9999] rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl bg-white/95 dark:bg-gray-900/95"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/60 dark:border-gray-700/60">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Notifications
          {unreadCount > 0 && (
            <span className="ml-2 text-xs font-normal text-muted-foreground">{unreadCount} unread</span>
          )}
        </span>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-primary hover:underline font-medium transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Items */}
      <ul className="max-h-[320px] overflow-y-auto divide-y divide-gray-100/60 dark:divide-gray-700/60">
        {displayed.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
            All caught up! No pending alerts.
          </li>
        ) : (
          displayed.map((n) => {
            const style = TYPE_STYLES[n.type] ?? TYPE_STYLES.info;
            const { icon: Icon, dot, bg, iconColor } = style;
            return (
              <li
                key={n.id}
                onClick={() => {
                  markOneRead(n.id);
                  setSelectedNotif({ ...n, read: true });
                }}
                className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/60 ${!n.read ? bg : ""}`}
              >
                <span className="mt-1 shrink-0">
                  <span className={`block w-2 h-2 rounded-full ${n.read ? "bg-gray-300 dark:bg-gray-600" : dot}`} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${n.read ? "text-gray-400" : iconColor}`} />
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{n.title}</p>
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 italic">Tap to read</p>
                </div>
              </li>
            );
          })
        )}
      </ul>

      {/* Footer */}
      {displayed.length > 0 && (
        <div className="px-4 py-2.5 border-t border-gray-100/60 dark:border-gray-700/60 flex justify-between items-center">
          <span className="text-xs text-gray-400">{unreadCount} unread</span>
          <button
            onClick={clearAll}
            className="text-xs text-red-400 hover:text-red-500 hover:underline font-medium transition-colors"
          >
            Clear all
          </button>
        </div>
      )}
    </div>,
    document.body
  );

  // ── Detail modal ─────────────────────────────────────────────────────────
  const detailModal = selectedNotif && createPortal(
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
      onClick={() => setSelectedNotif(null)}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal box */}
      <div
        className="relative w-full max-w-sm rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-[0_24px_64px_rgba(0,0,0,0.25)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.6)] bg-white dark:bg-gray-900 p-6 animate-dropdown"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={() => setSelectedNotif(null)}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Icon + type badge */}
        {(() => {
          const style = TYPE_STYLES[selectedNotif.type] ?? TYPE_STYLES.info;
          const { icon: Icon, bg, iconColor, dot } = style;
          return (
            <>
              <div className={`inline-flex items-center justify-center h-10 w-10 rounded-xl mb-4 ${bg || "bg-gray-100 dark:bg-gray-800"}`}>
                <Icon className={`h-5 w-5 ${iconColor}`} />
              </div>
              <div className="flex items-center gap-2 mb-1">
                <span className={`inline-block w-2 h-2 rounded-full ${dot}`} />
                <span className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wide">
                  {selectedNotif.type}
                </span>
              </div>
            </>
          );
        })()}

        {/* Title */}
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3 leading-snug">
          {selectedNotif.title}
        </h3>

        {/* Full message */}
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
          {selectedNotif.description}
        </p>

        {/* Dismiss button */}
        <button
          onClick={() => setSelectedNotif(null)}
          className="mt-5 w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Dismiss
        </button>
      </div>
    </div>,
    document.body
  );

  return (
    <div ref={ref} className="relative">
      <button
        ref={buttonRef}
        onClick={handleOpen}
        aria-label="Notifications"
        className={[
          "relative flex items-center justify-center w-10 h-10 rounded-full",
          "bg-white dark:bg-gray-800",
          "shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
          "border border-gray-100 dark:border-gray-700",
          "cursor-pointer transition-all duration-200 hover:scale-105",
          shake ? "animate-bell-shake" : "",
        ].join(" ")}
      >
        <Bell className={`w-5 h-5 ${unreadCount > 0 ? "text-primary" : "text-gray-500 dark:text-gray-400"}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold border-2 border-white dark:border-gray-800">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>
      {dropdown}
      {detailModal}
    </div>
  );
}
