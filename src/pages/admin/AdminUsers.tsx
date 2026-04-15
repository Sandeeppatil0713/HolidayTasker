import { useState } from "react";
import { motion } from "framer-motion";
import { Search, UserPlus, Trash2, Edit3, Shield, User, Mail, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ADMIN_EMAILS } from "@/contexts/AuthContext";

const MOCK_USERS = [
  { id: "1", name: "Sandeep Rock",    email: "rocksandeep0713@gmail.com", role: "admin",  joined: "Jan 2026", tasks: 12, status: "active" },
  { id: "2", name: "JD Sammed",       email: "jdsammed108@gmail.com",     role: "admin",  joined: "Feb 2026", tasks: 8,  status: "active" },
  { id: "3", name: "Shubham Ranjan",  email: "shubhamranjanagi16@gmail.com", role: "admin", joined: "Feb 2026", tasks: 15, status: "active" },
  { id: "4", name: "Alice Johnson",   email: "alice@example.com",         role: "user",   joined: "Mar 2026", tasks: 24, status: "active" },
  { id: "5", name: "Bob Smith",       email: "bob@example.com",           role: "user",   joined: "Mar 2026", tasks: 7,  status: "inactive" },
  { id: "6", name: "Carol White",     email: "carol@example.com",         role: "user",   joined: "Apr 2026", tasks: 31, status: "active" },
];

export default function AdminUsers() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState(MOCK_USERS);

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  const deleteUser = (id: string) => {
    if (!confirm("Delete this user?")) return;
    setUsers(p => p.filter(u => u.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading heading-gradient">User Management</h1>
          <p className="text-sm text-white/50 mt-1">{users.length} total users</p>
        </div>
        <Button size="sm" className="gap-2">
          <UserPlus className="h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
        <Input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/30" />
      </div>

      {/* Table */}
      <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
        <div className="grid grid-cols-[1fr_1fr_80px_80px_80px_60px] gap-4 px-5 py-3 border-b border-white/10 text-xs font-medium text-white/40 uppercase tracking-wide">
          <span>User</span><span>Email</span><span>Role</span><span>Tasks</span><span>Status</span><span></span>
        </div>
        {filtered.map((u, i) => (
          <motion.div key={u.id}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
            className="grid grid-cols-[1fr_1fr_80px_80px_80px_60px] gap-4 px-5 py-4 border-b border-white/6 last:border-0 hover:bg-white/4 transition-colors items-center">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <User className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-white truncate">{u.name}</span>
            </div>
            <span className="text-sm text-white/50 truncate">{u.email}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium w-fit
              ${u.role === "admin" ? "bg-primary/20 text-primary" : "bg-white/10 text-white/60"}`}>
              {u.role}
            </span>
            <span className="text-sm text-white/70">{u.tasks}</span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium w-fit
              ${u.status === "active" ? "bg-emerald-400/20 text-emerald-400" : "bg-white/10 text-white/40"}`}>
              {u.status}
            </span>
            <div className="flex items-center gap-1">
              <button className="p-1.5 rounded-lg hover:bg-white/10 text-white/40 hover:text-white transition-colors">
                <Edit3 className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => deleteUser(u.id)}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-white/40 hover:text-red-400 transition-colors">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
