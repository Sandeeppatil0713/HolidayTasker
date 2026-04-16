import { Users, CheckSquare, Plane, TrendingUp, Activity, ArrowUpRight, Clock, Star } from "lucide-react";

const STATS = [
  { label: "Total Users",       value: "1,284",  change: "+12%",  icon: Users,       color: "from-indigo-500 to-indigo-600" },
  { label: "Tasks Completed",   value: "8,432",  change: "+23%",  icon: CheckSquare, color: "from-emerald-500 to-emerald-600" },
  { label: "Vacations Planned", value: "342",    change: "+8%",   icon: Plane,       color: "from-orange-400 to-orange-500" },
  { label: "Active Today",      value: "94",     change: "+5%",   icon: Activity,    color: "from-violet-500 to-violet-600" },
];

const RECENT_USERS = [
  { name: "Sammed JD",    email: "jdsammed108@gmail.com",    role: "Admin",  status: "active",   joined: "Today" },
  { name: "Shubham R",    email: "shubhamranjanagi16",       role: "Admin",  status: "active",   joined: "Today" },
  { name: "Sandeep R",    email: "rocksandeep0713@gmail.com",role: "Admin",  status: "active",   joined: "Today" },
  { name: "Alice M",      email: "alice@example.com",        role: "User",   status: "active",   joined: "2d ago" },
  { name: "Bob K",        email: "bob@example.com",          role: "User",   status: "inactive", joined: "5d ago" },
];

const ACTIVITY = [
  { text: "New user registered",        time: "2 min ago",  dot: "bg-emerald-400" },
  { text: "Task batch completed (×12)", time: "15 min ago", dot: "bg-indigo-400" },
  { text: "Vacation plan approved",     time: "1 hr ago",   dot: "bg-orange-400" },
  { text: "System backup completed",    time: "3 hr ago",   dot: "bg-slate-400" },
  { text: "New feedback submitted",     time: "5 hr ago",   dot: "bg-violet-400" },
];

const TASK_CATEGORIES = [
  { label: "Work",     pct: 68, color: "bg-indigo-500" },
  { label: "Personal", pct: 45, color: "bg-emerald-500" },
  { label: "Travel",   pct: 82, color: "bg-orange-400" },
  { label: "Health",   pct: 31, color: "bg-violet-500" },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Welcome back, Admin 👋</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">Here's what's happening across your platform today.</p>
        </div>
        <span className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400 dark:text-gray-500">
          <Clock className="w-3.5 h-3.5" />
          Last updated just now
        </span>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {STATS.map(({ label, value, change, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-gray-800">
            <div className="flex items-start justify-between mb-4">
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-sm`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-emerald-500">
                <ArrowUpRight className="w-3 h-3" />{change}
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-gray-100">{value}</p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent users */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-100">Recent Users</h3>
            <a href="/admin/users" className="text-xs text-indigo-500 hover:text-indigo-600 font-medium">View all →</a>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-gray-800">
            {RECENT_USERS.map((u) => (
              <div key={u.email} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 dark:hover:bg-gray-800/50 transition-colors">
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{u.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-800 dark:text-gray-100 truncate">{u.name}</p>
                  <p className="text-xs text-slate-400 dark:text-gray-500 truncate">{u.email}</p>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === "Admin" ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400"}`}>
                  {u.role}
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-gray-700 text-slate-400"}`}>
                  {u.status}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-gray-500 shrink-0">{u.joined}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity feed */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800">
          <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-100">Live Activity</h3>
          </div>
          <div className="px-5 py-3 space-y-4">
            {ACTIVITY.map(({ text, time, dot }) => (
              <div key={text} className="flex items-start gap-3">
                <span className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${dot}`} />
                <div>
                  <p className="text-sm text-slate-700 dark:text-gray-300">{text}</p>
                  <p className="text-[11px] text-slate-400 dark:text-gray-500 mt-0.5">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Task category progress */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-5">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-100">Task Completion by Category</h3>
          <span className="flex items-center gap-1 text-xs text-slate-400 dark:text-gray-500">
            <TrendingUp className="w-3.5 h-3.5" /> This month
          </span>
        </div>
        <div className="space-y-4">
          {TASK_CATEGORIES.map(({ label, pct, color }) => (
            <div key={label}>
              <div className="flex justify-between text-xs mb-1.5">
                <span className="font-medium text-slate-700 dark:text-gray-300">{label}</span>
                <span className="text-slate-400 dark:text-gray-500">{pct}%</span>
              </div>
              <div className="h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${color} transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick ratings */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { label: "Avg. User Rating",   value: "4.7", icon: Star,     color: "text-amber-400" },
          { label: "Support Tickets",    value: "12",  icon: Activity, color: "text-violet-500" },
          { label: "Uptime This Month",  value: "99.9%",icon: TrendingUp,color: "text-emerald-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-gray-800 flex items-center gap-4">
            <Icon className={`w-8 h-8 ${color} shrink-0`} />
            <div>
              <p className="text-xl font-bold text-slate-800 dark:text-gray-100">{value}</p>
              <p className="text-xs text-slate-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
