import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, Shield, Bell, Palette, Camera,
  CheckCircle2, Plane, ListTodo, Bookmark, Lock, Trash2,
  Save, Edit3, LogOut, Sun, Moon, ToggleLeft, ToggleRight,
  Calendar, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTheme } from "@/contexts/ThemeContext";

const TRAVEL_CATEGORIES = ["Beach", "Hill Station", "City", "Adventure", "Cultural", "Wildlife", "Cruise"];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  // Profile fields
  const [fullName, setFullName] = useState(user?.user_metadata?.username || "");
  const [phone, setPhone] = useState(user?.user_metadata?.phone || "");
  const [location, setLocation] = useState(user?.user_metadata?.location || "");

  // Preferences
  const [taskReminders, setTaskReminders] = useState(true);
  const [vacationAlerts, setVacationAlerts] = useState(true);
  const [travelCats, setTravelCats] = useState<string[]>(["Beach", "City"]);

  // Security
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [changingPw, setChangingPw] = useState(false);

  // Stats
  const [stats, setStats] = useState({ total: 0, completed: 0, upcoming: 0 });

  useEffect(() => {
    if (!user) return;
    setAvatarUrl(user.user_metadata?.avatar_url || null);
    supabase
      .from("tasks")
      .select("id, done, due_date")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!data) return;
        const today = new Date().toISOString().split("T")[0];
        setStats({
          total: data.length,
          completed: data.filter((t) => t.done).length,
          upcoming: data.filter((t) => !t.done && t.due_date && t.due_date >= today).length,
        });
      });
  }, [user]);

  const toggleTravelCat = (cat: string) =>
    setTravelCats((prev) => prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    const ext = file.name.split(".").pop();
    const path = `avatars/${user.id}.${ext}`;
    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });
    if (error) { toast({ title: "Upload failed", variant: "destructive" }); return; }
    const { data } = supabase.storage.from("avatars").getPublicUrl(path);
    setAvatarUrl(data.publicUrl);
    toast({ title: "Avatar updated" });
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase.auth.updateUser({
      data: { username: fullName, phone, location, avatar_url: avatarUrl },
    });
    setSaving(false);
    if (error) { toast({ title: "Save failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Profile saved" });
    setEditing(false);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", variant: "destructive" }); return;
    }
    if (newPassword.length < 6) {
      toast({ title: "Password too short", variant: "destructive" }); return;
    }
    setChangingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setChangingPw(false);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Password updated" });
    setNewPassword(""); setConfirmPassword("");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Are you sure? This cannot be undone.")) return;
    await signOut();
    navigate("/");
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const initials = fullName ? fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : "U";
  const createdAt = user?.created_at ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";
  const lastLogin = user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading heading-gradient">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
        </div>
        <div className="flex gap-2">
          {editing ? (
            <>
              <Button variant="outline" size="sm" onClick={() => setEditing(false)}>Cancel</Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />{saving ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button size="sm" onClick={() => setEditing(true)}>
              <Edit3 className="h-4 w-4 mr-1" /> Edit Profile
            </Button>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── Left column ── */}
        <div className="space-y-4">

          {/* Avatar card */}
          <motion.div custom={0} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-xl card-glass p-6 flex flex-col items-center text-center">
            <div className="relative mb-4">
              <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-4 border-primary/20">
                {avatarUrl
                  ? <img src={avatarUrl} alt="avatar" className="h-full w-full object-cover" />
                  : <span className="text-2xl font-bold font-heading heading-gradient">{initials}</span>
                }
              </div>
              <button onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:scale-110 transition-transform">
                <Camera className="h-4 w-4" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
            </div>
            <h2 className="text-lg font-bold font-heading text-foreground">{fullName || "Your Name"}</h2>
            <p className="text-xs text-muted-foreground mt-1">{user?.email}</p>
            <span className="mt-3 text-xs px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">User</span>
          </motion.div>

          {/* Account info */}
          <motion.div custom={1} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-xl card-glass p-5 space-y-3">
            <h3 className="text-sm font-semibold font-heading text-foreground mb-2">Account Info</h3>
            <div className="flex items-center gap-3 text-sm">
              <User className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Username</p>
                <p className="font-medium text-foreground">{user?.user_metadata?.username || "—"}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Calendar className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Member Since</p>
                <p className="font-medium text-foreground">{createdAt}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 text-sm">
              <Clock className="h-4 w-4 text-primary shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground">Last Login</p>
                <p className="font-medium text-foreground">{lastLogin}</p>
              </div>
            </div>
          </motion.div>

          {/* Task & Vacation Summary */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-xl card-glass p-5">
            <h3 className="text-sm font-semibold font-heading text-foreground mb-4">Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total", value: stats.total, icon: ListTodo, color: "text-primary bg-primary/10" },
                { label: "Done", value: stats.completed, icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
                { label: "Upcoming", value: stats.upcoming, icon: Clock, color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center rounded-lg bg-muted/40 p-3 gap-1">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.color}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <span className="text-lg font-bold font-heading text-foreground">{s.value}</span>
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border/40 grid grid-cols-2 gap-3">
              {[
                { label: "Trips", value: "2", icon: Plane, color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20" },
                { label: "Saved", value: "6", icon: Bookmark, color: "text-secondary bg-secondary/10" },
              ].map((s) => (
                <div key={s.label} className="flex flex-col items-center rounded-lg bg-muted/40 p-3 gap-1">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${s.color}`}>
                    <s.icon className="h-4 w-4" />
                  </div>
                  <span className="text-lg font-bold font-heading text-foreground">{s.value}</span>
                  <span className="text-[10px] text-muted-foreground">{s.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* ── Right column ── */}
        <div className="lg:col-span-2 space-y-4">

          {/* Profile Information */}
          <motion.div custom={3} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-xl card-glass p-6">
            <h3 className="text-sm font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
              <User className="h-4 w-4 text-primary" /> Profile Information
            </h3>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Full Name</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} disabled={!editing} placeholder="Your full name" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Email Address</label>
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-muted/30 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{user?.email}</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} disabled={!editing} placeholder="Optional" className="pl-9" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={location} onChange={(e) => setLocation(e.target.value)} disabled={!editing} placeholder="City, Country" className="pl-9" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Preferences */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-xl card-glass p-6">
            <h3 className="text-sm font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
              <Palette className="h-4 w-4 text-primary" /> Preferences
            </h3>

            {/* Theme */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Theme</p>
              <div className="flex gap-3">
                {[
                  { value: "light", label: "Light", icon: Sun },
                  { value: "dark", label: "Dark", icon: Moon },
                ].map(({ value, label, icon: Icon }) => (
                  <button key={value} onClick={() => setTheme(value as "light" | "dark")}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition-all ${theme === value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                    <Icon className="h-4 w-4" /> {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Bell className="h-3.5 w-3.5" /> Notifications</p>
              <div className="space-y-2">
                {[
                  { label: "Task Reminders", value: taskReminders, set: setTaskReminders },
                  { label: "Vacation Alerts", value: vacationAlerts, set: setVacationAlerts },
                ].map(({ label, value, set }) => (
                  <div key={label} className="flex items-center justify-between rounded-lg bg-muted/40 px-4 py-2.5">
                    <span className="text-sm text-foreground">{label}</span>
                    <button onClick={() => set(!value)} className="transition-transform hover:scale-110">
                      {value
                        ? <ToggleRight className="h-6 w-6 text-primary" />
                        : <ToggleLeft className="h-6 w-6 text-muted-foreground" />}
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Travel Categories */}
            <div>
              <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1"><Plane className="h-3.5 w-3.5" /> Preferred Travel Categories</p>
              <div className="flex flex-wrap gap-2">
                {TRAVEL_CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => toggleTravelCat(cat)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all ${travelCats.includes(cat) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}>
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Security */}
          <motion.div custom={5} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-xl card-glass p-6">
            <h3 className="text-sm font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
              <Shield className="h-4 w-4 text-primary" /> Security
            </h3>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Min 6 characters" className="pl-9" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" className="pl-9" />
                </div>
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleChangePassword} disabled={changingPw || !newPassword}>
              <Lock className="h-4 w-4 mr-1" />{changingPw ? "Updating..." : "Update Password"}
            </Button>
          </motion.div>

          {/* Danger zone */}
          <motion.div custom={6} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-xl card-glass p-6">
            <h3 className="text-sm font-semibold font-heading text-foreground mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
              <Button variant="destructive" size="sm" onClick={handleDeleteAccount}>
                <Trash2 className="h-4 w-4 mr-1" /> Delete Account
              </Button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
