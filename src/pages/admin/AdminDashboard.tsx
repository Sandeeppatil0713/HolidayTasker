import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Users, CheckSquare, Plane, TrendingUp, Activity, UserCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

const activityData = [
  { day: "Mon", users: 12, tasks: 34 },
  { day: "Tue", users: 19, tasks: 45 },
  { day: "Wed", users: 8,  tasks: 28 },
  { day: "Thu", users: 22, tasks: 52 },
  { day: "Fri", users: 17, tasks: 41 },
  { day: "Sat", users: 6,  tasks: 18 },
  { day: "Sun", users: 4,  tasks: 12 },
];

const growthData = [
  { week: "W1", users: 10 }, { week: "W2", users: 18 },
  { week: "W3", users: 25 }, { week: "W4", users: 34 },
  { week: "W5", users: 42 }, { week: "W6", users: 58 },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08 } }),
};

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, tasks: 0, completed: 0, vacations: 0 });

  useEffect(() => {
    Promise.all([
      supabase.from("tasks").select("id, done", { count: "exact" }),
    ]).then(([tasksRes]) => {
      const tasks = tasksRes.data || [];
      setStats(s => ({
        ...s,
        tasks: tasks.length,
        completed: tasks.filter(t => t.done).length,
      }));
    });
  }, []);

  const cards = [
    { label: "Total Users",      value: stats.users || "—",     icon: Users,      color: "text-blue-400 bg-blue-400/10",    change: "+12%" },
    { label: "Total Tasks",      value: stats.tasks,             icon: CheckSquare,color: "text-cyan-400 bg-cyan-400/10",    change: "+8%" },
    { label: "Completed Tasks",  value: stats.completed,         icon: UserCheck,  color: "text-emerald-400 bg-emerald-400/10", change: "+15%" },
    { label: "Vacation Plans",   value: stats.vacations || "—",  icon: Plane,      color: "text-orange-400 bg-orange-400/10", change: "+3%" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Dashboard Overview</h1>
        <p className="text-sm text-white/50 mt-1">Real-time stats across all users</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div key={c.label} custom={i} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-xl bg-white/5 border border-white/10 p-5 hover:bg-white/8 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${c.color}`}>
                <c.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-emerald-400">{c.change}</span>
            </div>
            <div className="text-2xl font-bold font-heading text-white">{c.value}</div>
            <div className="text-xs text-white/40 mt-1">{c.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly activity */}
        <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
          className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">Weekly Activity</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="day" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1a1d27", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" }} />
              <Bar dataKey="tasks" fill="#0ea5e9" radius={[4,4,0,0]} />
              <Bar dataKey="users" fill="#2dd4bf" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* User growth */}
        <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
          className="rounded-xl bg-white/5 border border-white/10 p-6">
          <h3 className="text-sm font-semibold text-white mb-4">User Growth</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
              <XAxis dataKey="week" tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "rgba(255,255,255,0.4)" }} axisLine={false} />
              <Tooltip contentStyle={{ background: "#1a1d27", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", fontSize: "12px", color: "#fff" }} />
              <Line type="monotone" dataKey="users" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent activity */}
      <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-xl bg-white/5 border border-white/10 p-6">
        <h3 className="text-sm font-semibold text-white mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { icon: UserCheck, text: "New user registered", time: "2 min ago",  color: "text-blue-400" },
            { icon: CheckSquare, text: "Task completed by user", time: "8 min ago", color: "text-emerald-400" },
            { icon: Plane, text: "Vacation plan created", time: "22 min ago", color: "text-orange-400" },
            { icon: AlertCircle, text: "User reported an issue", time: "1 hr ago",  color: "text-red-400" },
            { icon: TrendingUp, text: "Productivity spike detected", time: "3 hr ago",  color: "text-cyan-400" },
          ].map((a, i) => (
            <div key={i} className="flex items-center gap-3 rounded-lg bg-white/4 px-4 py-3">
              <a.icon className={`h-4 w-4 shrink-0 ${a.color}`} />
              <span className="text-sm text-white/80 flex-1">{a.text}</span>
              <span className="text-xs text-white/30">{a.time}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
