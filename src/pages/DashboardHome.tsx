import { motion } from "framer-motion";
import { CheckCircle2, Clock, Plane, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { Link } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const weekData = [
  { day: "Mon", tasks: 5 }, { day: "Tue", tasks: 8 }, { day: "Wed", tasks: 3 },
  { day: "Thu", tasks: 7 }, { day: "Fri", tasks: 6 }, { day: "Sat", tasks: 2 }, { day: "Sun", tasks: 1 },
];

const categoryData = [
  { name: "Work",     value: 40, color: "#0ea5e9" },
  { name: "Personal", value: 25, color: "#06b6d4" },
  { name: "Travel",   value: 20, color: "#2dd4bf" },
  { name: "Urgent",   value: 15, color: "#6366f1" },
];

const stats = [
  { label: "Tasks Today", value: "8", icon: CheckCircle2, change: "+2", color: "text-primary bg-primary/10" },
  { label: "Pending", value: "12", icon: Clock, change: "-3", color: "text-accent bg-accent/10" },
  { label: "Upcoming Trips", value: "2", icon: Plane, change: "+1", color: "text-secondary bg-secondary/10" },
  { label: "Productivity", value: "87%", icon: TrendingUp, change: "+5%", color: "text-primary bg-primary/10" },
];

const upcomingTasks = [
  { title: "Review Q4 report", category: "Work", priority: "High", due: "Today" },
  { title: "Book Bali accommodation", category: "Travel", priority: "Medium", due: "Tomorrow" },
  { title: "Grocery shopping", category: "Personal", priority: "Low", due: "Wed" },
  { title: "Team standup", category: "Work", priority: "High", due: "Today" },
];

const priorityColors: Record<string, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-accent/10 text-accent",
  Low: "bg-secondary/10 text-secondary",
};

const DashboardHome = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Here's what's happening today</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
            className="rounded-xl card-glass p-5 ">
            <div className="flex items-center justify-between mb-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <span className="text-xs font-medium text-secondary">{s.change}</span>
            </div>
            <div className="text-2xl font-bold font-heading heading-gradient">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="lg:col-span-2 rounded-xl card-glass p-6 ">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">Weekly Task Completion</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(210, 20%, 90%)" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} stroke="hsl(210, 15%, 45%)" />
              <YAxis tick={{ fontSize: 12 }} stroke="hsl(210, 15%, 45%)" />
              <Tooltip contentStyle={{ borderRadius: "8px", border: "1px solid hsl(210, 20%, 90%)", fontSize: "12px" }} />
              <Bar dataKey="tasks" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-xl card-glass p-6 ">
          <h3 className="text-base font-semibold font-heading text-foreground mb-4">By Category</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={4}>
                {categoryData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-3 mt-2">
            {categoryData.map((c) => (
              <div key={c.name} className="flex items-center gap-1.5">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: c.color }} />
                <span className="text-xs text-muted-foreground">{c.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Upcoming tasks */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
        className="rounded-xl card-glass p-6 ">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold font-heading text-foreground">Upcoming Tasks</h3>
          <Link to="/dashboard/tasks" className="text-xs font-medium text-primary hover:underline">View all</Link>
        </div>
        <div className="space-y-3">
          {upcomingTasks.map((t) => (
            <div key={t.title} className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="h-2 w-2 rounded-full bg-primary" />
                <span className="text-sm font-medium text-foreground">{t.title}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2 py-0.5 rounded-full ${priorityColors[t.priority]}`}>{t.priority}</span>
                <span className="text-xs text-muted-foreground">{t.due}</span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default DashboardHome;


