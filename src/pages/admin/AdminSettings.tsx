import { useState } from "react";
import { motion } from "framer-motion";
import { Settings, Globe, Bell, Shield, Database, ToggleLeft, ToggleRight, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

function Toggle({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button onClick={onChange} className="transition-transform hover:scale-110">
      {value ? <ToggleRight className="h-6 w-6 text-primary" /> : <ToggleLeft className="h-6 w-6 text-muted-foreground/60" />}
    </button>
  );
}

export default function AdminSettings() {
  const { toast } = useToast();
  const [appName,       setAppName]       = useState("Holiday Tasker");
  const [maintenance,   setMaintenance]   = useState(false);
  const [registration,  setRegistration]  = useState(true);
  const [emailNotif,    setEmailNotif]    = useState(true);
  const [pushNotif,     setPushNotif]     = useState(false);
  const [twoFA,         setTwoFA]         = useState(false);
  const [auditLog,      setAuditLog]      = useState(true);
  const [autoBackup,    setAutoBackup]    = useState(true);
  const [maxUsers,      setMaxUsers]      = useState("1000");

  const save = () => toast({ title: "Settings saved" });

  const Section = ({ title, icon: Icon, children }: { title: string; icon: React.ElementType; children: React.ReactNode }) => (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="rounded-xl bg-muted/40 border border-border p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-primary" /> {title}
      </h3>
      {children}
    </motion.div>
  );

  const Row = ({ label, desc, children }: { label: string; desc?: string; children: React.ReactNode }) => (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <div>
        <p className="text-sm text-white">{label}</p>
        {desc && <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>}
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold font-heading heading-gradient">App Settings</h1>
          <p className="text-sm text-muted-foreground mt-1">Configure global application settings</p>
        </div>
        <Button size="sm" onClick={save} className="gap-2">
          <Save className="h-4 w-4" /> Save All
        </Button>
      </div>

      <Section title="General" icon={Settings}>
        <Row label="App Name" desc="Displayed across the platform">
          <Input value={appName} onChange={e => setAppName(e.target.value)}
            className="w-48 bg-muted/40 border-border text-white text-sm h-8" />
        </Row>
        <Row label="Maintenance Mode" desc="Disable access for regular users">
          <Toggle value={maintenance} onChange={() => setMaintenance(p => !p)} />
        </Row>
        <Row label="User Registration" desc="Allow new users to sign up">
          <Toggle value={registration} onChange={() => setRegistration(p => !p)} />
        </Row>
        <Row label="Max Users" desc="Maximum allowed registered users">
          <Input value={maxUsers} onChange={e => setMaxUsers(e.target.value)}
            className="w-24 bg-muted/40 border-border text-white text-sm h-8" type="number" />
        </Row>
      </Section>

      <Section title="Notifications" icon={Bell}>
        <Row label="Email Notifications" desc="Send system emails to users">
          <Toggle value={emailNotif} onChange={() => setEmailNotif(p => !p)} />
        </Row>
        <Row label="Push Notifications" desc="Browser push alerts">
          <Toggle value={pushNotif} onChange={() => setPushNotif(p => !p)} />
        </Row>
      </Section>

      <Section title="Security" icon={Shield}>
        <Row label="Two-Factor Authentication" desc="Require 2FA for all users">
          <Toggle value={twoFA} onChange={() => setTwoFA(p => !p)} />
        </Row>
        <Row label="Audit Logging" desc="Log all admin actions">
          <Toggle value={auditLog} onChange={() => setAuditLog(p => !p)} />
        </Row>
      </Section>

      <Section title="Data & Backup" icon={Database}>
        <Row label="Auto Backup" desc="Daily automated database backup">
          <Toggle value={autoBackup} onChange={() => setAutoBackup(p => !p)} />
        </Row>
        <Row label="Export Data" desc="Download all platform data as CSV">
          <Button size="sm" variant="outline"
            className="text-xs border-border text-muted-foreground hover:text-white hover:bg-muted">
            Export
          </Button>
        </Row>
      </Section>
    </div>
  );
}

