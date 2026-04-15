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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Reports & Analytics</h1>
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
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
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
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

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
              </div>
            ))}
          </div>
        </motion.div>

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
