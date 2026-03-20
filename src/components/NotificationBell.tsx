import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Bell } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const MOCK_NOTIFICATIONS: Notification[] = [
  { id: 1, title: "New user registered", description: "A new user joined your workspace.", time: "2 min ago", read: false },
  { id: 2, title: "Task completed", description: "\"Q2 Report\" was marked as done.", time: "15 min ago", read: false },
  { id: 3, title: "Vacation approved", description: "Your leave request was approved.", time: "1 hr ago", read: false },
  { id: 4, title: "Calendar reminder", description: "Team standup in 30 minutes.", time: "3 hr ago", read: true },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [shake, setShake] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const updatePos = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  };

  const handleOpen = () => {
    updatePos();
    setOpen((v) => !v);
  };

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Shake animation on mount if there are unread
  useEffect(() => {
    if (unreadCount > 0) {
      setShake(true);
      const t = setTimeout(() => setShake(false), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const markAllRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const dropdown = open && createPortal(
    <div
      style={{ top: dropdownPos.top, right: dropdownPos.right }}
      className={[
        "fixed w-[300px] z-[9999]",
        "rounded-2xl",
        "border border-white/20 dark:border-gray-700/50",
        "shadow-[0_8px_32px_rgba(0,0,0,0.18)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
        "backdrop-blur-xl bg-white/95 dark:bg-gray-900/95",
        "animate-dropdown",
      ].join(" ")}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100/60 dark:border-gray-700/60">
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Notifications
        </span>
        {unreadCount > 0 && (
          <button
            onClick={markAllRead}
            className="text-xs text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 font-medium transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      {/* Items */}
      <ul className="max-h-[280px] overflow-y-auto divide-y divide-gray-100/60 dark:divide-gray-700/60">
        {notifications.map((n) => (
          <li
            key={n.id}
            className={[
              "flex gap-3 px-4 py-3 cursor-pointer transition-colors duration-150",
              "hover:bg-gray-50/80 dark:hover:bg-gray-800/60",
              !n.read ? "bg-indigo-50/40 dark:bg-indigo-900/10" : "",
            ].join(" ")}
          >
            <span className="mt-1.5 shrink-0">
              <span className={`block w-2 h-2 rounded-full ${n.read ? "bg-gray-300 dark:bg-gray-600" : "bg-indigo-500"}`} />
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{n.title}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">{n.description}</p>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-1">{n.time}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* Footer */}
      <div className="px-4 py-2.5 border-t border-gray-100/60 dark:border-gray-700/60 text-center">
        <button className="text-sm font-medium text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 px-3 py-1 rounded-lg transition-colors duration-150">
          View All
        </button>
      </div>
    </div>,
    document.body
  );

  return (
    <div ref={ref} className="relative">
      {/* Bell Button */}
      <button
        ref={buttonRef}
        onClick={handleOpen}
        aria-label="Notifications"
        className={[
          "relative flex items-center justify-center w-10 h-10 rounded-full",
          "bg-white dark:bg-gray-800",
          "shadow-[0_4px_12px_rgba(0,0,0,0.08)] dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]",
          "border border-gray-100 dark:border-gray-700",
          "cursor-pointer transition-all duration-200 ease-in-out",
          "hover:scale-105 hover:shadow-[0_6px_20px_rgba(0,0,0,0.14)]",
          shake ? "animate-bell-shake" : "",
        ].join(" ")}
      >
        <Bell className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-bold leading-none border-2 border-white dark:border-gray-800">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {dropdown}
    </div>
  );
}
