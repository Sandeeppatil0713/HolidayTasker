import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bell, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  title: string;
  description: string;
  type: "overdue" | "warning" | "incomplete";
  read: boolean;
}

function buildNotifications(tasks: any[]): Notification[] {
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
        // Overdue
        notifications.push({
          id: `overdue-${task.id}`,
          title: "Overdue Task",
          description: `"${task.title}" was due ${Math.abs(diffDays)} day${Math.abs(diffDays) > 1 ? "s" : ""} ago`,
          type: "overdue",
          read: false,
        });
      } else if (diffDays <= 2) {
        // Due soon
        notifications.push({
          id: `warning-${task.id}`,
          title: diffDays === 0 ? "Due Today" : `Due in ${diffDays} day${diffDays > 1 ? "s" : ""}`,
          description: `"${task.title}" is due ${diffDays === 0 ? "today" : `in ${diffDays} day${diffDays > 1 ? "s" : ""}`}`,
          type: "warning",
          read: false,
        });
      }
    } else {
      // No due date — incomplete task reminder
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

const TYPE_STYLES = {
  overdue:    { icon: AlertTriangle, dot: "bg-red-500",    bg: "bg-red-50/40 dark:bg-red-900/10" },
  warning:    { icon: Clock,         dot: "bg-yellow-500", bg: "bg-yellow-50/40 dark:bg-yellow-900/10" },
  incomplete: { icon: CheckCircle2,  dot: "bg-blue-400",   bg: "" },
};

export function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [shake, setShake] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Fetch tasks and build notifications
  useEffect(() => {
    if (!user) return;
    supabase
      .from("tasks")
      .select("id, title, done, due_date")
      .eq("user_id", user.id)
      .eq("done", false)
      .then(({ data }) => {
        if (data) {
          const built = buildNotifications(data);
          setNotifications(built);
          if (built.length > 0) {
            setShake(true);
            setTimeout(() => setShake(false), 600);
          }
        }
      });
  }, [user]);

  const unread = notifications.filter((n) => !readIds.has(n.id));
  const unreadCount = unread.length;

  const updatePos = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
  };

  const handleOpen = () => { updatePos(); setOpen((v) => !v); };

  const markAllRead = () => setReadIds(new Set(notifications.map((n) => n.id)));

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const displayed = notifications.map((n) => ({ ...n, read: readIds.has(n.id) }));

  const dropdown = open && createPortal(
    <div
      style={{ top: dropdownPos.top, right: dropdownPos.right }}
      className="fixed w-[320px] z-[9999] rounded-2xl border border-white/20 dark:border-gray-700/50 shadow-[0_8px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl bg-white/95 dark:bg-gray-900/95"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/60 dark:border-gray-700/60">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</span>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="text-xs text-primary hover:underline font-medium transition-colors">
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
            const { icon: Icon, dot, bg } = TYPE_STYLES[n.type];
            return (
              <li
                key={n.id}
                onClick={() => setReadIds((prev) => new Set([...prev, n.id]))}
                className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-gray-50/80 dark:hover:bg-gray-800/60 ${!n.read ? bg : ""}`}
              >
                <span className="mt-1 shrink-0">
                  <span className={`block w-2 h-2 rounded-full ${n.read ? "bg-gray-300 dark:bg-gray-600" : dot}`} />
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <Icon className={`h-3.5 w-3.5 shrink-0 ${n.read ? "text-gray-400" : n.type === "overdue" ? "text-red-500" : n.type === "warning" ? "text-yellow-500" : "text-blue-400"}`} />
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{n.title}</p>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">{n.description}</p>
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
          <span className="text-xs text-gray-400">{displayed.filter(n => n.type === "overdue").length} overdue</span>
        </div>
      )}
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
    </div>
  );
}
