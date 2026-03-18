import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { CheckCircle2, Clock, Plane, TrendingUp, Calendar } from "lucide-react";

const weeklyTasks = [
  { day: "Mon", completed: 5, pending: 2 },
  { day: "Tue", completed: 8, pending: 1 },
  { day: "Wed", completed: 3, pending: 4 },
  { day: "Thu", completed: 7, pending: 3 },
  { day: "Fri", completed: 6, pending: 2 },
  { day: "Sat", completed: 2, pending: 1 },
  { day: "Sun", completed: 1, pending: 0 },
];

const workTravel = [
  { name: "Work Tasks",       value: 65, color: "#0ea5e9" },
  { name: "Travel Planning",  value: 35, color: "#2dd4bf" },
];

const productivityTrend = [
  { week: "W1", score: 72 }, { week: "W2", score: 78 }, { week: "W3", score: 85 },
  { week: "W4", score: 81 }, { week: "W5", score: 87 }, { week: "W6", score: 92 },
];

const summaryCards = [
  { label: "Tasks This Week", value: "32", icon: CheckCircle2, color: "text-primary bg-primary/10" },
  { label: "Pending Deadlines", value: "5", icon: Clock, color: "text-accent bg-accent/10" },
  { label: "Trips Planned", value: "3", icon: Plane, color: "text-secondary bg-secondary/10" },
  { label: "Productivity Score", value: "92%", icon: TrendingUp, color: "text-secondary bg-secondary/10" },
  { label: "Next Trip In", value: "18 days", icon: Calendar, color: "text-accent bg-accent/10" },
];

const AnalyticsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Analytics</h1>
        <p className="text-sm text-muted-foreground">Insights into your productivity and travel habits</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {summaryCards.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-xl card-glass p-4  text-center">
            <div className={`h-9 w-9 rounded-lg flex items-center justify-center mx-auto mb-2 ${s.color}`}>
              <s.icon className="h-4 w-4" />
            </div>
            <div className="text-lg font-bold font-heading text-foreground">{s.value}</div>
            <div className="text-[10px] text-muted-foreground mt-0.5">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Weekly tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="rounded-xl card-glass p-6 ">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Weekly Tasks</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyTasks}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} stroke="hsl(210, 15%, 45%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(210, 15%, 45%)" />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Bar dataKey="completed" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
              <Bar dataKey="pending"   fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Work vs Travel */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="rounded-xl card-glass p-6 ">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Work vs Travel Balance</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={workTravel} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" paddingAngle={5}>
                {workTravel.map((e) => (<Cell key={e.name} fill={e.color} />))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-6 mt-2">
            {workTravel.map((w) => (
              <div key={w.name} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: w.color }} />
                <span className="text-xs text-muted-foreground">{w.name} ({w.value}%)</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Productivity trend */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-xl card-glass p-6 ">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Productivity Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={productivityTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
              <XAxis dataKey="week" tick={{ fontSize: 11 }} stroke="hsl(210, 15%, 45%)" />
              <YAxis tick={{ fontSize: 11 }} stroke="hsl(210, 15%, 45%)" domain={[60, 100]} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              <Line type="monotone" dataKey="score" stroke="#2dd4bf" strokeWidth={2} dot={{ r: 4, fill: "#2dd4bf" }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>
    </div>
  );
};

export default AnalyticsPage;


