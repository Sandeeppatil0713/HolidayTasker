import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, CheckSquare, Plane, TrendingUp, UserCheck, AlertCircle, Loader2, Flag } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const TS = { background: "#1a1d27", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" };
const AS = { fontSize: 11, fill: "hsl(var(--muted-foreground))" };

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};

function localDateStr(d: Date) {
  return d.toLocaleDateString("en-CA");
}

export default function AdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0, tasks: 0, completed: 0, travel: 0, overdue: 0, pending: 0,
  });
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [recentTasks, setRecentTasks] = useState<any[]>([]);

  useEffect(() => {
    async function load() {
      // Fetch all tasks
      const { data: tasks } = await supabase.from("tasks").select("*");
      // Fetch user count from profiles table
      const { count: profileCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });

      const allTasks    = tasks || [];
      const uniqueUsers = profileCount ?? 0;
      const completed  = allTasks.filter((t: any) => t.done).length;
      const travel     = allTasks.filter((t: any) => t.category === "Travel").length;
      const today      = localDateStr(new Date());
      const overdue    = allTasks.filter((t: any) => !t.done && t.due_date && t.due_date < today).length;
      const pending    = allTasks.filter((t: any) => !t.done).length;

      setStats({ users: uniqueUsers, tasks: allTasks.length, completed, travel, overdue, pending });

      // Build weekly bar data (last 7 days) using completed_at
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(); d.setDate(d.getDate() - (6 - i));
        const ds = localDateStr(d);
        return {
          day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()],
          completed: allTasks.filter((t: any) => t.done && t.completed_at && localDateStr(new Date(t.completed_at)) === ds).length,
          pending:   allTasks.filter((t: any) => !t.done && t.due_date === ds).length,
        };
      });
      setWeeklyData(days);

      // Recent 5 tasks sorted by created_at
      const recent = [...allTasks]
        .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 5);
      setRecentTasks(recent);

      setLoading(false);
    }
    load();
  }, []);

  const cards = [
    { label: "Total Users",     value: stats.users,     icon: Users,      color: "text-blue-400 bg-blue-400/10" },
    { label: "Total Tasks",     value: stats.tasks,     icon: CheckSquare,color: "text-cyan-400 bg-cyan-400/10" },
    { label: "Completed",       value: stats.completed, icon: UserCheck,  color: "text-emerald-400 bg-emerald-400/10" },
    { label: "Pending",         value: stats.pending,   icon: AlertCircle,color: "text-yellow-400 bg-yellow-400/10" },
    { label: "Overdue",         value: stats.overdue,   icon: Flag,       color: "text-red-400 bg-red-400/10" },
    { label: "Travel Tasks",    value: stats.travel,    icon: Plane,      color: "text-orange-400 bg-orange-400/10" },
  ];

  if (loading) return (
    <div className="flex items-center justify-center py-24 gap-3 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span className="text-sm">Loading dashboard...</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Dashboard Overview</h1>
        <p className="text-sm text-muted-foreground mt-1">Real-time stats across all users</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} custom={i} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-xl bg-muted/40 border border-border p-4 text-center hover:bg-muted/60 transition-all">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center mx-auto mb-2 ${c.color}`}>
              <c.icon className="h-4 w-4" />
            </div>
            <div className="text-xl font-bold font-heading text-white">{c.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{c.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Weekly task activity */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-xl bg-muted/40 border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-1">Weekly Task Activity</h3>
        <p className="text-xs text-muted-foreground mb-4">Completed vs pending tasks — last 7 days</p>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="day" tick={AS} axisLine={false} />
            <YAxis tick={AS} axisLine={false} allowDecimals={false} />
            <Tooltip contentStyle={TS} />
            <Bar dataKey="completed" name="Completed" fill="#0ea5e9" radius={[4,4,0,0]} />
            <Bar dataKey="pending"   name="Pending"   fill="#6366f1" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
        <div className="flex gap-4 mt-2">
          {[{ color: "#0ea5e9", label: "Completed" }, { color: "#6366f1", label: "Pending" }].map(l => (
            <div key={l.label} className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: l.color }} />
              <span className="text-xs text-muted-foreground">{l.label}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Recent tasks */}
      <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-xl bg-muted/40 border border-border p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4">Recently Added Tasks</h3>
        {recentTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground/60 text-center py-6">No tasks yet</p>
        ) : (
          <div className="space-y-2">
            {recentTasks.map((t: any) => (
              <div key={t.id} className="flex items-center gap-3 rounded-lg bg-muted/30 px-4 py-3">
                <div className={`h-2 w-2 rounded-full shrink-0 ${t.done ? "bg-emerald-400" : "bg-yellow-400"}`} />
                <span className={`flex-1 text-sm ${t.done ? "line-through text-muted-foreground/60" : "text-foreground/80"}`}>{t.title}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t.category}</span>
                <span className={`text-xs font-medium ${
                  t.priority === "High" ? "text-red-400" : t.priority === "Medium" ? "text-orange-400" : "text-emerald-400"
                }`}>{t.priority}</span>
                {t.due_date && <span className="text-xs text-muted-foreground/60 hidden sm:block">{t.due_date}</span>}
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}

