import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Settings, Bell, ToggleLeft, ToggleRight, Save,
  AlertTriangle, Users, Loader2, RefreshCw, ShieldAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";

type SettingsMap = Record<string, string>;

function Toggle({ value, onChange, disabled }: { value: boolean; onChange: () => void; disabled?: boolean }) {
  return (
    <button onClick={onChange} disabled={disabled}
      className="transition-transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed">
      {value
        ? <ToggleRight className="h-6 w-6 text-primary" />
        : <ToggleLeft  className="h-6 w-6 text-muted-foreground/60" />}
    </button>
  );
}

function Section({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-muted/40 border border-border p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      {children}
    </motion.div>
  );
}

function Row({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div>
        <p className="text-sm text-foreground">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      <div className="shrink-0 ml-4">{children}</div>
    </div>
  );
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [settings,  setSettings]  = useState<SettingsMap>({});
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState(false);
  const [dirty,     setDirty]     = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("app_settings").select("key, value");
    if (data) {
      const map: SettingsMap = {};
      data.forEach(({ key, value }) => { map[key] = value; });
      setSettings(map);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const set = (key: string, value: string) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const toggle = (key: string) => set(key, settings[key] === "true" ? "false" : "true");
  const bool   = (key: string) => settings[key] === "true";

  const saveAll = async () => {
    setSaving(true);
    const rows = Object.entries(settings).map(([key, value]) => ({
      key, value, updated_at: new Date().toISOString(),
    }));
    const { error } = await supabase
      .from("app_settings")
      .upsert(rows, { onConflict: "key" });
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    setDirty(false);
    toast({ title: "✅ Settings saved!", description: "All changes have been applied." });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading heading-gradient">App Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure global application settings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={load} disabled={loading}>
            <RefreshCw className="h-4 w-4" />
          </Button>
          <Button size="sm" onClick={saveAll} disabled={saving || !dirty} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Save All"}
          </Button>
        </div>
      </div>

      {/* Maintenance Mode banner */}
      {bool("maintenance_mode") && (
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3 rounded-xl border border-yellow-500/40 bg-yellow-500/10 px-5 py-4">
          <ShieldAlert className="h-5 w-5 text-yellow-500 shrink-0" />
          <div>
            <p className="text-sm font-semibold text-yellow-600 dark:text-yellow-400">Maintenance Mode is ON</p>
            <p className="text-xs text-muted-foreground">Regular users are currently blocked from accessing the app.</p>
          </div>
        </motion.div>
      )}

      {/* General */}
      <Section title="General" icon={Settings}>
        <Row label="Maintenance Mode" desc="Block all regular users from accessing the app">
          <Toggle value={bool("maintenance_mode")} onChange={() => toggle("maintenance_mode")} />
        </Row>
        <Row label="Allow New Signups" desc="Let new users register accounts">
          <Toggle value={bool("allow_signups")} onChange={() => toggle("allow_signups")} />
        </Row>
        <Row label="Max Tasks Per User" desc="Limit how many tasks each user can create (0 = unlimited)">
          <Input
            type="number"
            min={0}
            value={settings["max_tasks_per_user"] ?? "100"}
            onChange={(e) => set("max_tasks_per_user", e.target.value)}
            className="w-24 h-8 text-sm text-right"
          />
        </Row>
      </Section>

      {/* Notifications */}
      <Section title="Notifications" icon={Bell}>
        <Row label="Email Notifications" desc="Allow the system to send emails to users">
          <Toggle value={bool("email_notifications")} onChange={() => toggle("email_notifications")} />
        </Row>
        <Row label="Push Notifications" desc="Enable browser push alerts">
          <Toggle value={bool("push_notifications")} onChange={() => toggle("push_notifications")} />
        </Row>
      </Section>

      {/* Danger */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
        <h3 className="text-sm font-semibold text-destructive mb-4 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" /> Danger Zone
        </h3>
        <Row label="Force Sign Out All Users" desc="Invalidates all active sessions immediately">
          <Button size="sm" variant="destructive" onClick={async () => {
            // Set force_signout to true — all connected clients will sign out via realtime
            const { error } = await supabase
              .from("app_settings")
              .upsert({ key: "force_signout", value: "true", updated_at: new Date().toISOString() }, { onConflict: "key" });
            if (error) {
              toast({ title: "Failed", description: error.message, variant: "destructive" });
              return;
            }
            // Reset the flag after 3s so it can be triggered again later
            setTimeout(async () => {
              await supabase
                .from("app_settings")
                .upsert({ key: "force_signout", value: "false", updated_at: new Date().toISOString() }, { onConflict: "key" });
            }, 3000);
            toast({ title: "✅ All users signed out", description: "Active sessions have been terminated." });
          }}>
            <Users className="h-4 w-4 mr-1" /> Sign Out All
          </Button>
        </Row>
      </motion.div>
    </div>
  );
}
