import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line,
} from "recharts";
import { CheckCircle2, Clock, TrendingUp, Flag, ListTodo, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { tasksService, type Task } from "@/services/tasksService";

/* ── helpers ── */
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const CAT_COLORS: Record<string, string> = {
  Work:     "#0ea5e9",
  Personal: "#2dd4bf",
  Travel:   "#f97316",
  Urgent:   "#6366f1",
};
const PRIORITY_COLORS: Record<string, string> = {
  High:   "#ef4444",
  Medium: "#f97316",
  Low:    "#22c55e",
};

/* ── All date helpers use LOCAL timezone ── */

// Get local YYYY-MM-DD string from any Date or ISO string
function localDateStr(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-CA"); // returns YYYY-MM-DD in local tz
}

// Get local YYYY-MM-DD for today
function todayLocal(): string {
  return localDateStr(new Date());
}

function getWeekRange() {
  const now = new Date();
  const day = now.getDay(); // 0=Sun
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  monday.setHours(0, 0, 0, 0);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);
  return { monday, sunday };
}

function buildWeeklyData(tasks: Task[]) {
  const { monday } = getWeekRange();
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  return days.map((d, i) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + i);
    const dateStr = localDateStr(date); // local date e.g. "2026-04-16"

    // Completed: match completed_at in user's LOCAL date
    const completed = tasks.filter(t =>
      t.done && t.completed_at && localDateStr(t.completed_at) === dateStr
    ).length;

    // Pending: tasks due on this local date
    const pending = tasks.filter(t =>
      !t.done && t.due_date === dateStr
    ).length;

    return { day: d, completed, pending };
  });
}

function buildDailyTrend(tasks: Task[]) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = localDateStr(d);

    // Tasks due on this local date OR completed on this local date
    const dayTasks = tasks.filter(t =>
      t.due_date === dateStr ||
      (t.completed_at && localDateStr(t.completed_at) === dateStr)
    );
    const total = dayTasks.length;
    const done  = dayTasks.filter(t => t.done).length;
    return {
      day: DAYS[d.getDay()],
      rate: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  });
}

function buildCategoryData(tasks: Task[]) {
  const counts: Record<string, number> = {};
  tasks.forEach(t => { counts[t.category] = (counts[t.category] || 0) + 1; });
  return Object.entries(counts).map(([name, value]) => ({
    name, value, color: CAT_COLORS[name] || "#94a3b8",
  }));
}

function buildPriorityData(tasks: Task[]) {
  const counts: Record<string, number> = {};
  tasks.forEach(t => { counts[t.priority] = (counts[t.priority] || 0) + 1; });
  return Object.entries(counts).map(([name, value]) => ({
    name, value, color: PRIORITY_COLORS[name] || "#94a3b8",
  }));
}

const TS = { borderRadius: "8px", fontSize: "12px" };

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [tasks,   setTasks]   = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    tasksService.fetchTasks(user.id)
      .then(setTasks)
      .finally(() => setLoading(false));
  }, [user]);

  const { monday, sunday } = getWeekRange();

  const totalTasks      = tasks.length;
  const completedTasks  = tasks.filter(t => t.done).length;
  const pendingTasks    = tasks.filter(t => !t.done).length;
  const overdueCount = tasks.filter(t => {
    if (t.done || !t.due_date) return false;
    return t.due_date < todayLocal(); // local date string comparison
  }).length;
  const productivityPct = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const weeklyData   = buildWeeklyData(tasks);
  const categoryData = buildCategoryData(tasks);
  const priorityData = buildPriorityData(tasks);
  const trendData    = buildDailyTrend(tasks);

  const summaryCards = [
    { label: "Total Tasks",      value: totalTasks,       icon: ListTodo,    color: "text-primary bg-primary/10" },
    { label: "Completed",        value: completedTasks,   icon: CheckCircle2,color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
    { label: "Pending",          value: pendingTasks,     icon: Clock,       color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" },
    { label: "Overdue",          value: overdueCount,     icon: Flag,        color: "text-red-500 bg-red-50 dark:bg-red-900/20" },
    { label: "Productivity",     value: `${productivityPct}%`, icon: TrendingUp, color: "text-secondary bg-secondary/10" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Loading analytics...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Analytics</h1>
        <p className="text-sm text-muted-foreground">
          Real insights from your tasks · Week of {monday.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {sunday.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {summaryCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl card-glass p-4 text-center">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center mx-auto mb-2 ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold font-heading text-foreground">{s.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">

        {/* Weekly tasks bar chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl card-glass p-6">
          <h3 className="text-base font-semibold font-heading text-foreground mb-1">This Week's Tasks</h3>
          <p className="text-xs text-muted-foreground mb-4">Completed vs pending by day</p>
          {weeklyData.every(d => d.completed === 0 && d.pending === 0) ? (
            <div className="flex items-center justify-center h-[220px] text-sm text-muted-foreground">No task activity this week</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" allowDecimals={false} />
                <Tooltip contentStyle={TS} />
                <Bar dataKey="completed" name="Completed" fill="#0ea5e9" radius={[4,4,0,0]} />
                <Bar dataKey="pending"   name="Pending"   fill="#6366f1" radius={[4,4,0,0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
          <div className="flex gap-4 mt-2">
            {[{ color: "#0ea5e9", label: "Completed" }, { color: "#6366f1", label: "Pending" }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
                <span className="text-xs text-muted-foreground">{l.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Category breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl card-glass p-6">
          <h3 className="text-base font-semibold font-heading text-foreground mb-1">By Category</h3>
          <p className="text-xs text-muted-foreground mb-4">Distribution across all your tasks</p>
          {categoryData.length === 0 ? (
            <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">No tasks yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={4}>
                  {categoryData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={TS} formatter={(v, n) => [`${v} tasks`, n]} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            {categoryData.map(c => (
              <div key={c.name} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                <span className="text-xs text-muted-foreground">{c.name} ({c.value})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Priority breakdown */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-xl card-glass p-6">
          <h3 className="text-base font-semibold font-heading text-foreground mb-1">By Priority</h3>
          <p className="text-xs text-muted-foreground mb-4">How urgent are your tasks?</p>
          {priorityData.length === 0 ? (
            <div className="flex items-center justify-center h-[180px] text-sm text-muted-foreground">No tasks yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={priorityData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={4}>
                  {priorityData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={TS} formatter={(v, n) => [`${v} tasks`, n]} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            {priorityData.map(p => (
              <div key={p.name} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: p.color }} />
                <span className="text-xs text-muted-foreground">{p.name} ({p.value})</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* 7-day completion rate trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-xl card-glass p-6">
          <h3 className="text-base font-semibold font-heading text-foreground mb-1">Completion Rate Trend</h3>
          <p className="text-xs text-muted-foreground mb-4">Daily % of tasks completed (last 7 days)</p>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" domain={[0, 100]} unit="%" />
              <Tooltip contentStyle={TS} formatter={(v) => [`${v}%`, "Completion Rate"]} />
              <Line type="monotone" dataKey="rate" stroke="#2dd4bf" strokeWidth={2.5} dot={{ r: 4, fill: "#2dd4bf" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

      </div>

      {/* Task list summary */}
      {tasks.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          className="rounded-xl card-glass p-6">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">
            Recent Tasks Overview
          </h3>
          <div className="space-y-2">
            {tasks.slice(0, 8).map(t => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg bg-muted/40 px-4 py-2.5">
                <div className={`h-2 w-2 rounded-full shrink-0 ${t.done ? "bg-emerald-500" : "bg-yellow-500"}`} />
                <span className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground" : "text-foreground"}`}>{t.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{t.category}</span>
                <span className={`text-xs font-medium ${
                  t.priority === "High" ? "text-red-500" : t.priority === "Medium" ? "text-orange-500" : "text-emerald-500"
                }`}>{t.priority}</span>
                {t.due_date && <span className="text-xs text-muted-foreground hidden sm:block">{t.due_date}</span>}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
