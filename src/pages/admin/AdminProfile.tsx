import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Shield, Save, LogOut } from "lucide-react";
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
  const [saving,    setSaving]    = useState(false);

  const handleSave = async () => {
    setSaving(true);
    const { error } = await supabase.auth.updateUser({ data: { username: name } });
    setSaving(false);
    if (error) { toast({ title: "Failed", variant: "destructive" }); return; }
    toast({ title: "Profile updated" });
  };

  const initials = name ? name.split(" ").map((w: string) => w[0]).join("").toUpperCase().slice(0, 2) : "A";
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Admin Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your admin account</p>
      </div>

      {/* Avatar */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl bg-muted/40 border border-border p-6 flex items-center gap-5">
        <div className="h-20 w-20 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/30 shrink-0">
          <span className="text-2xl font-bold font-heading text-primary">{initials}</span>
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">{name || "Admin"}</h2>
          <p className="text-sm text-muted-foreground">{user?.email}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-xs px-2.5 py-1 rounded-full bg-primary/20 text-primary border border-primary/30 font-medium flex items-center gap-1">
              <Shield className="h-3 w-3" /> Admin
            </span>
            <span className="text-xs text-muted-foreground/60">Since {createdAt}</span>
          </div>
        </div>
      </motion.div>

      {/* Edit info */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}
        className="rounded-xl bg-muted/40 border border-border p-6 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <User className="h-4 w-4 text-primary" /> Account Info
        </h3>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Full Name</label>
          <Input value={name} onChange={e => setName(e.target.value)}
            className="bg-muted/40 border-border text-white placeholder:text-muted-foreground/60" />
        </div>
        <div className="space-y-1">
          <label className="text-xs text-muted-foreground">Email Address</label>
          <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-border bg-muted/40 text-sm text-muted-foreground">
            <Mail className="h-4 w-4 shrink-0" />
            <span>{user?.email}</span>
          </div>
        </div>
        <Button size="sm" onClick={handleSave} disabled={saving} className="gap-2">
          <Save className="h-4 w-4" />{saving ? "Saving..." : "Save Changes"}
        </Button>
      </motion.div>

      {/* Logout */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.24 }}
        className="rounded-xl bg-muted/40 border border-border p-5">
        <Button variant="destructive" size="sm" onClick={async () => { await signOut(); navigate("/"); }} className="gap-2">
          <LogOut className="h-4 w-4" /> Sign Out
        </Button>
      </motion.div>
    </div>
  );
}

