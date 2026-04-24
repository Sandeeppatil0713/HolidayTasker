import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings, Sun, Moon, Globe, MapPin,
  Bell, Mail, BellOff, AlarmClock, Plane,
  AlertTriangle, Trash2,
  RotateCcw, Database,
  ToggleLeft, ToggleRight, Loader2, Send, ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { useTheme } from "@/contexts/ThemeContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import {
  loadNotifPrefs, saveNotifPrefs,
  sendTaskReminderEmail, sendVacationAlertEmail, sendEmailDigest,
} from "@/services/notificationService";
import { tasksService } from "@/services/tasksService";

// Static sample trips — replace with real DB data when vacations table exists
const SAMPLE_TRIPS = [
  { name: "Bali Adventure", dates: "Dec 15–22, 2026" },
];

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
  const { signOut, user, deleteAccount } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [language,        setLanguage]        = useState(localStorage.getItem("language") || "en");
  const [locationAccess,  setLocationAccess]  = useState(false);
  const [locationData,    setLocationData]    = useState<{ city: string; country: string; lat: number; lon: number } | null>(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [allNotif,      setAllNotif]      = useState(true);
  const [taskReminder,  setTaskReminder]  = useState(true);
  const [vacationNotif, setVacationNotif] = useState(true);
  const [emailNotif,    setEmailNotif]    = useState(true);
  const [sending,       setSending]       = useState<string | null>(null);

  // Danger zone state
  const [clearLoading,  setClearLoading]  = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  // Restore prefs + location on mount
  useEffect(() => {
    const prefs = loadNotifPrefs();
    setAllNotif(prefs.allNotif);
    setTaskReminder(prefs.taskReminder);
    setVacationNotif(prefs.vacationNotif);
    setEmailNotif(prefs.emailNotif);

    const saved = localStorage.getItem("locationData");
    if (saved) { setLocationData(JSON.parse(saved)); setLocationAccess(true); }
  }, []);

  // Persist notif prefs on change
  useEffect(() => {
    saveNotifPrefs({ allNotif, taskReminder, vacationNotif, emailNotif });
  }, [allNotif, taskReminder, vacationNotif, emailNotif]);

  const userEmail = user?.email ?? "";
  const userName  = user?.user_metadata?.username?.split(" ")[0] ?? "there";

  // ── Language ──────────────────────────────────────────────────────────────
  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
    localStorage.setItem("language", lang);
  };

  // ── Location ──────────────────────────────────────────────────────────────
  const handleLocationToggle = async () => {
    if (locationAccess) {
      setLocationAccess(false); setLocationData(null);
      localStorage.removeItem("locationData"); return;
    }
    setLocationLoading(true);
    try {
      const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
        navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 10000 })
      );
      const { latitude: lat, longitude: lon } = pos.coords;
      const res  = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`);
      const data = await res.json();
      const city    = data.address?.city || data.address?.town || data.address?.village || data.address?.county || "Unknown";
      const country = data.address?.country || "Unknown";
      const info = { city, country, lat: +lat.toFixed(4), lon: +lon.toFixed(4) };
      setLocationData(info); setLocationAccess(true);
      localStorage.setItem("locationData", JSON.stringify(info));
      toast({ title: `📍 Location set to ${city}, ${country}` });
    } catch (err: any) {
      const denied = err?.code === 1;
      toast({ title: denied ? "Location permission denied" : "Could not get location",
        description: denied ? "Please allow location access in your browser settings." : "Try again later.",
        variant: "destructive" });
    } finally { setLocationLoading(false); }
  };

  // ── Notification helpers ──────────────────────────────────────────────────
  const doSendTaskReminder = async () => {
    if (!userEmail) {
      toast({ title: "No email address found", description: "Please add an email to your account.", variant: "destructive" });
      return;
    }
    setSending("task");
    try {
      const tasks  = await tasksService.fetchTasks(user!.id);
      const result = await sendTaskReminderEmail(userEmail, userName, tasks);
      if ((result as any).skipped) {
        toast({ title: "No tasks due soon", description: "You have no tasks due today or tomorrow." });
      } else {
        toast({ title: "📧 Reminder sent!", description: `${(result as any).count} task(s) sent to ${userEmail}` });
      }
    } catch (err: any) {
      toast({
        title: "Failed to send reminder",
        description: err?.message?.includes("Edge Function") || err?.message?.includes("FunctionsFetchError")
          ? "Email service is not configured. Check your Supabase Edge Function deployment."
          : (err?.message ?? "Something went wrong."),
        variant: "destructive",
      });
    } finally { setSending(null); }
  };

  const doSendVacationAlert = async () => {
    if (!userEmail) {
      toast({ title: "No email address found", variant: "destructive" });
      return;
    }
    setSending("vacation");
    try {
      console.log("Sending vacation alert to:", userEmail);
      await sendVacationAlertEmail(userEmail, userName, SAMPLE_TRIPS);
      toast({ title: "✈️ Vacation alert sent!", description: `Sent to ${userEmail}` });
    } catch (err: any) {
      console.error("Vacation alert error:", err);
      toast({ title: "Failed to send vacation alert", description: err?.text ?? err?.message ?? "Unknown error", variant: "destructive" });
    } finally { setSending(null); }
  };

  const doSendEmailDigest = async () => {
    if (!userEmail) {
      toast({ title: "No email address found", variant: "destructive" });
      return;
    }
    setSending("email");
    try {
      console.log("Sending digest to:", userEmail);
      const tasks = await tasksService.fetchTasks(user!.id);
      await sendEmailDigest(userEmail, userName, tasks, SAMPLE_TRIPS);
      toast({ title: "📬 Digest sent!", description: `Sent to ${userEmail}` });
    } catch (err: any) {
      console.error("Digest error:", err);
      toast({ title: "Failed to send digest", description: err?.text ?? err?.message ?? "Unknown error", variant: "destructive" });
    } finally { setSending(null); }
  };

  const handleTaskReminderToggle = () => {
    setTaskReminder(p => !p);
  };

  const handleVacationToggle = () => {
    setVacationNotif(p => !p);
  };

  const handleEmailDigestToggle = () => {
    setEmailNotif(p => !p);
  };

  // ── Danger zone ───────────────────────────────────────────────────────────
  const handleClearData = async () => {
    setClearLoading(true);
    try {
      if (user) await tasksService.clearAllTasks(user.id);
      localStorage.clear();
      // Re-apply language so the page doesn't break after clear
      const lang = "en";
      setLanguage(lang);
      i18n.changeLanguage(lang);
      toast({ title: "🗑️ All saved data cleared", description: "Your tasks and preferences have been removed." });
    } catch {
      toast({ title: "Failed to clear data", variant: "destructive" });
    } finally { setClearLoading(false); }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      const { error } = await deleteAccount();
      if (error) {
        const msg = error?.message ?? "";
        const isRpcMissing = msg.includes("delete_user") || msg.includes("function") || msg.includes("rpc");
        toast({
          title: "Failed to delete account",
          description: isRpcMissing
            ? "The delete_user database function is not set up. Please contact support."
            : msg || "Please try again.",
          variant: "destructive",
        });
        return;
      }
      toast({ title: "Account deleted", description: "Your account has been permanently removed." });
      navigate("/signup");
    } catch (err: any) {
      toast({ title: "Failed to delete account", description: err?.message ?? "Please try again.", variant: "destructive" });
    } finally { setDeleteLoading(false); setDeleteConfirm(""); }
  };

  const handleResetSettings = () => {
    handleLanguageChange("en");
    setLocationAccess(false); setLocationData(null);
    localStorage.removeItem("locationData");
    setAllNotif(true); setTaskReminder(true); setVacationNotif(true); setEmailNotif(true);
    toast({ title: t("settingsReset") });
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold font-heading heading-gradient">{t("settingsTitle")}</h1>
        <p className="text-sm text-muted-foreground">{t("settingsSubtitle")}</p>
      </div>

      {/* ── General ── */}
      <SectionCard title={t("generalSettings")} icon={Settings} index={0}>
        <Row icon={Sun} label={t("theme")} desc={t("themeDesc")}>
          <div className="flex gap-2">
            {(["light", "dark"] as const).map((th) => (
              <button key={th} onClick={() => setTheme(th)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all
                  ${theme === th ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                {th === "light" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
                {t(th)}
              </button>
            ))}
          </div>
        </Row>
        <Row icon={Globe} label={t("language")}>
          <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-36 h-8 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
              <SelectItem value="hi">हिन्दी</SelectItem>
            </SelectContent>
          </Select>
        </Row>
        <Row icon={MapPin} label={t("locationAccess")} desc={t("locationAccessDesc")}>
          <Toggle value={locationAccess} onChange={handleLocationToggle} />
        </Row>
        {locationLoading && (
          <div className="flex items-center gap-2 px-1 py-2 text-xs text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Detecting your location...
          </div>
        )}
        {locationData && !locationLoading && (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
            className="mx-1 mb-1 rounded-lg bg-primary/5 border border-primary/20 px-4 py-3 flex items-start gap-3">
            <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-medium text-foreground">{locationData.city}, {locationData.country}</p>
              <p className="text-xs text-muted-foreground">{locationData.lat}°N, {locationData.lon}°E</p>
            </div>
          </motion.div>
        )}
      </SectionCard>

      {/* ── Notifications ── */}
      <SectionCard title={t("notificationSettings")} icon={Bell} index={1}>
        {userEmail && (
          <div className="flex items-center gap-2 mb-3 px-1">
            <Mail className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Notifications sent to <span className="font-medium text-foreground">{userEmail}</span>
            </span>
          </div>
        )}

        {/* Master toggle */}
        <Row icon={allNotif ? Bell : BellOff} label={t("allNotifications")} desc={t("allNotificationsDesc")}>
          <Toggle value={allNotif} onChange={() => setAllNotif(p => !p)} />
        </Row>

        {/* Task Reminders */}
        <Row icon={AlarmClock} label={t("taskReminders")} desc={t("taskRemindersDesc")}>
          <div className="flex items-center gap-2">
            {sending === "task" && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            <Toggle value={taskReminder && allNotif} onChange={handleTaskReminderToggle} />
          </div>
        </Row>
        {taskReminder && allNotif && (
          <div className="flex justify-end -mt-1 pb-2">
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              disabled={!!sending} onClick={doSendTaskReminder}>
              {sending === "task" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              Send now
            </Button>
          </div>
        )}

        {/* Vacation Alerts */}
        <Row icon={Plane} label={t("vacationAlerts")} desc={t("vacationAlertsDesc")}>
          <div className="flex items-center gap-2">
            {sending === "vacation" && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            <Toggle value={vacationNotif && allNotif} onChange={handleVacationToggle} />
          </div>
        </Row>
        {vacationNotif && allNotif && (
          <div className="flex justify-end -mt-1 pb-2">
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              disabled={!!sending} onClick={doSendVacationAlert}>
              {sending === "vacation" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              Send now
            </Button>
          </div>
        )}

        {/* Email Digest */}
        <Row icon={Mail} label={t("emailNotifications")} desc={t("emailNotificationsDesc")}>
          <div className="flex items-center gap-2">
            {sending === "email" && <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />}
            <Toggle value={emailNotif && allNotif} onChange={handleEmailDigestToggle} />
          </div>
        </Row>
        {emailNotif && allNotif && (
          <div className="flex justify-end -mt-1 pb-2">
            <Button size="sm" variant="ghost" className="h-7 text-xs gap-1.5 text-muted-foreground hover:text-foreground"
              disabled={!!sending} onClick={doSendEmailDigest}>
              {sending === "email" ? <Loader2 className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
              Send now
            </Button>
          </div>
        )}
      </SectionCard>

      {/* ── Danger Zone ── */}
      <motion.div custom={2} variants={fadeUp} initial="hidden" animate="visible"
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-5">
        <h3 className="text-sm font-semibold font-heading text-destructive mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> {t("dangerZone")}
        </h3>
        <div className="space-y-3">

          {/* Reset Settings */}
          <div className="flex items-center justify-between rounded-lg bg-background/60 px-4 py-3 border border-border/40">
            <div>
              <p className="text-sm font-medium text-foreground">{t("resetAllSettings")}</p>
              <p className="text-xs text-muted-foreground">{t("resetAllSettingsDesc")}</p>
            </div>
            <Button size="sm" variant="outline" onClick={handleResetSettings}>
              <RotateCcw className="h-4 w-4 mr-1" /> {t("reset")}
            </Button>
          </div>

          {/* Clear Saved Data */}
          <div className="flex items-center justify-between rounded-lg bg-background/60 px-4 py-3 border border-border/40">
            <div>
              <p className="text-sm font-medium text-foreground">{t("clearSavedData")}</p>
              <p className="text-xs text-muted-foreground">Removes all your tasks and cached preferences from the database.</p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" disabled={clearLoading}>
                  {clearLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Database className="h-4 w-4 mr-1" />}
                  {t("clear")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <Database className="h-5 w-5 text-destructive" /> Clear All Saved Data?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete <span className="font-semibold text-foreground">all your tasks</span> from the database and clear your local preferences. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    onClick={handleClearData}>
                    Yes, clear everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

          {/* Delete Account */}
          <div className="flex items-center justify-between rounded-lg bg-destructive/10 px-4 py-3 border border-destructive/20">
            <div>
              <p className="text-sm font-medium text-destructive">{t("deleteAccount")}</p>
              <p className="text-xs text-muted-foreground">Permanently removes your account, all tasks, and all data.</p>
            </div>
            <AlertDialog onOpenChange={(open) => { if (!open) setDeleteConfirm(""); }}>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" disabled={deleteLoading}>
                  {deleteLoading ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                  {t("delete")}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="flex items-center gap-2">
                    <ShieldAlert className="h-5 w-5 text-destructive" /> Delete your account?
                  </AlertDialogTitle>
                  <AlertDialogDescription className="space-y-3">
                    <span className="block">This will <span className="font-semibold text-foreground">permanently delete</span> your account and all associated data. There is no way to recover it.</span>
                    <span className="block pt-1">Type <span className="font-mono font-semibold text-foreground">DELETE</span> to confirm:</span>
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Input
                  placeholder="Type DELETE to confirm"
                  value={deleteConfirm}
                  onChange={(e) => setDeleteConfirm(e.target.value)}
                  className="mt-1"
                />
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    disabled={deleteConfirm !== "DELETE" || deleteLoading}
                    onClick={handleDeleteAccount}>
                    {deleteLoading ? "Deleting..." : "Delete my account"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
