import { useState } from "react";
import { Send, Bell, Users, User, Trash2 } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  message: string;
  target: "all" | "admins" | "users";
  sent: string;
  type: "info" | "warning" | "success";
}

const INITIAL: Announcement[] = [
  { id: 1, title: "Scheduled Maintenance",  message: "The platform will be down for maintenance on Apr 20 from 2–4 AM UTC.", target: "all",    sent: "Apr 14, 2026", type: "warning" },
  { id: 2, title: "New Feature: Smart Calendar", message: "We've launched the new Smart Calendar with holiday detection!", target: "all",    sent: "Apr 12, 2026", type: "success" },
  { id: 3, title: "Admin Policy Update",    message: "Please review the updated admin access policy in Settings.",          target: "admins", sent: "Apr 10, 2026", type: "info" },
];

const TYPE_STYLES = {
  info:    "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-700 text-indigo-700 dark:text-indigo-300",
  warning: "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-700 text-amber-700 dark:text-amber-300",
  success: "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300",
};

export default function AdminNotifications() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL);
  const [form, setForm] = useState({ title: "", message: "", target: "all" as Announcement["target"], type: "info" as Announcement["type"] });
  const [sent, setSent] = useState(false);

  const handleSend = () => {
    if (!form.title || !form.message) return;
    setAnnouncements((prev) => [
      { id: Date.now(), ...form, sent: "Just now" },
      ...prev,
    ]);
    setForm({ title: "", message: "", target: "all", type: "info" });
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Notifications</h2>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">Send announcements and alerts to users</p>
      </div>

      {/* Compose */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-5 space-y-4">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-100 flex items-center gap-2">
          <Bell className="w-4 h-4 text-indigo-500" /> New Announcement
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              placeholder="Announcement title…"
              className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm text-slate-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-400"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">Target</label>
              <select
                value={form.target}
                onChange={(e) => setForm((p) => ({ ...p, target: e.target.value as Announcement["target"] }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm text-slate-800 dark:text-gray-100 outline-none"
              >
                <option value="all">All Users</option>
                <option value="admins">Admins Only</option>
                <option value="users">Users Only</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm((p) => ({ ...p, type: e.target.value as Announcement["type"] }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm text-slate-800 dark:text-gray-100 outline-none"
              >
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="success">Success</option>
              </select>
            </div>
          </div>
        </div>
        <div>
          <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">Message</label>
          <textarea
            value={form.message}
            onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
            rows={3}
            placeholder="Write your announcement…"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm text-slate-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-400 resize-none"
          />
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleSend}
            className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
          >
            <Send className="w-4 h-4" /> Send Announcement
          </button>
          {sent && <span className="text-sm text-emerald-500 font-medium">Sent successfully ✓</span>}
        </div>
      </div>

      {/* History */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-slate-700 dark:text-gray-300">Sent Announcements</h3>
        {announcements.map((a) => (
          <div key={a.id} className={`rounded-2xl border p-4 ${TYPE_STYLES[a.type]}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold">{a.title}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 flex items-center gap-1">
                    {a.target === "all" ? <Users className="w-2.5 h-2.5" /> : <User className="w-2.5 h-2.5" />}
                    {a.target}
                  </span>
                </div>
                <p className="text-xs opacity-80">{a.message}</p>
                <p className="text-[11px] opacity-60 mt-1">{a.sent}</p>
              </div>
              <button
                onClick={() => setAnnouncements((prev) => prev.filter((x) => x.id !== a.id))}
                className="p-1.5 rounded-lg hover:bg-black/10 transition-colors shrink-0"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
