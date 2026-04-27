import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, UserPlus, Trash2, Edit3, User, Loader2, X, Save, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  email: string;
  username: string | null;
  role: string;
  created_at: string;
  task_count?: number;
}

/* ── Modal ── */
function UserModal({
  mode, user, onClose, onSave,
}: {
  mode: "add" | "edit";
  user?: Profile;
  onClose: () => void;
  onSave: () => void;
}) {
  const { toast } = useToast();
  const [username, setUsername] = useState(user?.username || "");
  const [email,    setEmail]    = useState(user?.email || "");
  const [password, setPassword] = useState("");
  const [role,     setRole]     = useState(user?.role || "user");
  const [showPw,   setShowPw]   = useState(false);
  const [saving,   setSaving]   = useState(false);

  const handleSave = async () => {
    if (!username.trim() || !email.trim()) {
      toast({ title: "Name and email are required", variant: "destructive" }); return;
    }
    if (mode === "add" && password.length < 6) {
      toast({ title: "Password must be at least 6 characters", variant: "destructive" }); return;
    }
    setSaving(true);

    if (mode === "add") {
      // Use edge function with service role — avoids signing the admin out
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("create-user", {
        body: { email, password, username, role },
        headers: session?.access_token
          ? { Authorization: `Bearer ${session.access_token}` }
          : undefined,
      });

      if (res.error || res.data?.error) {
        const msg = res.data?.error ?? res.error?.message ?? "Unknown error";
        toast({ title: "Failed to create user", description: msg, variant: "destructive" });
        setSaving(false);
        return;
      }
      toast({ 
        title: "User created successfully", 
        description: "User can now log in with the provided credentials" 
      });
    } else if (user) {
      // Update profile
      const { error } = await supabase.from("profiles")
        .update({ username, role })
        .eq("id", user.id);
      if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); setSaving(false); return; }
      toast({ title: "User updated" });
    }

    setSaving(false);
    onSave();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md rounded-2xl bg-card border border-border p-6 shadow-2xl mx-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-semibold text-white">
            {mode === "add" ? "Add New User" : "Edit User"}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Full Name</label>
            <Input value={username} onChange={e => setUsername(e.target.value)} placeholder="John Doe"
              className="bg-muted/40 border-border text-white placeholder:text-muted-foreground/60" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Email Address</label>
            <Input value={email} onChange={e => setEmail(e.target.value)} placeholder="user@example.com"
              disabled={mode === "edit"}
              className="bg-muted/40 border-border text-white placeholder:text-muted-foreground/60 disabled:opacity-40" />
          </div>
          {mode === "add" && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Password</label>
              <div className="relative">
                <Input type={showPw ? "text" : "password"} value={password}
                  onChange={e => setPassword(e.target.value)} placeholder="Min 6 characters"
                  className="bg-muted/40 border-border text-white placeholder:text-muted-foreground/60 pr-10" />
                <button onClick={() => setShowPw(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground/60 hover:text-white">
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              <p className="text-xs text-muted-foreground/60 mt-1">
                User can log in immediately with this password
              </p>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}
              className="w-full rounded-lg bg-muted/40 border border-border text-white text-sm px-3 py-2 focus:outline-none">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button variant="outline" onClick={onClose} className="flex-1 border-border text-muted-foreground hover:text-white hover:bg-muted">
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="flex-1 gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : mode === "add" ? "Create User" : "Save Changes"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}

/* ══════════════════════════════════════════════ */
export default function AdminUsers() {
  const { toast } = useToast();
  const [users,   setUsers]   = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [query,   setQuery]   = useState("");
  const [modal,   setModal]   = useState<{ mode: "add" | "edit"; user?: Profile } | null>(null);

  const loadUsers = async () => {
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    if (!profiles) { setLoading(false); return; }
    const { data: tasks } = await supabase.from("tasks").select("user_id");
    const taskCounts: Record<string, number> = {};
    (tasks || []).forEach((t: any) => { taskCounts[t.user_id] = (taskCounts[t.user_id] || 0) + 1; });
    setUsers(profiles.map(p => ({ ...p, task_count: taskCounts[p.id] || 0 })));
    setLoading(false);
  };

  useEffect(() => { loadUsers(); }, []);

  const filtered = users.filter(u =>
    (u.username || "").toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase())
  );

  const deleteUser = async (id: string) => {
    if (!confirm("Delete this user permanently? This cannot be undone.")) return;

    const { data: { session } } = await supabase.auth.getSession();
    const res = await supabase.functions.invoke("delete-user", {
      body: { userId: id },
      headers: session?.access_token
        ? { Authorization: `Bearer ${session.access_token}` }
        : undefined,
    });

    if (res.error || res.data?.error) {
      const msg = res.data?.error ?? res.error?.message ?? "Unknown error";
      toast({ title: "Failed to delete user", description: msg, variant: "destructive" });
      return;
    }

    setUsers(p => p.filter(u => u.id !== id));
    toast({ title: "User deleted permanently" });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading heading-gradient">User Management</h1>
          <p className="text-sm text-muted-foreground mt-1">{users.length} registered users</p>
        </div>
        <Button size="sm" onClick={() => setModal({ mode: "add" })} className="gap-2">
          <UserPlus className="h-4 w-4" /> Add User
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60" />
        <Input value={query} onChange={e => setQuery(e.target.value)}
          placeholder="Search by name or email..."
          className="pl-10 bg-muted/40 border-border text-white placeholder:text-muted-foreground/60" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin" />
          <span className="text-sm">Loading users...</span>
        </div>
      ) : (
        <div className="rounded-xl bg-muted/40 border border-border overflow-hidden">
          <div className="grid grid-cols-[1fr_1fr_80px_70px_90px_80px] gap-4 px-5 py-3 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
            <span>User</span><span>Email</span><span>Role</span><span>Tasks</span><span>Joined</span><span>Actions</span>
          </div>
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground/60 text-sm">No users found</div>
          ) : (
            <AnimatePresence>
              {filtered.map((u, i) => (
                <motion.div key={u.id}
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="grid grid-cols-[1fr_1fr_80px_70px_90px_80px] gap-4 px-5 py-4 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors items-center">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground truncate">{u.username || "—"}</span>
                  </div>
                  <span className="text-sm text-muted-foreground truncate">{u.email}</span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium w-fit
                    ${u.role === "admin" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {u.role}
                  </span>
                  <span className="text-sm text-foreground/70">{u.task_count}</span>
                  <span className="text-xs text-muted-foreground">
                    {new Date(u.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })}
                  </span>
                  <div className="flex items-center gap-1">
                    <button onClick={() => setModal({ mode: "edit", user: u })}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-white transition-colors">
                      <Edit3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => deleteUser(u.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/20 text-muted-foreground hover:text-red-400 transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <UserModal
          mode={modal.mode}
          user={modal.user}
          onClose={() => setModal(null)}
          onSave={loadUsers}
        />
      )}
    </div>
  );
}


