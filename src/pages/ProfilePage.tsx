import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  User, Mail, Phone, MapPin, FileText,
  CheckCircle2, Plane, ListTodo, Bookmark,
  Save, Edit3, LogOut, Camera, Clock, Calendar, Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { profileService, Profile } from "@/services/profileService";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.08, duration: 0.5 } }),
};

export default function ProfilePage() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement>(null);

  const [editing,       setEditing]       = useState(false);
  const [saving,        setSaving]        = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [loading,       setLoading]       = useState(true);

  // Profile fields
  const [fullName,   setFullName]   = useState("");
  const [phone,      setPhone]      = useState("");
  const [location,   setLocation]   = useState("");
  const [bio,        setBio]        = useState("");
  const [avatarUrl,  setAvatarUrl]  = useState<string | null>(null);

  // Stats
  const [stats, setStats] = useState({ total: 0, completed: 0, upcoming: 0 });

  // Load profile from DB on mount
  useEffect(() => {
    if (!user) return;

    const load = async () => {
      setLoading(true);
      const profile = await profileService.getProfile(user.id);
      if (profile) {
        setFullName(profile.username  ?? user.user_metadata?.username ?? "");
        setPhone(profile.phone        ?? "");
        setLocation(profile.location  ?? "");
        setBio(profile.bio            ?? "");
        setAvatarUrl(profile.avatar_url ?? user.user_metadata?.avatar_url ?? null);
      } else {
        // Fallback to auth metadata if no profile row yet
        setFullName(user.user_metadata?.username ?? "");
        setAvatarUrl(user.user_metadata?.avatar_url ?? null);
      }
      setLoading(false);
    };

    load();

    // Load task stats
    supabase
      .from("tasks")
      .select("id, done, due_date")
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!data) return;
        const today = new Date().toISOString().split("T")[0];
        setStats({
          total:     data.length,
          completed: data.filter((t) => t.done).length,
          upcoming:  data.filter((t) => !t.done && t.due_date && t.due_date >= today).length,
        });
      });
  }, [user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);

    // Save to profiles table (upsert handles both insert + update)
    const { error: dbError } = await profileService.upsertProfile(user.id, {
      username:   fullName,
      phone,
      location,
      bio,
      avatar_url: avatarUrl,
    });

    if (dbError) {
      setSaving(false);
      toast({ title: "Save failed", description: dbError.message, variant: "destructive" });
      return;
    }

    // Sync username + avatar to auth metadata so sidebar/header update instantly
    await supabase.auth.updateUser({
      data: { username: fullName, avatar_url: avatarUrl },
    });

    setSaving(false);
    toast({ title: "✅ Profile saved!", description: "Your information has been updated." });
    setEditing(false);
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setAvatarLoading(true);
    const { url, error } = await profileService.uploadAvatar(user.id, file);
    if (error || !url) {
      toast({ title: "Upload failed", description: "Make sure the 'avatars' storage bucket exists in Supabase.", variant: "destructive" });
      setAvatarLoading(false);
      return;
    }
    setAvatarUrl(url);
    // Immediately persist avatar to DB + auth metadata
    await profileService.upsertProfile(user.id, { avatar_url: url });
    await supabase.auth.updateUser({ data: { avatar_url: url } });
    setAvatarLoading(false);
    toast({ title: "📸 Avatar updated!" });
  };

  const handleSignOut = async () => { await signOut(); navigate("/"); };

  const initials  = fullName
    ? fullName.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2)
    : (user?.email?.[0] ?? "U").toUpperCase();
  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";
  const lastLogin = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    : "—";

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

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
                {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Save className="h-4 w-4 mr-1" />}
                {saving ? "Saving..." : "Save Changes"}
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
                {avatarLoading
                  ? <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  : avatarUrl
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
            {location && (
              <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                <MapPin className="h-3 w-3" />{location}
              </div>
            )}
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
                <p className="font-medium text-foreground">{fullName || "—"}</p>
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

          {/* Stats */}
          <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-xl card-glass p-5">
            <h3 className="text-sm font-semibold font-heading text-foreground mb-4">Summary</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Total",    value: stats.total,     icon: ListTodo,     color: "text-primary bg-primary/10" },
                { label: "Done",     value: stats.completed, icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20" },
                { label: "Upcoming", value: stats.upcoming,  icon: Clock,        color: "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20" },
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
                { label: "Trips", value: "2", icon: Plane,    color: "text-orange-500 bg-orange-50 dark:bg-orange-900/20" },
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
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)}
                  disabled={!editing} placeholder="Your full name" />
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
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)}
                    disabled={!editing} placeholder="Optional" className="pl-9" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input value={location} onChange={(e) => setLocation(e.target.value)}
                    disabled={!editing} placeholder="City, Country" className="pl-9" />
                </div>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-muted-foreground">Bio</label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Textarea value={bio} onChange={(e) => setBio(e.target.value)}
                    disabled={!editing} placeholder="Tell us a little about yourself..."
                    className="pl-9 resize-none" rows={3} />
                </div>
              </div>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div custom={4} variants={fadeUp} initial="hidden" animate="visible"
            className="rounded-xl card-glass p-6">
            <h3 className="text-sm font-semibold font-heading text-foreground mb-4">Actions</h3>
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
}
