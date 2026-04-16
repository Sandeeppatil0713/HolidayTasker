import { TrendingUp, Users, CheckSquare, Plane, BarChart2 } from "lucide-react";

const MONTHLY = [
  { month: "Nov", users: 40, tasks: 120, vacations: 18 },
  { month: "Dec", users: 55, tasks: 180, vacations: 30 },
  { month: "Jan", users: 70, tasks: 210, vacations: 22 },
  { month: "Feb", users: 90, tasks: 260, vacations: 35 },
  { month: "Mar", users: 110, tasks: 310, vacations: 48 },
  { month: "Apr", users: 140, tasks: 390, vacations: 60 },
];

const max = (key: keyof typeof MONTHLY[0]) =>
  Math.max(...MONTHLY.map((m) => m[key] as number));

function Bar({ value, maxVal, color }: { value: number; maxVal: number; color: string }) {
  return (
    <div className="flex-1 flex flex-col items-center gap-1">
      <span className="text-[10px] text-slate-400 dark:text-gray-500">{value}</span>
      <div className="w-full bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden" style={{ height: 80 }}>
        <div
          className={`w-full rounded-full ${color} transition-all duration-700`}
          style={{ height: `${(value / maxVal) * 100}%`, marginTop: `${100 - (value / maxVal) * 100}%` }}
        />
      </div>
    </div>
  );
}

const TOP_USERS = [
  { name: "Sammed JD",  tasks: 24, pct: 92 },
  { name: "Carol T",    tasks: 15, pct: 78 },
  { name: "Shubham R",  tasks: 18, pct: 85 },
  { name: "Alice M",    tasks: 9,  pct: 55 },
  { name: "Sandeep R",  tasks: 31, pct: 97 },
];

export default function AdminAnalytics() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">Reports & Analytics</h2>
        <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">Platform-wide performance overview</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Users",     value: "1,284", icon: Users,       color: "text-indigo-500",  bg: "bg-indigo-50 dark:bg-indigo-900/20" },
          { label: "Tasks Done",      value: "8,432", icon: CheckSquare, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-900/20" },
          { label: "Vacations",       value: "342",   icon: Plane,       color: "text-orange-400",  bg: "bg-orange-50 dark:bg-orange-900/20" },
          { label: "Growth Rate",     value: "+23%",  icon: TrendingUp,  color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-900/20" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-slate-100 dark:border-gray-800">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-gray-100">{value}</p>
            <p className="text-xs text-slate-500 dark:text-gray-400 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-5">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-100">Monthly Growth</h3>
            <div className="flex items-center gap-3 text-[11px]">
              {[["bg-indigo-500","Users"],["bg-emerald-500","Tasks"],["bg-orange-400","Vacations"]].map(([c,l])=>(
                <span key={l} className="flex items-center gap-1 text-slate-500 dark:text-gray-400">
                  <span className={`w-2 h-2 rounded-full ${c}`}/>{l}
                </span>
              ))}
            </div>
          </div>
          <div className="flex items-end gap-2">
            {MONTHLY.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col gap-1">
                <div className="flex gap-0.5 items-end" style={{ height: 100 }}>
                  <Bar value={m.users}     maxVal={max("users")}     color="bg-indigo-500" />
                  <Bar value={m.tasks / 4} maxVal={max("tasks") / 4} color="bg-emerald-500" />
                  <Bar value={m.vacations} maxVal={max("vacations")} color="bg-orange-400" />
                </div>
                <p className="text-[10px] text-center text-slate-400 dark:text-gray-500">{m.month}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Top users by task completion */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 p-5">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-100 mb-5">Top Users by Activity</h3>
          <div className="space-y-4">
            {TOP_USERS.sort((a, b) => b.pct - a.pct).map(({ name, tasks, pct }) => (
              <div key={name}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-gray-300">{name}</span>
                  <span className="text-slate-400 dark:text-gray-500">{tasks} tasks · {pct}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Breakdown table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 dark:border-gray-800 flex items-center gap-2">
          <BarChart2 className="w-4 h-4 text-slate-400" />
          <h3 className="text-sm font-semibold text-slate-800 dark:text-gray-100">Monthly Breakdown</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-gray-800/50 border-b border-slate-100 dark:border-gray-800">
                {["Month","New Users","Tasks Completed","Vacations Planned","Growth"].map((h)=>(
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
              {[...MONTHLY].reverse().map((m, i) => (
                <tr key={m.month} className="hover:bg-slate-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-3 font-medium text-slate-800 dark:text-gray-100">{m.month} 2026</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-gray-400">{m.users}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-gray-400">{m.tasks}</td>
                  <td className="px-5 py-3 text-slate-600 dark:text-gray-400">{m.vacations}</td>
                  <td className="px-5 py-3">
                    <span className={`text-xs font-semibold ${i === 0 ? "text-emerald-500" : "text-slate-400 dark:text-gray-500"}`}>
                      {i === 0 ? "+27%" : i === 1 ? "+18%" : "+12%"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
