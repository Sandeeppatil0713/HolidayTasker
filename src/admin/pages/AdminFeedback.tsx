import { useState } from "react";
import { MessageSquare, Star, CheckCircle, Clock, AlertCircle } from "lucide-react";

type Status = "open" | "resolved" | "pending";

interface Ticket {
  id: number;
  user: string;
  email: string;
  subject: string;
  message: string;
  rating?: number;
  status: Status;
  date: string;
  type: "feedback" | "complaint" | "suggestion";
}

const INITIAL: Ticket[] = [
  { id: 1, user: "Alice M",   email: "alice@example.com", subject: "Love the new calendar!",       message: "The smart calendar with holiday detection is amazing. Really helps with planning.",  rating: 5, status: "resolved", date: "Apr 14", type: "feedback" },
  { id: 2, user: "Bob K",     email: "bob@example.com",   subject: "Task sync issue",               message: "Sometimes tasks don't sync properly between devices. Please fix this.",              rating: 2, status: "open",     date: "Apr 13", type: "complaint" },
  { id: 3, user: "Carol T",   email: "carol@example.com", subject: "Add recurring tasks feature",   message: "It would be great to have recurring tasks like weekly or monthly reminders.",        rating: 4, status: "pending",  date: "Apr 12", type: "suggestion" },
  { id: 4, user: "Dave R",    email: "dave@example.com",  subject: "Login page looks great",        message: "The new login page design is clean and modern. Great work!",                        rating: 5, status: "resolved", date: "Apr 11", type: "feedback" },
  { id: 5, user: "Eve S",     email: "eve@example.com",   subject: "Notification not working",      message: "I'm not receiving push notifications even though they're enabled in settings.",      rating: 1, status: "open",     date: "Apr 10", type: "complaint" },
];

const STATUS_STYLES: Record<Status, string> = {
  open:     "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  resolved: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400",
  pending:  "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400",
};

const STATUS_ICONS: Record<Status, React.ElementType> = {
  open: AlertCircle, resolved: CheckCircle, pending: Clock,
};

const TYPE_COLORS: Record<Ticket["type"], string> = {
  feedback:   "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400",
  complaint:  "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400",
  suggestion: "bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400",
};

export default function AdminFeedback() {
  const [tickets, setTickets] = useState<Ticket[]>(INITIAL);
  const [filter, setFilter] = useState<Status | "all">("all");

  const filtered = filter === "all" ? tickets : tickets.filter((t) => t.status === filter);

  const resolve = (id: number) =>
    setTickets((prev) => prev.map((t) => t.id === id ? { ...t, status: "resolved" } : t));

  const counts = {
    all: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    pending: tickets.filter((t) => t.status === "pending").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Feedback & Support</h2>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">User feedback, complaints, and suggestions</p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(["all", "open", "pending", "resolved"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={[
              "px-4 py-1.5 rounded-full text-sm font-semibold transition-all",
              filter === s
                ? "bg-indigo-600 text-white shadow-sm"
                : "bg-white dark:bg-gray-900 text-slate-500 dark:text-gray-400 border border-slate-200 dark:border-gray-700 hover:border-indigo-300",
            ].join(" ")}
          >
            {s.charAt(0).toUpperCase() + s.slice(1)}
            <span className="ml-1.5 text-[11px] opacity-70">({counts[s]})</span>
          </button>
        ))}
      </div>

      {/* Tickets */}
      <div className="space-y-3">
        {filtered.map((t) => {
          const StatusIcon = STATUS_ICONS[t.status];
          return (
            <div key={t.id} className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                    <MessageSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="text-sm font-semibold text-slate-800 dark:text-gray-100">{t.subject}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${TYPE_COLORS[t.type]}`}>
                        {t.type}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-gray-400 mb-2">{t.message}</p>
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="text-xs text-slate-400 dark:text-gray-500">{t.user} · {t.email}</span>
                      <span className="text-xs text-slate-400 dark:text-gray-500">{t.date}</span>
                      {t.rating && (
                        <span className="flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} className={`w-3 h-3 ${i < t.rating! ? "text-amber-400 fill-amber-400" : "text-slate-200 dark:text-gray-700"}`} />
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_STYLES[t.status]}`}>
                    <StatusIcon className="w-2.5 h-2.5" />
                    {t.status}
                  </span>
                  {t.status !== "resolved" && (
                    <button
                      onClick={() => resolve(t.id)}
                      className="text-xs text-indigo-500 hover:text-indigo-700 font-medium transition-colors"
                    >
                      Mark resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
