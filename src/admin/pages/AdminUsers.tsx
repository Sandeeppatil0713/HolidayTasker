import { useState } from "react";
import { Search, Plus, Pencil, Trash2, Shield, User } from "lucide-react";

interface UserRow {
  id: number;
  name: string;
  email: string;
  role: "Admin" | "User";
  status: "active" | "inactive";
  tasks: number;
  joined: string;
}

const INITIAL: UserRow[] = [
  { id: 1, name: "Sammed JD",    email: "jdsammed108@gmail.com",     role: "Admin", status: "active",   tasks: 24, joined: "Apr 15, 2026" },
  { id: 2, name: "Shubham R",    email: "shubhamranjanagi16",        role: "Admin", status: "active",   tasks: 18, joined: "Apr 15, 2026" },
  { id: 3, name: "Sandeep R",    email: "rocksandeep0713@gmail.com", role: "Admin", status: "active",   tasks: 31, joined: "Apr 15, 2026" },
  { id: 4, name: "Alice M",      email: "alice@example.com",         role: "User",  status: "active",   tasks: 9,  joined: "Mar 10, 2026" },
  { id: 5, name: "Bob K",        email: "bob@example.com",           role: "User",  status: "inactive", tasks: 3,  joined: "Feb 22, 2026" },
  { id: 6, name: "Carol T",      email: "carol@example.com",         role: "User",  status: "active",   tasks: 15, joined: "Jan 5, 2026" },
];

export default function AdminUsers() {
  const [users, setUsers] = useState<UserRow[]>(INITIAL);
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "User" as "Admin" | "User" });

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query.toLowerCase()) ||
      u.email.toLowerCase().includes(query.toLowerCase())
  );

  const deleteUser = (id: number) => setUsers((prev) => prev.filter((u) => u.id !== id));

  const addUser = () => {
    if (!form.name || !form.email) return;
    setUsers((prev) => [
      ...prev,
      { id: Date.now(), name: form.name, email: form.email, role: form.role, status: "active", tasks: 0, joined: "Today" },
    ]);
    setForm({ name: "", email: "", role: "User" });
    setShowAdd(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-gray-100">User Management</h2>
          <p className="text-sm text-slate-500 dark:text-gray-400 mt-0.5">{users.length} total users</p>
        </div>
        <button
          onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" /> Add User
        </button>
      </div>

      {/* Add user modal */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-sm shadow-2xl border border-slate-100 dark:border-gray-800 space-y-4">
            <h3 className="text-base font-bold text-slate-800 dark:text-gray-100">Add New User</h3>
            {(["name", "email"] as const).map((f) => (
              <div key={f}>
                <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1 block capitalize">{f}</label>
                <input
                  value={form[f]}
                  onChange={(e) => setForm((p) => ({ ...p, [f]: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm text-slate-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-400"
                />
              </div>
            ))}
            <div>
              <label className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wide mb-1 block">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((p) => ({ ...p, role: e.target.value as "Admin" | "User" }))}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-gray-700 bg-slate-50 dark:bg-gray-800 text-sm text-slate-800 dark:text-gray-100 outline-none"
              >
                <option>User</option>
                <option>Admin</option>
              </select>
            </div>
            <div className="flex gap-3 pt-1">
              <button onClick={() => setShowAdd(false)} className="flex-1 py-2 rounded-xl border border-slate-200 dark:border-gray-700 text-sm text-slate-600 dark:text-gray-400 hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors">Cancel</button>
              <button onClick={addUser} className="flex-1 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold transition-colors">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users…"
          className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-slate-800 dark:text-gray-100 outline-none focus:ring-2 focus:ring-indigo-400 shadow-sm"
        />
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-slate-100 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-gray-800 bg-slate-50 dark:bg-gray-800/50">
                {["User", "Role", "Status", "Tasks", "Joined", "Actions"].map((h) => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 dark:text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-gray-800">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-gray-800/40 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center shrink-0">
                        {u.role === "Admin"
                          ? <Shield className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                          : <User className="w-3.5 h-3.5 text-slate-500 dark:text-gray-400" />}
                      </div>
                      <div>
                        <p className="font-medium text-slate-800 dark:text-gray-100">{u.name}</p>
                        <p className="text-xs text-slate-400 dark:text-gray-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.role === "Admin" ? "bg-indigo-100 dark:bg-indigo-900/40 text-indigo-600 dark:text-indigo-400" : "bg-slate-100 dark:bg-gray-700 text-slate-500 dark:text-gray-400"}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${u.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" : "bg-slate-100 dark:bg-gray-700 text-slate-400"}`}>
                      {u.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-slate-600 dark:text-gray-400">{u.tasks}</td>
                  <td className="px-5 py-3 text-slate-400 dark:text-gray-500 text-xs">{u.joined}</td>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-2">
                      <button className="p-1.5 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => deleteUser(u.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
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
