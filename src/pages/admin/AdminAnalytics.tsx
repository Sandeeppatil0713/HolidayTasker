<<<<<<< HEAD
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area,
} from "recharts";
import { TrendingUp, CheckCircle2, Users, Clock } from "lucide-react";

const taskCompletion = [
  { month: "Nov", completed: 120, pending: 45 },
  { month: "Dec", completed: 180, pending: 60 },
  { month: "Jan", completed: 210, pending: 38 },
  { month: "Feb", completed: 165, pending: 52 },
  { month: "Mar", completed: 240, pending: 30 },
  { month: "Apr", completed: 195, pending: 44 },
];

const cats = [
  { name: "Work",     value: 42, color: "#0ea5e9" },
  { name: "Personal", value: 28, color: "#2dd4bf" },
  { name: "Travel",   value: 18, color: "#f97316" },
  { name: "Urgent",   value: 12, color: "#6366f1" },
];

const dau = [
  { day: "Mon", active: 34 }, { day: "Tue", active: 52 },
  { day: "Wed", active: 28 }, { day: "Thu", active: 61 },
  { day: "Fri", active: 45 }, { day: "Sat", active: 19 },
  { day: "Sun", active: 12 },
];

const TS = { background: "#1a1d27", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" };
const AS = { fontSize: 11, fill: "rgba(255,255,255,0.4)" };
const fu = { hidden: { opacity: 0, y: 16 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }) };


export default function AdminAnalytics() {
  const cards = [
    { label: "Avg Completion Rate", value: "78%",  icon: TrendingUp,   color: "text-emerald-400 bg-emerald-400/10" },
    { label: "Tasks This Month",    value: "240",   icon: CheckCircle2, color: "text-cyan-400 bg-cyan-400/10" },
    { label: "Active Users Today",  value: "61",    icon: Users,        color: "text-blue-400 bg-blue-400/10" },
    { label: "Avg Task Duration",   value: "2.4d",  icon: Clock,        color: "text-purple-400 bg-purple-400/10" },
  ];

=======
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";
import { TrendingUp, CheckCircle2, Clock, Plane, Flag, ListTodo, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const TS  = { borderRadius: "8px", fontSize: "12px" };
const AS  = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };
const fu  = { hidden: { opacity: 0, y: 16 }, visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07 } }) };

const CAT_COLORS: Record<string, string> = {
  Work: "#0ea5e9", Personal: "#2dd4bf", Travel: "#f97316", Urgent: "#6366f1",
};

function localDateStr(d: Date | string) {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-CA");
}

export default function AdminAnalytics() {
  const [tasks,   setTasks]   = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = () => {
      supabase.from("tasks").select("*").then(({ data }) => {
        if (data) setTasks(data);
        setLoading(false);
      });
    };
    load();

    // Realtime — refresh on any task change
    const channel = supabase
      .channel("admin-analytics-tasks")
      .on("postgres_changes", { event: "*", schema: "public", table: "tasks" }, load)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  /* ── derived ── */
  const total      = tasks.length;
  const completed  = tasks.filter(t => t.done).length;
  const pending    = tasks.filter(t => !t.done).length;
  const travelAll  = tasks.filter(t => t.category === "Travel");
  const travelDone = travelAll.filter(t => t.done).length;
  const travelPct  = travelAll.length > 0 ? Math.round((travelDone / travelAll.length) * 100) : 0;
  const overdue    = tasks.filter(t => !t.done && t.due_date && t.due_date < localDateStr(new Date())).length;
  const prodPct    = total > 0 ? Math.round((completed / total) * 100) : 0;

  /* Category pie */
  const catData = Object.entries(
    tasks.reduce((acc: Record<string, number>, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1; return acc;
    }, {})
  ).map(([name, value]) => ({ name, value, color: CAT_COLORS[name] || "#94a3b8" }));

  /* Weekly completion (last 7 days) */
  const weeklyData = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (6 - i));
    const ds = localDateStr(d);
    return {
      day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()],
      completed: tasks.filter(t => t.done && t.completed_at && localDateStr(t.completed_at) === ds).length,
      pending:   tasks.filter(t => !t.done && t.due_date === ds).length,
    };
  });

  /* Travel tasks list */
  const travelTasks = [...travelAll].sort((a, b) => (a.done === b.done ? 0 : a.done ? 1 : -1));

  const summaryCards = [
    { label: "Total Tasks",       value: total,      icon: ListTodo,    color: "text-blue-400 bg-blue-400/10" },
    { label: "Completed",         value: completed,  icon: CheckCircle2,color: "text-emerald-400 bg-emerald-400/10" },
    { label: "Pending",           value: pending,    icon: Clock,       color: "text-yellow-400 bg-yellow-400/10" },
    { label: "Overdue",           value: overdue,    icon: Flag,        color: "text-red-400 bg-red-400/10" },
    { label: "Productivity",      value: `${prodPct}%`, icon: TrendingUp, color: "text-cyan-400 bg-cyan-400/10" },
    { label: "Travel Tasks",      value: travelAll.length, icon: Plane, color: "text-orange-400 bg-orange-400/10" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Loading analytics...</span>
    </div>
  );

>>>>>>> main
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Reports & Analytics</h1>
<<<<<<< HEAD
        <p className="text-sm text-white/50 mt-1">Platform-wide performance insights</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} custom={i} variants={fu} initial="hidden" animate="visible"
            className="rounded-xl bg-white/5 border border-white/10 p-5">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center mb-3 ${c.color}`}>
              <c.icon className="h-5 w-5" />
            </div>
            <div className="text-2xl font-bold font-heading text-white">{c.value}</div>
            <div className="text-xs text-white/40 mt-1">{c.label}</div>
=======
        <p className="text-sm text-muted-foreground mt-1">Platform-wide task performance insights</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {summaryCards.map((c, i) => (
          <motion.div key={c.label} custom={i} variants={fu} initial="hidden" animate="visible"
            className="rounded-xl bg-muted/40 border border-border p-4 text-center">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center mx-auto mb-2 ${c.color}`}>
              <c.icon className="h-4 w-4" />
            </div>
            <div className="text-xl font-bold font-heading text-white">{String(c.value)}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{c.label}</div>
>>>>>>> main
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
<<<<<<< HEAD
        <motion.div custom={4} variants={fu} initial="hidden" animate="visible"
          className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Task Completion (6 months)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={taskCompletion}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="month" tick={AS} axisLine={false} />
              <YAxis tick={AS} axisLine={false} />
              <Tooltip contentStyle={TS} />
              <Bar dataKey="completed" fill="#0ea5e9" radius={[4,4,0,0]} />
              <Bar dataKey="pending"   fill="#6366f1" radius={[4,4,0,0]} />
=======

        {/* Weekly completion */}
        <motion.div custom={6} variants={fu} initial="hidden" animate="visible"
          className="rounded-xl bg-muted/40 border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">Task Completion (Last 7 Days)</h3>
          <p className="text-xs text-muted-foreground mb-4">Completed vs pending per day</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={AS} axisLine={false} />
              <YAxis tick={AS} axisLine={false} allowDecimals={false} />
              <Tooltip contentStyle={TS} />
              <Bar dataKey="completed" name="Completed" fill="#0ea5e9" radius={[4,4,0,0]} />
              <Bar dataKey="pending"   name="Pending"   fill="#6366f1" radius={[4,4,0,0]} />
>>>>>>> main
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

<<<<<<< HEAD
        <motion.div custom={5} variants={fu} initial="hidden" animate="visible"
          className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Task Categories</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={cats} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={4}>
                {cats.map((e) => <Cell key={e.name} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={TS} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {cats.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                <span className="text-xs text-white/50">{c.name} ({c.value}%)</span>
=======
        {/* Category breakdown */}
        <motion.div custom={7} variants={fu} initial="hidden" animate="visible"
          className="rounded-xl bg-muted/40 border border-border p-6">
          <h3 className="text-sm font-semibold text-foreground mb-1">Tasks by Category</h3>
          <p className="text-xs text-muted-foreground mb-4">All users combined</p>
          {catData.length === 0 ? (
            <div className="flex items-center justify-center h-[180px] text-muted-foreground/60 text-sm">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={180}>
              <PieChart>
                <Pie data={catData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={4}>
                  {catData.map(e => <Cell key={e.name} fill={e.color} />)}
                </Pie>
                <Tooltip contentStyle={TS} formatter={(v, n) => [`${v} tasks`, n]} />
              </PieChart>
            </ResponsiveContainer>
          )}
          <div className="flex flex-wrap gap-3 mt-2">
            {catData.map(c => (
              <div key={c.name} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                <span className="text-xs text-muted-foreground">{c.name} ({String(c.value)})</span>
>>>>>>> main
              </div>
            ))}
          </div>
        </motion.div>
<<<<<<< HEAD

        <motion.div custom={6} variants={fu} initial="hidden" animate="visible"
          className="lg:col-span-2 rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Daily Active Users</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={dau}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={AS} axisLine={false} />
              <YAxis tick={AS} axisLine={false} />
              <Tooltip contentStyle={TS} />
              <Area type="monotone" dataKey="active" stroke="#0ea5e9" strokeWidth={2} fill="url(#ag)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
}
=======
      </div>

      {/* ── Vacation / Travel Tasks Section ── */}
      <motion.div custom={8} variants={fu} initial="hidden" animate="visible"
        className="rounded-xl bg-muted/40 border border-orange-500/20 p-6">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Plane className="h-4 w-4 text-orange-400" /> Vacation & Travel Tasks
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">All travel-category tasks across users</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-center">
              <div className="text-lg font-bold text-orange-400">{travelAll.length}</div>
              <div className="text-[10px] text-muted-foreground">Total</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-emerald-400">{travelDone}</div>
              <div className="text-[10px] text-muted-foreground">Done</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-yellow-400">{travelAll.length - travelDone}</div>
              <div className="text-[10px] text-muted-foreground">Pending</div>
            </div>
            <div className="h-12 w-12 rounded-full border-2 border-orange-400/40 flex items-center justify-center">
              <span className="text-xs font-bold text-orange-400">{travelPct}%</span>
            </div>
          </div>
        </div>

        {travelTasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground/60 text-sm">No travel tasks found</div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {travelTasks.map(t => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg bg-muted/30 px-4 py-3 border border-border/50">
                <div className={`h-2 w-2 rounded-full shrink-0 ${t.done ? "bg-emerald-400" : "bg-yellow-400"}`} />
                <span className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground/60" : "text-foreground/80"}`}>
                  {t.title}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                  ${t.priority === "High" ? "bg-red-400/20 text-red-400" :
                    t.priority === "Medium" ? "bg-orange-400/20 text-orange-400" :
                    "bg-emerald-400/20 text-emerald-400"}`}>
                  {t.priority}
                </span>
                {t.due_date && (
                  <span className="text-xs text-muted-foreground/60 hidden sm:block">{t.due_date}</span>
                )}
                <span className={`text-xs px-2 py-0.5 rounded-full ${t.done ? "bg-emerald-400/10 text-emerald-400" : "bg-yellow-400/10 text-yellow-400"}`}>
                  {t.done ? "Done" : "Pending"}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

>>>>>>> main
