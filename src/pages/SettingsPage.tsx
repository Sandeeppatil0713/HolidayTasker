import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, Sun, Moon, Globe, Clock, Calendar,
  Bell, Mail, Smartphone, BellOff,
  Lock, AtSign, Phone, Link2,
  Eye, EyeOff, Share2, Activity, MapPin,
  Flag, AlarmClock, Trash2, ArrowUpDown,
  Plane, DollarSign, Lightbulb, Sparkles,
  Shield, AlertTriangle, Monitor, LogOut,
  RotateCcw, Database, ChevronRight,
  ToggleLeft, ToggleRight, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

/* ── helpers ── */
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.45 } }),
};

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="transition-transform hover:scale-110 shrink-0">
      {value
        ? <ToggleRight className="h-6 w-6 text-primary" />
        : <ToggleLeft  className="h-6 w-6 text-muted-foreground" />}
    </button>
  );
}

function Row({ icon: Icon, label, desc, children }: {
  icon: React.ElementType; label: string; desc?: string; children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-3 border-b border-border/30 last:border-0">
      <div className="flex items-center gap-3 min-w-0">
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-4 w-4 text-primary" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {desc && <p className="text-xs text-muted-foreground truncate">{desc}</p>}
        </div>
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );
}

function SectionCard({ title, icon: Icon, index, children }: {
  title: string; icon: React.ElementType; index: number; children: React.ReactNode;
}) {
  return (
    <motion.div custom={index} variants={fadeUp} initial="hidden" animate="visible"
      className="rounded-xl card-glass p-5">
      <h3 className="text-sm font-semibold font-heading text-foreground mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      {children}
    </motion.div>
  );
}

const TRAVEL_CATS = ["Beach", "Hill Station", "City", "Adventure", "Cultural", "Wildlife", "Cruise"];

/* ══════════════════════════════════════════════ */
export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  /* General */
  const [language, setLanguage]   = useState("en");
  const [timezone, setTimezone]   = useState("UTC+5:30");
  const [dateFormat, setDateFormat] = useState("MM/DD/YYYY");

  /* Notifications */
  const [allNotif,      setAllNotif]      = useState(true);
  const [taskReminder,  setTaskReminder]  = useState(true);
  const [vacationNotif, setVacationNotif] = useState(true);
  const [emailNotif,    setEmailNotif]    = useState(true);
  const [pushNotif,     setPushNotif]     = useState(false);

  /* Account */
  const [newEmail,    setNewEmail]    = useState("");
  const [newPhone,    setNewPhone]    = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPw,   setConfirmPw]   = useState("");
  const [savingPw,    setSavingPw]    = useState(false);

  /* Privacy */
  const [profilePublic,   setProfilePublic]   = useState(true);
  const [dataSharing,     setDataSharing]     = useState(false);
  const [activityVisible, setActivityVisible] = useState(true);
  const [locationAccess,  setLocationAccess]  = useState(false);

  /* Task Prefs */
  const [defaultPriority, setDefaultPriority] = useState("Medium");
  const [reminderTime,    setReminderTime]    = useState("30");
  const [autoDelete,      setAutoDelete]      = useState(false);
  const [sortPref,        setSortPref]        = useState("due_date");

  /* Vacation Prefs */
  const [travelCats,       setTravelCats]       = useState<string[]>(["Beach", "City"]);
  const [budgetPref,       setBudgetPref]       = useState("Medium");
  const [locationSuggest,  setLocationSuggest]  = useState(true);
  const [personalization,  setPersonalization]  = useState(true);

  /* Security */
  const [twoFA,         setTwoFA]         = useState(false);
  const [loginAlerts,   setLoginAlerts]   = useState(true);

  const toggleCat = (c: string) =>
    setTravelCats(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);

  /* handlers */
  const handleChangePassword = async () => {
    if (newPassword !== confirmPw) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
    if (newPassword.length < 6)   { toast({ title: "Min 6 characters", variant: "destructive" }); return; }
    setSavingPw(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPw(false);
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Password updated" });
    setNewPassword(""); setConfirmPw("");
  };

  const handleUpdateEmail = async () => {
    if (!newEmail) return;
    const { error } = await supabase.auth.updateUser({ email: newEmail });
    if (error) { toast({ title: "Failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Confirmation sent", description: "Check your new email to confirm." });
    setNewEmail("");
  };

  const handleLogoutAll = async () => {
    await supabase.auth.signOut({ scope: "global" });
    navigate("/login");
  };

  const handleDeleteAccount = async () => {
    if (!confirm("Delete your account? This cannot be undone.")) return;
    await signOut(); navigate("/");
  };

  const handleResetSettings = () => {
    setLanguage("en"); setTimezone("UTC+5:30"); setDateFormat("MM/DD/YYYY");
    setAllNotif(true); setTaskReminder(true); setVacationNotif(true);
    setEmailNotif(true); setPushNotif(false);
    setProfilePublic(true); setDataSharing(false); setActivityVisible(true); setLocationAccess(false);
    setDefaultPriority("Medium"); setReminderTime("30"); setAutoDelete(false); setSortPref("due_date");
    setTravelCats(["Beach", "City"]); setBudgetPref("Medium"); setLocationSuggest(true); setPersonalization(true);
    setTwoFA(false); setLoginAlerts(true);
    toast({ title: "Settings reset to defaults" });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your app preferences and account</p>
      </div>

      {/* ── 1. General ── */}
      <SectionCard title="General Settings" icon={Settings} index={0}>
        <Row icon={Sun} label="Theme" desc="Choose your display mode">
          <div className="flex gap-2">
            {(["light", "dark"] as const).map((t) => (
              <button key={t} onClick={() => setTheme(t)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                  ${theme === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                {t === "light" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </Row>
        <Row icon={Globe} label="Language">
          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Spanish</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
              <SelectItem value="hi">Hindi</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row icon={Clock} label="Time Zone">
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["UTC-8:00","UTC-5:00","UTC+0:00","UTC+1:00","UTC+3:00","UTC+5:30","UTC+8:00","UTC+9:00"].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
        <Row icon={Calendar} label="Date Format">
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["MM/DD/YYYY","DD/MM/YYYY","YYYY-MM-DD"].map(f => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
      </SectionCard>

      {/* ── 2. Notifications ── */}
      <SectionCard title="Notification Settings" icon={Bell} index={1}>
        <Row icon={allNotif ? Bell : BellOff} label="All Notifications" desc="Master toggle for all alerts">
          <Toggle value={allNotif} onChange={() => setAllNotif(p => !p)} />
        </Row>
        <Row icon={AlarmClock} label="Task Reminders" desc="Get reminded before task due dates">
          <Toggle value={taskReminder && allNotif} onChange={() => setTaskReminder(p => !p)} />
        </Row>
        <Row icon={Plane} label="Vacation Alerts" desc="Updates on your trip plans">
          <Toggle value={vacationNotif && allNotif} onChange={() => setVacationNotif(p => !p)} />
        </Row>
        <Row icon={Mail} label="Email Notifications" desc="Receive updates via email">
          <Toggle value={emailNotif && allNotif} onChange={() => setEmailNotif(p => !p)} />
        </Row>
        <Row icon={Smartphone} label="Push Notifications" desc="Browser push alerts">
          <Toggle value={pushNotif && allNotif} onChange={() => setPushNotif(p => !p)} />
        </Row>
      </SectionCard>

      {/* ── 3. Account ── */}
      <SectionCard title="Account Settings" icon={AtSign} index={2}>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Change Password</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">New Password</label>
              <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="Min 6 characters" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Confirm Password</label>
              <Input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Repeat password" />
            </div>
          </div>
          <Button size="sm" variant="outline" onClick={handleChangePassword} disabled={savingPw || !newPassword}>
            <Lock className="h-4 w-4 mr-1" />{savingPw ? "Updating..." : "Update Password"}
          </Button>
        </div>
        <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Update Email</p>
          <div className="flex gap-2">
            <Input value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="New email address" className="flex-1" />
            <Button size="sm" variant="outline" onClick={handleUpdateEmail} disabled={!newEmail}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-border/30 space-y-3">
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Update Phone</p>
          <div className="flex gap-2">
            <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="+1 234 567 8900" className="flex-1" />
            <Button size="sm" variant="outline" disabled={!newPhone}>
              <Check className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SectionCard>

      {/* ── 4. Privacy ── */}
      <SectionCard title="Privacy Settings" icon={Eye} index={3}>
        <Row icon={profilePublic ? Eye : EyeOff} label="Profile Visibility" desc={profilePublic ? "Public — anyone can view" : "Private — only you"}>
          <Toggle value={profilePublic} onChange={() => setProfilePublic(p => !p)} />
        </Row>
        <Row icon={Share2} label="Data Sharing" desc="Share anonymised usage data">
          <Toggle value={dataSharing} onChange={() => setDataSharing(p => !p)} />
        </Row>
        <Row icon={Activity} label="Activity Visibility" desc="Show your activity to others">
          <Toggle value={activityVisible} onChange={() => setActivityVisible(p => !p)} />
        </Row>
        <Row icon={MapPin} label="Location Access" desc="Allow location-based suggestions">
          <Toggle value={locationAccess} onChange={() => setLocationAccess(p => !p)} />
        </Row>
      </SectionCard>

      {/* ── 5. Task Preferences ── */}
      <SectionCard title="Task Preferences" icon={Flag} index={4}>
        <Row icon={Flag} label="Default Priority">
          <Select value={defaultPriority} onValueChange={setDefaultPriority}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Low","Medium","High"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row icon={AlarmClock} label="Default Reminder" desc="Minutes before due time">
          <Select value={reminderTime} onValueChange={setReminderTime}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {[["15","15 min"],["30","30 min"],["60","1 hour"],["1440","1 day"]].map(([v,l]) => (
                <SelectItem key={v} value={v}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Row>
        <Row icon={ArrowUpDown} label="Sort Tasks By">
          <Select value={sortPref} onValueChange={setSortPref}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="due_date">Due Date</SelectItem>
              <SelectItem value="priority">Priority</SelectItem>
              <SelectItem value="created_at">Created</SelectItem>
              <SelectItem value="title">Title</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row icon={Trash2} label="Auto-Delete Completed" desc="Remove done tasks after 7 days">
          <Toggle value={autoDelete} onChange={() => setAutoDelete(p => !p)} />
        </Row>
      </SectionCard>

      {/* ── 6. Vacation Preferences ── */}
      <SectionCard title="Vacation Preferences" icon={Plane} index={5}>
        <div className="mb-3">
          <p className="text-xs text-muted-foreground mb-2">Preferred Travel Categories</p>
          <div className="flex flex-wrap gap-2">
            {TRAVEL_CATS.map(cat => (
              <button key={cat} onClick={() => toggleCat(cat)}
                className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-all
                  ${travelCats.includes(cat) ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>
        <Row icon={DollarSign} label="Budget Preference">
          <Select value={budgetPref} onValueChange={setBudgetPref}>
            <SelectTrigger className="w-28 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              {["Budget","Medium","Luxury"].map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
            </SelectContent>
          </Select>
        </Row>
        <Row icon={Lightbulb} label="Location Suggestions" desc="Smart destination recommendations">
          <Toggle value={locationSuggest} onChange={() => setLocationSuggest(p => !p)} />
        </Row>
        <Row icon={Sparkles} label="Personalization" desc="Tailor suggestions to your history">
          <Toggle value={personalization} onChange={() => setPersonalization(p => !p)} />
        </Row>
      </SectionCard>

      {/* ── 7. Security ── */}
      <SectionCard title="Security Settings" icon={Shield} index={6}>
        <Row icon={Shield} label="Two-Factor Authentication" desc="Extra layer of login security">
          <Toggle value={twoFA} onChange={() => setTwoFA(p => !p)} />
        </Row>
        <Row icon={AlertTriangle} label="Login Alerts" desc="Notify on new sign-ins">
          <Toggle value={loginAlerts} onChange={() => setLoginAlerts(p => !p)} />
        </Row>
        <Row icon={Monitor} label="Active Sessions" desc="View devices logged in">
          <button className="flex items-center gap-1 text-xs text-primary hover:underline">
            Manage <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </Row>
        <Row icon={LogOut} label="Logout All Devices" desc="Sign out everywhere">
          <Button size="sm" variant="outline" onClick={handleLogoutAll}>
            <LogOut className="h-4 w-4 mr-1" /> Logout All
          </Button>
        </Row>
      </SectionCard>

      {/* ── 8. Danger Zone ── */}
      <motion.div custom={7} variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h3 className="text-sm font-semibold font-heading text-destructive mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> Danger Zone
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg bg-background/60 px-4 py-3 border border-border/40">
            <div>
              <p className="text-sm font-medium text-foreground">Reset All Settings</p>
              <p className="text-xs text-muted-foreground">Restore all preferences to defaults</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleResetSettings}>
              <RotateCcw className="h-4 w-4 mr-1" /> Reset
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-background/60 px-4 py-3 border border-border/40">
            <div>
              <p className="text-sm font-medium text-foreground">Clear Saved Data</p>
              <p className="text-xs text-muted-foreground">Remove cached preferences and history</p>
            </div>
            <Button size="sm" variant="outline" onClick={() => { localStorage.clear(); toast({ title: "Saved data cleared" }); }}>
              <Database className="h-4 w-4 mr-1" /> Clear
            </Button>
          </div>
          <div className="flex items-center justify-between rounded-lg bg-destructive/10 px-4 py-3 border border-destructive/20">
            <div>
              <p className="text-sm font-medium text-destructive">Delete Account</p>
              <p className="text-xs text-muted-foreground">Permanently remove your account and all data</p>
            </div>
            <Button size="sm" variant="destructive" onClick={handleDeleteAccount}>
              <Trash2 className="h-4 w-4 mr-1" /> Delete
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
