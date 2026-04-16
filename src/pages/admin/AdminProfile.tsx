import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Lock, Save, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function AdminProfile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [name,      setName]      = useState(user?.user_metadata?.username || "");
  const [newPw,     setNewPw]     = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [saving,    setSaving]    = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { username: name } });
    setSaving(false);
    if (error) { toast({ title: "Failed", variant: "destructive" }); return; }
    toast({ title: "Profile updated" });
  };

  const handleChangePw = async () => {
    if (newPw !== confirmPw) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    if (newPw.length < 6)   { toast({ title: "Min 6 characters", variant: "destructive" }); return; }
    const { error } = await supabase.auth.updateUser({ password: newPw });
    if (error) { toast({ title: "Failed", variant: "destructive" }); return; }
    toast({ title: "Password updated" });
    setNewPw(""); setConfirmPw("");
  };

  const initials = name ? name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) : "A";
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Admin Profile</h1>
        <p className="text-sm text-white/50 mt-1">Manage your admin account</p>
      </div>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-white/5 border border-white/10 p-6 flex items-center gap-5">
        <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 shrink-0">
          <span className="text-2xl font-bold font-heading text-primary">{initials}</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{name || "Admin"}</h2>
          <p className="text-sm text-white/50">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 font-medium flex items-center gap-1">
              <Shield className="h-3 w-3" /> Admin
            </span>
            <span className="text-xs text-white/30">Since {createdAt}</span>
          </div>
        </div>
      </motion.div>

      {/* Edit info */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <User className="h-4 w-4 text-primary" /> Account Info
        </h3>
        <div className="space-y-1">
          <label className="text-xs text-white/40">Full Name</label>
          <Input value={name} onChange={e => setName(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-white/40">Email Address</label>
          <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-white/10 bg-white/5 text-sm text-white/40">
            <Mail className="h-4 w-4 shrink-0" />
            <span>{user?.email}</span>
          </div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />{saving ? "Saving..." : "Save Changes"}
        </Button>
      </motion.div>

      {/* Change password */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.16 }}
        className="rounded-xl bg-white/5 border border-white/10 p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <Lock className="h-4 w-4 text-primary" /> Change Password
        </h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-xs text-white/40">New Password</label>
            <Input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Min 6 characters"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-white/40">Confirm Password</label>
            <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat"
              className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={handleChangePw} disabled={!newPw}
          className="border-white/10 text-white/60 hover:text-white hover:bg-white/10">
          Update Password
        </Button>
      </motion.div>

      {/* Logout */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
        className="rounded-xl bg-white/5 border border-white/10 p-5">
        <Button variant="destructive" size="sm" onClick={async () => { await signOut(); navigate("/"); }} className="gap-2">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </motion.div>
    </div>
  );
}
