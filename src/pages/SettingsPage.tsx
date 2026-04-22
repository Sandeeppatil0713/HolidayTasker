import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings, Sun, Moon, Globe, MapPin,
  Bell, Mail, BellOff, AlarmClock, Plane,
  AlertTriangle, LogOut, Trash2,
  RotateCcw, Database,
  ToggleLeft, ToggleRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [language,       setLanguage]       = useState("en");
  const [locationAccess, setLocationAccess] = useState(false);
  const [allNotif,       setAllNotif]       = useState(true);
  const [taskReminder,   setTaskReminder]   = useState(true);
  const [vacationNotif,  setVacationNotif]  = useState(true);
  const [emailNotif,     setEmailNotif]     = useState(true);

  const handleDeleteAccount = async () => {
    if (!confirm("Delete your account? This cannot be undone.")) return;
    await signOut(); navigate("/");
  };

  const handleResetSettings = () => {
    setLanguage("en"); setLocationAccess(false);
    setAllNotif(true); setTaskReminder(true); setVacationNotif(true); setEmailNotif(true);
    toast({ title: "Settings reset to defaults" });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">Settings</h1>
        <p className="text-sm text-muted-foreground">Manage your app preferences</p>
      </div>

      {/* General */}
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
        <Row icon={MapPin} label="Location Access" desc="Allow location-based suggestions">
          <Toggle value={locationAccess} onChange={() => setLocationAccess(p => !p)} />
        </Row>
      </SectionCard>

      {/* Notifications */}
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
      </SectionCard>

      {/* Danger Zone */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
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
